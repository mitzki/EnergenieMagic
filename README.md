# energenie-magic
Package to get and set states of the energenie power stripe sockets.

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
# UPDATING IP ADRESS, PASSWORD AND PORT IN SAMPLES FILES FOR YOUR ENVIRONMENT
# GET ALL STATES
node .\samples\getPowerStates.js
# TURN ALL SOCKETS ON
node .\samples\turnAllSocketsOn.js
```
## getSockets()
Get information of sockets.

### Sample Usage
```javascript
power_stride.getSockets().then(function(sockets) {
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
Set socket of power stride. 
+ `id` is the key of the getSockets() result JSON.
+ `state` is a boolean. 

### Sample Usage
```javascript
power_stride.setSocketState('cte1', false).then(function(val) {
    console.log(val);
}).catch(function(err) {
    console.error(new Error(err));
});
```

***
MIT License