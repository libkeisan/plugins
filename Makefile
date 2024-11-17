.PHONY: all clean

SRC := $(shell for dir in ./src/*; do \
	   if [ -f "$${dir}/index.js" ]; then \
	     echo "$$(basename $${dir})"; \
	   fi; \
	done)

all: $(SRC:%=dist/%.js) $(SRC:%=dist/%.mjs)

dist/%.js: src/%/index.js
	@mkdir -p $(dir $@)
	esbuild --bundle --minify --format=iife --global-name=plugin --outfile=$@ $<

dist/%.mjs: src/%/index.js
	@mkdir -p $(dir $@)
	esbuild --bundle --minify --format=esm --outfile=$@ $<

clean:
	rm -rf dist
