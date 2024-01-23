FROM golang:1.21.6-alpine3.19@sha256:29fd37e32a229819bf9eb230c4577eb95f18982abeec1b521ae881e6ef251457 as bff-builder

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

FROM node:20.11.0-alpine3.19@sha256:8e6a472eb9742f4f486ca9ef13321b7fc2e54f2f60814f339eeda2aff3037573 as web-builder

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

FROM alpine:3.19.0@sha256:51b67269f354137895d43f3b3d810bfacd3945438e94dc5ac55fdac340352f48

COPY --from=bff-builder /bin/bff /bin/bff
COPY --from=web-builder /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR /bin/dist
ENV PORT 8070

CMD ["/bin/bff"]
