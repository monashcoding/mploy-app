.PHONY: dev dev-docker

dev:
	docker compose -f docker-compose.dev.yml up

dev-clean:
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.dev.yml up --build