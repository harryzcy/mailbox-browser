FROM golang:1.23.2@sha256:cc637ce72c1db9586bd461cc5882df5a1c06232fd5dfe211d3b32f79c5a999fc AS bff-builder

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

FROM --platform=$BUILDPLATFORM node:22.10.0-alpine3.20@sha256:c02c668be1cd096d0e7fdd65512570157aec90f98aed917989a0bc9c3609267a AS web-builder

ARG BUILD_VERSION

WORKDIR /app

COPY web ./
RUN npm ci && \
  echo "export const browserVersion = \"${BUILD_VERSION}\"" > src/utils/info.ts && \
  npm run build

FROM alpine:3.20.3@sha256:beefdbd8a1da6d2915566fde36db9db0b524eb737fc57cd1367effd16dc0d06d

RUN addgroup -S bff && adduser -S bff -G bff
USER bff

COPY --from=bff-builder --chown=bff:bff /bin/bff /bin/bff
COPY --from=web-builder --chown=bff:bff /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR=/bin/dist
ENV PORT=8070

HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD wget -qO- http://localhost:8070/ping || exit 1

CMD ["/bin/bff"]
