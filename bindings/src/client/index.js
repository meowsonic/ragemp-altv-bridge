import mp from '../shared/mp.js';
import alt from 'alt-client';
import natives from 'natives';
import '../shared/index.js';
import './statics/Events.js';
import './entities/index.js';
import './natives.js';
import './extraNatives.js';
import './statics/index.js'
import './polyfill.js';

function populateModule(moduleObject) {
    globalThis.module = moduleObject;
    Object.defineProperty(globalThis, 'exports', {
        get: () => {
            return moduleObject.exports;
        },
        set: (value) => {
            moduleObject.exports = value
        },
        configurable: true
    });
    globalThis.__filepath = moduleObject.__path;
    globalThis.__dirname = moduleObject.__path.replace(/\/[^/]+$/, '');
}

globalThis.require = function (path) {
    path = path.replaceAll('./', '');
    if (!path.startsWith('/')) path = '/' + path;
    if (path.endsWith('/')) path = path.substring(0, path.length - 1);
    if (!alt.File.exists(path)) {
        if (alt.File.exists(path + '.js')) path += '.js';
        else if (alt.File.exists(path + '/index.js')) path += '/index.js';
        else throw new Error('Cannot find file ' + path);
    }

    const oldModuleObject = globalThis.module;
    const moduleObject = { exports: {}, __path: path };
    populateModule(moduleObject);
    const content = alt.File.read(path);
    [eval][0](content);
    if (oldModuleObject) populateModule(oldModuleObject);
    return moduleObject.exports;
}

globalThis.global = globalThis;

globalThis.mp = mp;

console.log('Emitting playerJoin');
alt.emitServer(mp.prefix + 'playerJoin');

alt.everyTick(() => {
    natives.drawRect(0, 0, 0, 0, 0, 0, 0, 0, 0, false);
})

const AsyncFunction = (async function () {}).constructor;
alt.on('consoleCommand', async (cmd, ...args) => {
    if (cmd !== 'eval') return;
    console.log(await (new AsyncFunction('alt', 'natives', args.join(' ')))(alt, natives));
})
