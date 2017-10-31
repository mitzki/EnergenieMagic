# energenie-magic
Package to get and set states of the energenie power strip sockets.

Tested with Node 8.5.0

## Use it
``` 
npm install --save energenie-magic 
```

## Samples
See in [/samples](/samples) folder for some examples.

### Run
```bash
git clone https://github.com/mitzki/energenie-magic.git
cd energenie-magic
npm install
node .\samples\getPowerStates.js --host <ip-adress/hostname> [--port <port-number> --password <password>]
node .\samples\turnAllSocketsOn.js  --host <ip-adress/hostname> [--port <port-number> --password <password>]
```
## getSockets()
Get information of sockets of the connected power strip.

### Sample Usage
```javascript
power_strip.getSockets().then(function(sockets) {
    console.log(sockets);
}).catch(function(err) {
    console.error(new Error(err)); 
});
```

### Returns
```javascript
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
```

## setSocketState(id, state)
Set socket of power strip. 
+ `id` is the key of the getSockets() result JSON.
+ `state` is a boolean. 

### Sample Usage
```javascript
power_strip.setSocketState('cte1', false).then(function(val) {
    console.log(val);
}).catch(function(err) {
    console.error(new Error(err));
});
```