.PHONY: run test format lint migrate migrate-new help

run:
	uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload

test:
	pytest tests/ -v

test-cov:
	pytest tests/ -v --cov=app --cov-report=term-missing

format:
	ruff format app/ tests/

lint:
	ruff check app/ tests/

lint-fix:
	ruff check app/ tests/ --fix

migrate:
	alembic upgrade head

migrate-new:
	@read -p "Migration message: " msg; \
	alembic revision --autogenerate -m "$$msg"

migrate-down:
	alembic downgrade -1

db-reset:
	alembic downgrade base
	alembic upgrade head

help:
	@echo "Available commands:"
	@echo "  make run          - Start development server"
	@echo "  make test         - Run test suite"
	@echo "  make test-cov     - Run tests with coverage"
	@echo "  make format       - Format code with ruff"
	@echo "  make lint         - Check code with ruff"
	@echo "  make lint-fix     - Fix linting issues"
	@echo "  make migrate      - Run database migrations"
	@echo "  make migrate-new  - Create new migration"
	@echo "  make migrate-down - Rollback last migration"
	@echo "  make db-reset     - Reset database"
