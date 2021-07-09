const path = require('path'),
    fs = require('fs'),
    test = require('ava'),
    events = require('events'),
    yaml = require('js-yaml')

const liveconfig = require('../index')

const myDir = path.join(__dirname, 'config'),
    myName = 'hans'


test.beforeEach('init test config', t => {
    setConfigFile({ name: myName })
    setConfigFile({ obj: { name: 'Jan', task: 'coding' } }, 'baz.yaml')
})

test.afterEach('reset config', t => {
    setConfigFile({ obj: { name: 'Jan', task: 'coding' } }, 'baz.yaml')
})

test('1. load config', async t => {
    let config = liveconfig(myDir)
    t.is(config.test.name, myName)

    t.is(config.baz.obj.task, 'coding')
    t.is(config.bar.seq[2], 'Earth')
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

test('4. load yaml file', async t => {
    await sleep(300);
    const eventEmitter = new events.EventEmitter(),
        config = liveconfig(myDir, eventEmitter)

    setConfigFile({ obj: { name: myName, arr: [2] } }, 'baz.yaml')
    await new Promise(res => {
        eventEmitter.on('config.updated', _ => {
            t.is(config.baz.obj.name, myName)
            t.true(Array.isArray(config.baz.obj.arr))
            res()
        })
    })
})


// test('5. restore deleted config dir', async t => {
//     await sleep(400);
//     const eventEmitter = new events.EventEmitter(),
//         config = liveconfig(myDir, eventEmitter)

//     t.is(config.baz.obj.task, 'coding')

//     setConfigFile({ obj: { name: myName, task: 'coding2' } }, 'baz.yaml')
//     await sleep(100);
//     t.is(config.baz.obj.task, 'coding2');

//     const newDir = path.join(__dirname, 'config2')
//     fs.renameSync(myDir, newDir)
//     fs.writeFileSync(path.join(newDir, 'baz.yaml'),
//         yaml.dump({ obj: { name: myName, task: 'coding3' } }));
//     await sleep(1100);
//     fs.renameSync(newDir, myDir)

//     await sleep(1100);
//     t.is(config.baz.obj.task, 'coding3')
// })


function setConfigFile(target, file) {
    let myFile = path.resolve(myDir, file || 'test.json')
    if (myFile.toLowerCase().endsWith('.json')) {
        fs.writeFileSync(myFile, JSON.stringify(target))
    } else {
        fs.writeFileSync(myFile, yaml.dump(target))
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
