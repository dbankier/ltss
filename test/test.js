var ltss = require("../ltss/ltss"),
    fs   = require("fs"),
    assert = require("assert");

describe("variables test", function() {
  it("should parse", function(done) {
    ltss.compileFile('./test/variables.ltss',function(err,data) {
      assert.equal(data, fs.readFileSync('./test/variables.tss').toString());
      done();
    });
  });
});

describe("mixins test", function() {
  it("should parse", function(done) {
    ltss.compileFile('./test/mixin.ltss',function(err,data) {
      assert.equal(data, fs.readFileSync('./test/mixin.tss').toString());
      done();
    });
  });
});

describe("include test", function() {
  it("should parse", function(done) {
    ltss.compileFile('./test/include.ltss',function(err,data) {
      assert.equal(data, fs.readFileSync('./test/include.tss').toString());
      done();
    });
  });
});

describe("combined test", function() {
  it("should parse", function(done) {
    ltss.compileFile('./test/test.ltss',function(err,data) {
      assert.equal(data, fs.readFileSync('./test/test.tss').toString());
      done();
    });
  });
});

