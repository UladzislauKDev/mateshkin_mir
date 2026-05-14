.PHONY: dev build preview install clean

dev:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

install:
	npm install

clean:
	rm -rf dist node_modules
