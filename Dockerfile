FROM golang:1.24.3@sha256:1bcf8844d2464a6485c87646f9da684610758eb1a2df63c8a6e7ca47c64f8655 AS bff-builder

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

FROM --platform=$BUILDPLATFORM node:24.0.2-alpine3.20@sha256:3ce0ee44c2aa0ef436a24241ce25c590ae457b915ef840b1a423653419e8fc3e AS web-builder

ARG BUILD_VERSION

WORKDIR /app

COPY web ./
RUN npm ci && \
  echo "export const browserVersion = \"${BUILD_VERSION}\"" > src/utils/info.ts && \
  npm run build

FROM alpine:3.21.3@sha256:a8560b36e8b8210634f77d9f7f9efd7ffa463e380b75e2e74aff4511df3ef88c

RUN addgroup -S bff && adduser -S bff -G bff
USER bff

COPY --from=bff-builder --chown=bff:bff /bin/bff /bin/bff
COPY --from=web-builder --chown=bff:bff /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR=/bin/dist
ENV PORT=8070

HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD wget -qO- http://localhost:8070/ping || exit 1

CMD ["/bin/bff"]
