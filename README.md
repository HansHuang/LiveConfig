# LiveConfig
Read/inject all **json** or **yaml** configs under specific directory, and keep runtime updating

[![NPM version][npm-image]][npm-url]

## Install
```
$ npm install liveconfig -S
```

## Usage

```js
/*
 * there are 2 files in configDir:
 * user.json: {name: 'hans'}
 * system.yaml: domain: 'b.cc'
 */
let config = liveconfig(configDir)
console.log(config.user.name) //'hans'
console.log(config.system.domain) //'b.cc'
// update system.yaml file with new content: domain: a.cc
console.log(config.system.domain) //'a.cc'

// if you want to catch the event, pass me the event emittor
let eventEmitter = new require('events').EventEmitter(),
    config = liveconfig(myDir, eventEmitter)

eventEmitter.on('config.error', filename => {
    console.log(`failed to read config: ${filename}`)
})

// if you want to stop config file watching, emit a "stop" event
// eventEmitter.emit('config.stop')

```


[npm-image]: https://img.shields.io/npm/v/liveconfig.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/liveconfig