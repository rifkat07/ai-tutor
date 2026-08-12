.PHONY: dev build down migrate test

dev:
	docker-compose up --build

down:
	docker-compose down

migrate:
	docker-compose exec backend alembic upgrade head

test:
	docker-compose exec backend pytest