DOCKER_IMAGE = "mailbox-browser"

.PHONY: web
web:
	@echo "Building web..."
	@cd web && pnpm run build

.PHONY: docker
docker:
	@echo "Building docker..."
	@docker build -t $(DOCKER_IMAGE) .
