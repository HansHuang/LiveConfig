/**
 * Hans Huang @ 8th April, 2017
 * Version 1.1.0
 */

const fs = require('fs')
const path = require('path')

module.exports = liveConfig

async function liveConfig(configDir, eventEmittor) {
    let allConfig = await Promise.resolve(injectConfigDir(configDir, eventEmittor))
    watchConfigs(configDir, allConfig, eventEmittor)
    return allConfig
}

function injectConfigDir(configDir, eventEmittor) {
    return new Promise((resolve, _) => {
        fs.readdir(configDir, async (err, items) => {

            let pmsList = items.filter(f => {
                return f.endsWith('.json')
            }).map(f => {
                let filePath = path.resolve(configDir, f)
                return injectJsonFile(filePath, eventEmittor)
            })

            let results = {};
            (await Promise.all(pmsList)).filter(data => {
                return data
            }).forEach(data => {
                Object.assign(results, data)
            })

            resolve(results)
        })
    })
}

function injectJsonFile(filePath, eventEmittor) {
    return new Promise((resolve, _) => {
        fs.readFile(filePath, (err, fileData) => {
            let result = {}
            if (err) {
                eventEmittor && eventEmittor.emit && eventEmittor.emit('config.error', err, path.basename(filePath))
            } else {
                let configName = path.basename(filePath, '.json')
                result[configName] = JSON.parse(fileData)
            }
            resolve(result)
        })
    })
}

function watchConfigs(dir, config, eventEmittor) {
    fs.watch(dir, (eventType, filename) => {
        if (filename) {
            if (!filename.endsWith('.json')) return;

            injectJsonFile(path.join(dir, filename)).then(s => {
                if (!s) return;

                Object.assign(config, s)
                eventEmittor && eventEmittor.emit && eventEmittor.emit('config.updated', filename)
            })
        } else {
            injectConfigDir(dir).then(s => {
                if (!s) return;

                Object.assign(config, s)
                eventEmittor && eventEmittor.emit && eventEmittor.emit('config.allUpdated')
            })
        }
    });
}
