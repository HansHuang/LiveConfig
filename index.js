/**
 * Hans Huang @ 8th April, 2017
 * Version 1.1.0
 */

const fs = require('fs')
const path = require('path')

module.exports = liveConfig

/**
 * init config
 * @param {string} configDir config directory name
 * @param {EventEmitter} eventEmitter send or receive events
 * @returns {*} config object
 */
function liveConfig(configDir, eventEmitter) {
    let allConfig = readConfigDir(configDir, eventEmitter)
    let watcher = watchConfigs(configDir, allConfig, eventEmitter)

    eventEmitter && eventEmitter.on('config.stop', () => watcher.close())

    return allConfig
}

function readConfigDir(configDir, eventEmitter) {

    let result = {}

    fs.readdirSync(configDir)
        .filter(f => f.toLowerCase().endsWith('.json'))
        .map(f => path.resolve(configDir, f))
        .map(f => readJsonFile(f, eventEmitter))
        .forEach(s => Object.assign(result, s))

    return result
}

function readJsonFile(filePath, eventEmitter) {

    let result = {}
    try {

        let jsonStr = fs.readFileSync(filePath).toString(),
            configName = path.basename(filePath, '.json')

        result[configName] = JSON.parse(jsonStr)

    } catch (error) {
        eventEmitter && eventEmitter.emit && eventEmitter.emit('config.error', error, path.basename(filePath))
    }

    return result
}

function watchConfigs(dir, config, eventEmitter) {
    return fs.watch(dir, (eventType, filename) => {

        if (filename) {
            if (!filename.endsWith('.json')) return;

            let update = readJsonFile(path.join(dir, filename))
            if (!update) return;

            let key = Object.keys(update)[0]
            if (!key) return;

            if (config.hasOwnProperty(key)) {
                Object.assign(config[key], update[key])
            } else {
                Object.assign(config, update)
            }

            eventEmitter && eventEmitter.emit && eventEmitter.emit('config.updated', filename)

        } else {
            let update = readConfigDir(dir)
            if (!update) return;

            Object.assign(config, update)
            eventEmitter && eventEmitter.emit && eventEmitter.emit('config.allUpdated')
        }
    });
}
