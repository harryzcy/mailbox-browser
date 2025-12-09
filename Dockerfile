FROM golang:1.25.5@sha256:68ee6dfa91a074c6e62a8af3ff0a427a36a78015778247af4f18398f37a5e91b AS bff-builder

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

FROM --platform=$BUILDPLATFORM node:25.2.1-alpine3.22@sha256:26ded7f450a0ad37241d2ae97ea521a59cb551a1785c8a950f74b0a291ad3aea AS web-builder

ARG BUILD_VERSION

WORKDIR /app

COPY web ./
RUN npm ci && \
  echo "export const browserVersion = \"${BUILD_VERSION}\"" > src/utils/info.ts && \
  npm run build

FROM alpine:3.23.0@sha256:51183f2cfa6320055da30872f211093f9ff1d3cf06f39a0bdb212314c5dc7375

RUN addgroup -S bff && adduser -S bff -G bff
USER bff

COPY --from=bff-builder --chown=bff:bff /bin/bff /bin/bff
COPY --from=web-builder --chown=bff:bff /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR=/bin/dist
ENV PORT=8070

HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD wget -qO- http://localhost:8070/ping || exit 1

CMD ["/bin/bff"]
