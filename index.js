/**
 * Hans Huang @ 8th April, 2017
 * Version 1.1.0
 * 
 * Version 3.0.0 @ Mar 28th 2021: support YAML config
 */

const fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml')


module.exports = liveConfig

/**
 * init config
 * @param {string} configDir config directory name
 * @param {EventEmitter} eventEmitter send or receive events
 * @returns {*} config object
 */
function liveConfig(configDir, eventEmitter) {
    const allConfig = readConfigDir(configDir, eventEmitter);
    let watcher = watchConfigs(configDir, allConfig, eventEmitter);

    eventEmitter && eventEmitter.on('config.stop', () => {
        watcher && watcher.close() && (watcher = null);
    });

    return allConfig
}

function readConfigDir(configDir, eventEmitter) {
    return fs.readdirSync(configDir)
        .map(f => path.resolve(configDir, f))
        .map(f => readConfigFile(f, eventEmitter))
        .reduce((pre, cur) => ({ ...pre, ...cur }), {})
}

function readConfigFile(filePath, eventEmitter) {

    const result = {},
        parsers = {
            'YAML': yaml.load,
            "JSON": JSON.parse
        },
        fileType = getFileType(filePath)

    if (!fileType || !parsers[fileType]) return result;

    console.log(`${new Date().toLocaleString()} - Reading Config File: ${filePath}`);
    try {
        const configStr = fs.readFileSync(filePath).toString(),
            configName = path.basename(filePath).split('.')[0]

        result[configName] = parsers[fileType](configStr)

    } catch (error) {
        eventEmitter && eventEmitter.emit && eventEmitter.emit('config.error', error, path.basename(filePath))
    }
    return result
}

function watchConfigs(dir, config, eventEmitter) {
    return fs.watch(dir, (eventType, filename) => {
        // console.log(`${new Date().toLocaleString()} - dir: ${dir}, eventType: ${eventType}, filename: ${filename}`);

        if (filename) {
            const fileType = getFileType(filename)
            if (!fileType) return;

            let update = readConfigFile(path.join(dir, filename), eventEmitter)
            if (!update) return;

            let key = Object.keys(update)[0]
            if (!key) return;

            if (config.hasOwnProperty(key)) {
                Object.assign(config[key], update[key])
            } else {
                Object.assign(config, update)
            }

            eventEmitter && eventEmitter.emit && eventEmitter.emit('config.updated', filename)
            return;
        }

        updateWholeConfig(dir, config, eventEmitter);
    });
}

function updateWholeConfig(dir, config, eventEmitter) {
    let update = readConfigDir(dir)
    if (!update) return;

    Object.assign(config, update)
    eventEmitter && eventEmitter.emit && eventEmitter.emit('config.updated')
}

function getFileType(filename) {
    if (!filename) return ''
    if (path.extname(filename.toLowerCase()) == '.json') return 'JSON';
    if (['.yml', '.yaml'].some(x => filename.toLowerCase().endsWith(x))) return 'YAML';
    return ''
}
