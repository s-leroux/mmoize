const Promise = require('bluebird');

module.exports = function(f, options) {
    options = options || {};
    options.size = options.size || 100;

    let my = {
        f: f,
        size: options.size,
        map: new Map(),
    }

    return function(key) {
        const value = my.map.get(key);
        if (typeof(value) !== "undefined")
            return Promise.resolve(value);

        // else
        return Promise.try(function() {
            return my.f(key);
        }).then(value => {
            my.map.set(key, value);
            return value;
        });
    }
}

