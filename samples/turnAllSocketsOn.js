{
	const EnergenieMagic = require('energenie-magic');
	const power_stride = new EnergenieMagic({
		password: <energenie password>,
		host: <energenie host name or ip adress>,
		port: <energenie port>
	});
	
	power_stride.getSockets().then(function(sockets) {
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