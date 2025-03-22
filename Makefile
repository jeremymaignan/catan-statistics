.PHONY: lint

lint:
	black . services/
	isort . services/
