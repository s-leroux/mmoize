const debug = require("debug")("mmoize:tests");

const assert = require('chai').assert;

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
