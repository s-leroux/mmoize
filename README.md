mmoize
======

A simple cache/single-argument memoization library.


[![Build Status](https://travis-ci.org/s-leroux/mmoize.png?branch=master)](https://travis-ci.org/s-leroux/mmoize)

## Installation

    npm install --save mmoize
    

## API

### const f = mmoize(function, [options])

Create a new cache instance.
The first argument is a function used to create missing value from
a key.

`option.size` is the maximum cache size

### f.get(key)
Return a promise that will resolve to the value associated with `key`.

If the value is not already in cache, the function passed at cache creation time is invoked to get it.
Newly created values are always stored in the cache. If there isn't enough room left,
the least recently used values is discarded.

## Example

### Basic usage
```
    const Promise = require('bluebird');
    const mmoize = require('mmoize');
    const assert = require('assert');
    const readFile = Promise.promisify(require("fs").readFile);

    let n = 0;
    const f = mmoize((key) => { n += 1; return readFile(key, "utf8"); });

    // Will actually read the file only once
    f("./test/data/a")
        .then(console.log)
        .then(() => assert.equal(n, 1));

    f("./test/data/a")
        .then(console.log)
        .then(() => assert.equal(n, 1));

    f("./test/data/a")
        .then(console.log)
        .then(() => assert.equal(n, 1));
```


### Concurent access (typically used with promise-returning functions)
```
    const Promise = require('bluebird');
    const mmoize = require('mmoize');
    const readFile = Promise.promisify(require("fs").readFile);

    const f = mmoize((key) => readFile(key, "utf8"), {size: 3 });

    Promise.all([
        f("./test/data/a"),
        f("./test/data/a"),
        f("./test/data/b"),
        f("./test/data/c"),
        f("./test/data/d"),
        f("./test/data/d"),
        f("./test/data/c"),
        f("./test/data/b"),
        f("./test/data/a"),
    ]).then(console.log);
```

## Node version
Require NodeJS >= v7.0
Tested with v7.0, v7.6 and v8.9
 
## License 

(The MIT License)

Copyright (c) 2018 [Sylvain Leroux](mailto:sylvain@chicoree.fr)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
