/**
 * Hans Huang @ 8th April, 2017
 * Version 1.1.0
 */

const fs = require('fs')
const path = require('path')

module.exports = liveConfig

function liveConfig(configDir, eventEmitter) {
    let allConfig = readConfigDir(configDir, eventEmitter)
    watchConfigs(configDir, allConfig, eventEmitter)
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
    fs.watch(dir, (eventType, filename) => {

        if (filename) {
            if (!filename.endsWith('.json')) return;

            let update = readJsonFile(path.join(dir, filename))
            if (!update) return;

            Object.assign(config, update)
            eventEmitter && eventEmitter.emit && eventEmitter.emit('config.updated', filename)

        } else {
            let update = readConfigDir(dir)
            if (!update) return;

            Object.assign(config, update)
            eventEmitter && eventEmitter.emit && eventEmitter.emit('config.allUpdated')
        }
    });
}
