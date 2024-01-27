FROM golang:1.21.6-alpine3.19@sha256:a49e5101be836613e432f0911b66a47dd48b50ebcd720717f70a30968237789e as bff-builder

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

FROM node:20.11.0-alpine3.19@sha256:a2bb114e1f87c3411ca78de61c2100685eba176481355e32899210c7f51f98d4 as web-builder

ARG BUILD_VERSION

WORKDIR /app

COPY web ./
# if dist exists, skip the build
RUN [[ -d dist ]] && echo "build exists, skipping" || \
  ( \
  echo "build does not exist, building" && \
  npm ci && \
  echo "export const browserVersion = \"${BUILD_VERSION}\"" > src/utils/info.ts && \
  npm run build \
  )

FROM alpine:3.19.1@sha256:c5b1261d6d3e43071626931fc004f70149baeba2c8ec672bd4f27761f8e1ad6b

COPY --from=bff-builder /bin/bff /bin/bff
COPY --from=web-builder /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR /bin/dist
ENV PORT 8070

CMD ["/bin/bff"]
