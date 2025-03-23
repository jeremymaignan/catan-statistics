.PHONY: lint clean

lint:
	black . services/*
	isort . services/*
	# mypy . services/

clean:
	find . | grep -E "(/__pycache__)" | xargs rm -rf