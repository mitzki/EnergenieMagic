{
	const EnergenieMagic = require('energenie-magic');
	const power_stride = new EnergenieMagic({
		password: <energenie password>,
		host: <energenie host name or ip adress>,
		port: <energenie port>
	});
	let sockets = {};
	
	power_stride.getSockets().then(function(sockets_) {
        sockets = sockets_;
      }).catch(function(err) {
        console.error(new Error(err)); 
      });
}
