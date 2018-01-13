# LiveConfig
Read/inject all json configs under specific directory, and keep runtime updating

[![NPM version][npm-image]][npm-url]

## Install
```
$ npm install liveconfig
```

## Usage

```js

//json file name: 'user.json', content: {name: 'hans'}
let config = await liveconfig(configDir)
console.log(config.user.name) //'hans'
// or
liveconfig(configDir).then(config => {
    console.log(config.user.name)
})

// if you want to catch the event, pass me the event emittor
let eventEmittor = new require('events').EventEmitter()
let config = await liveconfig(myDir, eventEmittor)
eventEmittor.on('config.error', filename => {
    console.log(`failed to read config: ${filename}`)
})
```

[npm-image]: https://img.shields.io/npm/v/liveconfig.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/liveconfig