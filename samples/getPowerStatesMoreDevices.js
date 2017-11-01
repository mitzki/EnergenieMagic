{
  /**
   * Sample File.
   * Demonstrating how to get status information from Energenie power strip.
   * 
   * @author Michael Kolodziejczyk
   */
  const EnergenieManager = require('../src/EnergenieManager.js');
  
  const powerStrips = new EnergenieManager([{
    host: '192.168.78.79',
    port: 80,
    password: ''
  }]);

  powerStrips.getSocketStates().then(function(sockets) {
    console.log(sockets);
  }).catch(function(err) {
    console.error(new Error(err)); 
  });
}
