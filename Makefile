BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -v node_modules)
JAVASCRIPT := $(TYPESCRIPT:%.ts=%.js)

all: $(JAVASCRIPT)

$(BIN)/tsc:
	npm install

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

compile:
	$(BIN)/tsc -d

clean:
	rm -f $(JAVASCRIPT) $(TYPESCRIPT:%.ts=%.d.ts)

test: $(JAVASCRIPT)
	mocha --compilers js:babel-core/register tests/
