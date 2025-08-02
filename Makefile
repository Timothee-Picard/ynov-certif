# Détection de la commande docker-compose
DOCKER_COMPOSE = $(shell if docker compose version > /dev/null 2>&1; then echo "docker compose"; else echo "docker-compose"; fi)

# Full project initialization
.PHONY: init
init:
	@echo "Initializing project"
	@make init-backend
	# @make init-frontend

# Backend initialization (NestJS)
.PHONY: init-backend
init-backend:
	@echo "Initializing backend (NestJS)"
	@if [ -d "backend/node_modules" ]; then \
		echo "Removing existing node_modules in backend"; \
		rm -rf backend/node_modules; \
	else \
		echo "No node_modules to remove in backend"; \
	fi
	@cd backend && npm ci
	@if [ -f "backend/.env" ]; then \
		echo ".env file already exists in backend, please adapt it if necessary"; \
	elif [ -f "backend/.env.example" ]; then \
		cp backend/.env.example backend/.env; \
		echo "Copied .env.example to .env in backend"; \
	else \
		echo "No .env.example found in backend, please create a .env file manually"; \
	fi
	@echo "Backend initialized!"

# Frontend initialization (Next.js)
.PHONY: init-frontend
init-frontend:
	@echo "Initializing frontend (Next.js)"
	@if [ -d "frontend/node_modules" ]; then \
		echo "Removing existing node_modules in frontend"; \
		rm -rf frontend/node_modules; \
	else \
		echo "No node_modules to remove in frontend"; \
	fi
	@cd frontend && npm ci
	@if [ -f "frontend/.env" ]; then \
		echo ".env file already exists in frontend, please adapt it if necessary"; \
	elif [ -f "frontend/.env.example" ]; then \
		cp frontend/.env.example frontend/.env; \
		echo "Copied .env.example to .env in frontend"; \
	else \
		echo "No .env.example found in frontend, please create a .env file manually"; \
	fi
	@echo "Frontend initialized!"

.PHONY: up
up:
	@echo "Starting development environment"
	$(DOCKER_COMPOSE)  up -d
	@echo "Development environment started"


.PHONY: up-build
up-build:
	@echo "Starting development environment"
	$(DOCKER_COMPOSE)  up -d --build
	@echo "Development environment started"

.PHONY: down
down:
	@echo "Stopping development environment"
	$(DOCKER_COMPOSE)  down
	@echo "Development environment stopped"

# LOGS WITH SERVICE parameter
.PHONY: logs
logs:
	@echo "Fetching logs for service: $(service)"
	@if [ -z "$(service)" ]; then $(DOCKER_COMPOSE) logs -f $(service); exit 1; fi
	$(DOCKER_COMPOSE) logs -f $(service)