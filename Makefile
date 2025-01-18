.PHONY: dev dev-docker

dev:
	cd frontend && npm run dev & \
	cd backend && ./gradlew bootRun

dev-docker:
	docker-compose -f docker-compose.dev.yml up