const Promise = require('bluebird');
const debug = require("debug")("mmoize:tests");

const assert = require('chai').assert;
const id = (x) => x;

/* temporary patch for https://github.com/chaijs/chai/issues/1116 */
assert.fail = require('assert').fail;

describe("module", function() {
    let mmoize = null;

    it("should be loadable", function() {
        mmoize = require("../index.js");
    });

    it("should export as a function", function() {
        assert.typeOf(mmoize, 'function');
    });
});

describe("mmoize", function() {
    const mmoize = require("../index.js");

    it("should return a promise-like object", function() {
        const f = mmoize(id);
        assert.typeOf(f, 'function');

        const p = f("a");
        assert.typeOf(p, 'object');
        assert.typeOf(p.then, 'function');
        assert.typeOf(p.catch, 'function');
    });

    it("should invoke the contructor for missing values", function() {
        let n = 0;
        const f = mmoize((key) => n += 1);
        return f("a").then((v) => {
            assert.equal(v, 1);
            assert.equal(n, 1);
        });
    });

    it("should NOT invoke the contructor for cached values", function() {
        let n = 0;
        const f = mmoize((key) => n += 1);
        return f("a").then(() => f("a")).then((v) => {
            assert.equal(v, 1);
            assert.equal(n, 1);
        });
    });

    it("should cache several values", function() {
        let n = 0;
        const f = mmoize((key) => n += 1);

        return Promise.all([
            f("a"),
            f("b"),
            f("c"),
            f("d"),
            f("a"),
            f("b"),
            f("c"),
            f("d"),
        ]).then((values) => {
            assert.equal(n, 4);
            assert.deepEqual(values, [1,2,3,4,1,2,3,4]);
        });
    });

    it("should limit cache size (worst case)", function() {
        let n = 0;
        const f = mmoize((key) => n += 1, {size:3});

        return Promise.all([
            f("a"),
            f("b"),
            f("c"),
            f("d"),
            f("a"),
            f("b"),
            f("c"),
            f("d"),
        ]).then((values) => {
            assert.equal(n, 8);
            assert.deepEqual(values, [1,2,3,4,5,6,7,8]);
        });
    });

    it("should limit cache size", function() {
        let n = 0;
        const f = mmoize((key) => n += 1, {size:3});

        return Promise.all([
            f("a"),
            f("b"),
            f("c"),
            f("d"),
            f("d"),
            f("c"),
            f("b"),
            f("a"),
        ]).then((values) => {
            assert.equal(n, 5);
            assert.deepEqual(values, [1,2,3,4,4,3,2,5]);
        });
    });

    it("should handle interleaved/concurrent access", function() {
        const readFile = Promise.promisify(require("fs").readFile);

        let n = 0;
        const f = mmoize((key) => { n += 1; return readFile(key, "utf8"); }, {size:3});

        return Promise.all([
            f("./test/data/a"),
            f("./test/data/a"),
            f("./test/data/b"),
            f("./test/data/c"),
            f("./test/data/d"),
            f("./test/data/d"),
            f("./test/data/c"),
            f("./test/data/b"),
            f("./test/data/a"),
        ]).then((values) => {
            assert.equal(n, 5);
            assert.deepEqual(values, ["A","A","B","C","D","D","C","B","A"]);
        });
    });
});
