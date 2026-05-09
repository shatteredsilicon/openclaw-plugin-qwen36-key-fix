.PHONY: build clean test

build:
	npm run build

clean:
	rm -rf dist/ node_modules/ package-lock.json

test: build
	node --check dist/index.js

all: clean build test
