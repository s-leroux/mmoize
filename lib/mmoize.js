const debug = require('debug')("mmoize:core");
const Promise = require('bluebird');

module.exports = function(f, options) {
    options = options || {};
    options.size = options.size || 100;

    let my = {
        f: f,
        size: options.size,
        map: new Map(),
        head: null,
        tail: null,
        unlink: function(node) {
            debug("unlink", node);
            // remove the node from the linked list
            if (node.prev)
                node.prev.next = node.next;
            else
                my.head = node.next;

            if (node.next)
                node.next.prev = node.prev;
            else
                my.tail = node.prev;
        },
        push: function(node) {
            debug("push", node);
            // put node back at the end
            node.prev = my.tail;
            if (node.prev)
                node.prev.next = node;
            else
                my.head = node;

            node.next = null;
            my.tail = node;
        },
        discard: function() {
            // discard the head node
            if (my.head) {
                my.map.delete(my.head.key);
                my.head.key = my.head.value = undefined; // helps with GC
                if (my.head.next)
                    my.head.next.prev = null;
                my.head = my.head.next;
            }
        },
    }

    return function(key) {
        const node = my.map.get(key);
        debug("Found", node, "for", key);
        debug("Map size =", my.map.size);
        if (node) {
            if (my.tail !== node) {
                my.unlink(node);
                my.push(node);
            }
            return Promise.resolve(node.value);
        }

        // else
        return Promise.try(function() { // I assume Promise.try to be a synchronous call (it is in Bluebird)
            const value = my.f(key);

            if (my.map.size >= my.size) {
                my.discard();
            }
            const node = { key: key, value: value };
            my.push(node);
            my.map.set(key, node);

            return value;
        });
    }
}

