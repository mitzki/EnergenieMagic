# energenie-magic
Package to get and set states of the energenie power strip sockets.

Tested with Node 8.5.0 and [EG-PMS2-LAN](https://energenie.com/item.aspx?id=7416).

## Installation
``` 
npm install --save energenie-magic 
```

## Samples
See in [/samples](/samples) folder for some examples. You can try after adding to node_modules with your power strip via cli:

```bash
# Get sockets of power strip
node .\node_modules\enegenie-magic\samples\getSockets --host <ip-adress/hostname> [--port <default: 80> --password <default: ''>]
# Set socket state of power strip 
node .\node_modules\enegenie-magic\samples\setSocket --host <ip-adress/hostname> --id <id> [--port <default: 80> --password <default: ''> --state <default: true>]
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
    console.log(sockets);
}).catch(function(err) {
    console.error(new Error(err)); 
});
```
`sockets` looks like:
```javascript
[{
  host: "192.168.78.79",
  name: "Wohnzimmer",
  sockets: [{
    key: "cte1",
    state: true,
    name: "Socket A"
  }, {
    key: "cte2",
    state: true,
    name: "Socket B"
  }, {
    key: "cte3",
    state: true,
    name: "Socket C"
  }, {
    key: "cte4",
    state: true,
    name: "Socket D"
  }]
}, ...]
```

## setSocketState(powerStripOptions, id, state)
Set socket of power strip.
+ `host`: Hostname or IP-Adress of power strip.
+ `id`: Key/ID of socket.
+ `state`: Bool represents on/off.

```javascript
/* Turning first plug off. */
power_strips.setSocketState('192.168.78.79', 'cte1', false)
  .then(function(val) {
    console.log(val);
  }).catch(function(err) {
    console.error(new Error(err));
  });
```