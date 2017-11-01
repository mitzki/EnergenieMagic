{
  const EnergenieMagic = require('./EnergenieMagic');
  
  let powerStrips = [{ host: '192.168.78.73', port: 80, pw: '' }];

  function checkIfAllStripsAreRequested() {
    for (let pKey in powerStrips)
      if (powerStrips[pKey].sockets === null)
        return false;

    return true;
  }

  class EnergenieManager {
    
    constructor(hosts) {
      if (hosts) powerStrips = hosts;

      powerStrips.forEach((powerStrip) => {
        powerStrip.sockets = null;
      });
    }
    
    getSocketStates() {      
      return new Promise((resolve, reject) => {
        for (var hKey in powerStrips) {
          let host = powerStrips[hKey];
          let energenieMagic = new EnergenieMagic(host);
          energenieMagic.getSockets().then((sockets) => {
            host.sockets = sockets;
            if (checkIfAllStripsAreRequested())
              resolve(powerStrips);
          }).catch(() => {
            host.sockets = [];  
            if (checkIfAllStripsAreRequested())
              resolve(powerStrips);
          });
        }
      });
    }

    setState() {

    }
  } 

  module.exports = EnergenieManager;
}