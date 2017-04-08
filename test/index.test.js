const path = require('path'),
    fs = require('fs'),
    test = require('ava').test,
    events = require('events')

const liveconfig = require('../index')

let myDir = path.resolve(__dirname, '.'),
    myName = 'hans'


test('1. load config', async t => {
    let config = await liveconfig(myDir)
    t.is(config.test.name, myName)
})

test.cb('2. realtime update config', t => {
    let eventEmittor = new events.EventEmitter()
    liveconfig(myDir, eventEmittor).then(config => {

        eventEmittor.on('config.updated', _ => {
            let err = config.test.name !== him
            t.end(err)
        })

        let him = 'todd'
        setConfigFile({ name: him })
    })
})


test.beforeEach('init test config', t => {
    setConfigFile({ name: myName })
})

function setConfigFile(target, file) {
    let myFile = path.resolve(myDir, file || 'test.json')
    fs.writeFileSync(myFile, JSON.stringify(target))
}
