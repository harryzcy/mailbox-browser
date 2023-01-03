FROM golang:1.19.4-alpine3.17 as bff-builder

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
      " \
      -o /bin/bff

FROM node:18.12.1-alpine3.17 as web-builder

WORKDIR /app

ENV NPM_VERSION 9.2.0
ENV PNPM_VERSION 7.21.0
RUN npm install -g npm@${NPM_VERSION} && npm -g install pnpm@${PNPM_VERSION}

COPY web ./
RUN pnpm fetch && \
  pnpm install -r --offline && \
  pnpm run build

FROM alpine:3.17.0

COPY --from=bff-builder /bin/bff /bin/bff
COPY --from=web-builder /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR /bin/dist
ENV PORT 8070

CMD ["/bin/bff"]
