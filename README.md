# energenie-magic
Package to get and set states of the energenie power stripe sockets.

See in /samples folder for some examples.

Tested with Node 8.5.0

## Use it
``` 
npm install --save energenie-magic 
```

## getSockets()
Get information of sockets as JSON

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
```javascript
power_stride.setSocketState('cte1', false).then(function(val) {
    console.log(val);
}).catch(function(err) {
    console.error(new Error(err));
});
```

***
MIT License