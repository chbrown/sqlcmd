BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -v node_modules | grep -v promise.d.ts)
JAVASCRIPT := $(TYPESCRIPT:%.ts=%.js)

all: $(JAVASCRIPT) .gitignore .npmignore

$(BIN)/tsc $(BIN)/mocha:
	npm install

%.js %.d.ts: %.ts $(BIN)/tsc
	$(BIN)/tsc -d

clean:
	rm -f $(JAVASCRIPT) $(TYPESCRIPT:%.ts=%.d.ts)

.npmignore: tsconfig.json
	echo $(TYPESCRIPT) .travis.yml CHANGELOG.md Makefile tsconfig.json | tr ' ' '\n' > $@

.gitignore: tsconfig.json
	echo $(JAVASCRIPT) $(TYPESCRIPT:%.ts=%.d.ts) | tr ' ' '\n' > $@
