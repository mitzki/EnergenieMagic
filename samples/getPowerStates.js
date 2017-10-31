{
	const EnergenieMagic = require('../src/EnergenieMagic.js');
	const power_stride = new EnergenieMagic({
		password: '', // replace
		host: '192.168.78.79', // replace
		port: 80 // replace
	});
	let sockets = {};
	
	power_stride.getSockets().then(function(sockets_) {
        sockets = sockets_;
      }).catch(function(err) {
        console.error(new Error(err)); 
      });
}
