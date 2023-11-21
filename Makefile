DOCKER_IMAGE = "mailbox-browser"

BUILD_COMMIT = $(shell git rev-parse --short HEAD)
BUILD_DATE = $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_VERSION = $(shell git describe --tags --always)

ARG_BUILD_COMMIT = --build-arg BUILD_COMMIT=$(BUILD_COMMIT)
ARG_BUILD_DATE = --build-arg BUILD_DATE=$(BUILD_DATE)
ARG_BUILD_VERSION = --build-arg BUILD_VERSION=$(BUILD_VERSION)
DOCKER_BUILD_ARGS = $(ARG_BUILD_COMMIT) $(ARG_BUILD_DATE) $(ARG_BUILD_VERSION)

WRANGLER_ARGS := $(if $(CF_PROJECT_NAME),--project-name $(CF_PROJECT_NAME),)

.PHONY: all
all: web docker

.PHONY: web
web:
	@echo "Building web..."
	@echo "export const browserVersion = \"$(BUILD_VERSION)\"" > web/src/utils/info.ts
	@cd web && npm ci && npm run build

.PHONY: docker
docker:
	@echo "Building docker..."
	@echo "Build commit: $(DOCKER_BUILD_ARGS)"
	@docker build $(DOCKER_BUILD_ARGS) -t $(DOCKER_IMAGE) .

.PHONY: build-cloudflare
build-cloudflare:
	@cp -r web/dist cloudflare/
	@echo "export const BUILD_VERSION = \"$(BUILD_VERSION)\"" > cloudflare/src/buildInfo.ts
	@echo "export const BUILD_COMMIT = \"$(BUILD_COMMIT)\"" >> cloudflare/src/buildInfo.ts
	@echo "export const BUILD_DATE = \"$(BUILD_DATE)\"" >> cloudflare/src/buildInfo.ts
	@cd cloudflare && npm ci

.PHONY: build-cloudflare
cloudflare: web
	@echo "Deploying to Cloudflare..."
	@cd cloudflare && npx wrangler pages deploy dist $(WRANGLER_ARGS)
