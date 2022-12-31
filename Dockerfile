FROM golang:1.19.4-alpine3.17 as bff-builder

WORKDIR /go/src/bff
COPY ./bff ./
RUN go mod download

RUN go build -o /bin/bff

FROM node:19.3.0-alpine3.16 as web-builder

WORKDIR /app

ENV NPM_VERSION 9.2.0
ENV PNPM_VERSION 7.21.0
RUN npm install -g npm@${NPM_VERSION} && npm -g install pnpm@${PNPM_VERSION}

COPY web ./
RUN pnpm fetch && \
  pnpm install -r -P --offline && \
  pnpm run build

FROM alpine:3.17.0

COPY --from=bff-builder /bin/bff /bin/bff
COPY --from=web-builder /app/dist /bin/dist

ENV MODE=prod
ENV STATIC_DIR /bin/dist
ENV PORT 8070

CMD ["/bin/bff"]
