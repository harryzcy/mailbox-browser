FROM golang:1.25.1@sha256:8305f5fa8ea63c7b5bc85bd223ccc62941f852318ebfbd22f53bbd0b358c07e1 AS bff-builder

ARG BUILD_VERSION
ARG BUILD_COMMIT
ARG BUILD_DATE

WORKDIR /go/src/bff
COPY ./bff ./

RUN set -ex && \
  go mod download && \
  go build \
  -ldflags=" \
  -X 'github.com/harryzcy/mailbox-browser/bff/transport/rest/miscendpoint.version=${BUILD_VERSION}' \
  -X 'github.com/harryzcy/mailbox-browser/bff/transport/rest/miscendpoint.commit=${BUILD_COMMIT}' \
  -X 'github.com/harryzcy/mailbox-browser/bff/transport/rest/miscendpoint.buildDate=${BUILD_DATE}' \
  -w -s" \
  -o /bin/bff

FROM --platform=$BUILDPLATFORM node:24.8.0-alpine3.22@sha256:3e843c608bb5232f39ecb2b25e41214b958b0795914707374c8acc28487dea17 AS web-builder

ARG BUILD_VERSION

WORKDIR /app

COPY web ./
RUN npm ci && \
  echo "export const browserVersion = \"${BUILD_VERSION}\"" > src/utils/info.ts && \
  npm run build

FROM alpine:3.22.1@sha256:4bcff63911fcb4448bd4fdacec207030997caf25e9bea4045fa6c8c44de311d1

RUN addgroup -S bff && adduser -S bff -G bff
USER bff

COPY --from=bff-builder --chown=bff:bff /bin/bff /bin/bff
COPY --from=web-builder --chown=bff:bff /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR=/bin/dist
ENV PORT=8070

HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD wget -qO- http://localhost:8070/ping || exit 1

CMD ["/bin/bff"]
