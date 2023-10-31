FROM golang:1.21.3-alpine3.18 as bff-builder

ARG BUILD_VERSION
ARG BUILD_COMMIT
ARG BUILD_DATE

WORKDIR /go/src/bff
COPY ./bff ./

RUN set -ex && \
  go mod download && \
  go build \
  -ldflags=" \
  -X 'github.com/harryzcy/mailbox-browser/bff/transport/rest/misc.version=${BUILD_VERSION}' \
  -X 'github.com/harryzcy/mailbox-browser/bff/transport/rest/misc.commit=${BUILD_COMMIT}' \
  -X 'github.com/harryzcy/mailbox-browser/bff/transport/rest/misc.buildDate=${BUILD_DATE}' \
  -w -s" \
  -o /bin/bff

FROM node:20.9.0-alpine3.18 as web-builder

ARG BUILD_VERSION

WORKDIR /app

COPY web ./
RUN [[ -d dist ]] && echo "build exists, skipping"
RUN [[ -d dist ]] || npm ci && \
  echo "export const browserVersion = \"${BUILD_VERSION}\"" > src/utils/info.ts && \
  npm run build

FROM alpine:3.18.4

COPY --from=bff-builder /bin/bff /bin/bff
COPY --from=web-builder /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR /bin/dist
ENV PORT 8070

CMD ["/bin/bff"]
