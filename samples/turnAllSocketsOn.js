{
	const EnergenieMagic = require('../src/EnergenieMagic.js');
	const power_stride = new EnergenieMagic({
		password: '', // replace
		host: '192.168.78.79', // replace
		port: 80 // replace
	});
	
	power_stride.getSockets()
		.then(function(sockets) {
			let state = true;
				for (id in sockets) {
					power_stride.setSocketState(id, state).then(function(val) {
						console.log(val);
						}).catch(function(err) {
						console.error(new Error(err));
						});
				}
		}).catch(function(err) {
			console.error(new Error(err)); 
		});
}