/* global alt */

const mp = {
    prefix: globalThis.overrideBridgePrefix ?? '$bridge$'
};

mp.trigger = (event, ...args) => {
    alt.emit(mp.prefix + 'event', event, ...args);
};

const handlers = {};

mp.events = {};

mp.events.add = function (event, fn) {
    if (!(event in handlers)) handlers[event] = new Set;
    handlers[event].add(fn);
};

mp.events.remove = function(event, fn) {
    if (!(event in handlers)) return;
    handlers[event].delete(fn);
};

alt.on(mp.prefix + 'event', (event, ...args) => {
    if (!(event in handlers)) return;
    for (const handler of handlers[event]) handler(...args);
});

globalThis.mp = mp;

alt.on(mp.prefix + 'eval', (code) => {
    [eval][0](code);
});

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

docReady(() => {
    alt.emit(mp.prefix + 'browserDomReady');
});