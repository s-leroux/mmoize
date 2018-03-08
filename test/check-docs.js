const debug = require("debug")("mmoize:doc");
const assert = require('chai').assert;
const vm = require("vm");


describe("README examples", function() {
    it("should pass", function() {
        const FNAME = "./README.md";

        const lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('./README.md')
        });

        let incode = false;
        let code = "";
        let linenum = 0;
        let lineOffset = 0;

        lineReader.on('line', function (line) {
            linenum += 1;

            if (line.trim() === '```') {
                incode = !incode;

                if (incode)
                    lineOffset = linenum;
                else {
                    vm.runInNewContext(code, {
                        require: (id) => ((id) === "mmoize") ? require('../index.js') : require(id),
                        console: console,
                    }, {
                        filename: FNAME,
                        lineOffset: lineOffset,
                        displayErrors: true,
                        timeout: 500,
                    });
                    code = "";
                }
            }
            else if (incode) {
                code += line;
                code += "\n";
            }
        });
    });
});
