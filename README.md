# energenie-magic
Package to get and set states of the energenie power strip sockets.

Tested with Node 8.5.0 and [EG-PMS2-LAN](https://energenie.com/item.aspx?id=7416).

## Installation
``` 
npm install --save energenie-magic 
```

## Samples
See in [/samples](/samples) folder for some examples.

```bash
node .\node_modules\enegenie-magic\samples\getSockets --host <string | ip-adress/hostname> [--port <number | default: 80> --password <string | default: ''>]

node .\node_modules\enegenie-magic\samples\setSocket --host <string | ip-adress/hostname> [--port <number | default: 80> --password <string | default: ''> --state <bool | default: true>]
```

## Usage

```javascript
const EnergenieManager = require('energenie-magic');
  /* Add your power strips */
  let powerStrips = new EnergenieManager([
    {
      host: '192.168.78.79',
      port: 80,
      password: ''
    }
  ]);
```
### getSockets()
Get information of sockets of the connected power strip.

```javascript
power_strips.getSockets().then(function(sockets) {
    console.info(sockets);
}).catch(function(err) {
    console.error(new Error(err)); 
});
```
`sockets` looks like:
```javascript
host: '192.168.78.79',
name: 'Living Room',
sockets: [
  {
    "cte1": {
      "key": "cte1",
      "name": "Socket A",
      "state": true
    },
    "cte2": {
      "key": "cte2",
      "name": "Socket B",
      "state": false
    },
    "cte3": {
      "key": "cte3",
      "name": "Socket C",
      "state": true
    },  
    "cte4": {
      "key": "cte4",
      "name": "Socket D",
      "state": false
    }
  }
]
```

## setSocketState(host, id, state)
Set socket of power strip. 
+ `host` Host adress of power strip.
+ `id` is the key of the getSockets() result JSON.
+ `state` is a boolean. 

```javascript
/* Turning first plug off. */
power_strips.setSocketState('192.168.78.79', 'cte1', false).then(function(val) {
    console.info(val);
}).catch(function(err) {
    console.error(new Error(err));
});
```