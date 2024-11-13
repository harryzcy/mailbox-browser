FROM golang:1.23.3@sha256:c2d828fd49c47ed2b9192d2dbffed83052d8a21af465056d732c3de0d756f217 AS bff-builder

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

FROM --platform=$BUILDPLATFORM node:23.1.0-alpine3.20@sha256:340cd3926b5116aae1207d6ca1e444d1009aad687c4ad37aa3afbe8a3db591d5 AS web-builder

ARG BUILD_VERSION

WORKDIR /app

COPY web ./
RUN npm ci && \
  echo "export const browserVersion = \"${BUILD_VERSION}\"" > src/utils/info.ts && \
  npm run build

FROM alpine:3.20.3@sha256:1e42bbe2508154c9126d48c2b8a75420c3544343bf86fd041fb7527e017a4b4a

RUN addgroup -S bff && adduser -S bff -G bff
USER bff

COPY --from=bff-builder --chown=bff:bff /bin/bff /bin/bff
COPY --from=web-builder --chown=bff:bff /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR=/bin/dist
ENV PORT=8070

HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD wget -qO- http://localhost:8070/ping || exit 1

CMD ["/bin/bff"]
