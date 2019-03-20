const path = require('path'),
    fs = require('fs'),
    test = require('ava'),
    events = require('events')

const liveconfig = require('../index')

const myDir = path.resolve(__dirname, '.'),
    myName = 'hans'


test.beforeEach('init test config', t => {
    setConfigFile({ name: myName })
})

test('1. load config', async t => {
    let config = liveconfig(myDir)
    t.is(config.test.name, myName)
})

test.cb('2. realtime update config', t => {
    let eventEmitter = new events.EventEmitter(),
        config = liveconfig(myDir, eventEmitter),
        configTest = config.test

    eventEmitter.on('config.updated', _ => {
        let err = config.test.name !== him
        t.is(configTest, config.test)
        t.end(err)
    })

    let him = 'todd'
    setConfigFile({ name: him })
})


test('3. stop config watching', async t => {
    setConfigFile({ name: myName }, 'foo.json')
    let eventEmitter = new events.EventEmitter(),
        config = liveconfig(myDir, eventEmitter)

    t.is(config.foo.name, myName)

    let him = 'todd'
    setConfigFile({ name: him }, 'foo.json')
    await sleep(100)
    t.is(config.foo.name, him)

    eventEmitter.emit('config.stop')
    setConfigFile({ name: 'no-name' }, 'foo.json')
    await sleep(100)
    t.is(config.foo.name, him)
})


function setConfigFile(target, file) {
    let myFile = path.resolve(myDir, file || 'test.json')
    fs.writeFileSync(myFile, JSON.stringify(target))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
