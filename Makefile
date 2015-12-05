BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -v node_modules)
JAVASCRIPT := $(TYPESCRIPT:%.ts=%.js)

all: $(JAVASCRIPT)

$(BIN)/tsc $(BIN)/mocha:
	npm install

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

compile:
	$(BIN)/tsc -d

clean:
	rm -f $(JAVASCRIPT) $(TYPESCRIPT:%.ts=%.d.ts)

test: $(JAVASCRIPT)
	$(BIN)/mocha --compilers js:babel-core/register tests/
