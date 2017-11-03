{
  const EnergeniePowerStrip = require('./EnergeniePowerStrip');
  
  let powerStrips = [{ host: '192.168.78.73', port: 80, pw: '' }];

  function checkIfAllStripsAreRequested() {
    for (let pKey in powerStrips)
      if (powerStrips[pKey].sockets === null)
        return false;

    return true;
  }

  function getStrip(host) {
    for (pKey in powerStrips)
      if (powerStrips[pKey].host === host)
        return powerStrips[pKey];

    return null;
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
          let energenieMagic = new EnergeniePowerStrip(host);
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

    setSocketState(host, id, state) {
      return new Promise((resolve, reject) => {
        let stripOptions = getStrip(host);
        if (stripOptions === null) {
          resolve(false);
          return;
        }
        
        let strip = new EnergeniePowerStrip(stripOptions);
        strip.setSocketState(id, state).then(() => {
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      });
    }

    /**
     * For use set socket action via express.
     * 
     * @param {Http.request} req 
     * @param {Http.response} res 
     */
    setSocketStateViaRequest(req, res) {
      let url_parts = url.parse(req.url, true);
      let query = url_parts.query;
      let host = query.host;      
      let id = query.key;
      let state = query.state;
      
      this.setSocketState(host, id, state).then(function(val) {
        res.status(200).send(true);
      }).catch(function(err) {
        res.status(500).send(new Error(err));
      });
    }

    /**
     * For use get sockets action via express.
     * 
     * @param {Http.request} req 
     * @param {Http.response} res 
     */
    getSocketsViaRequest(req, res) {
      this.getSocketStates().then(function(sockets) {
        res.status(200).send(JSON.stringify(sockets));
      }).catch(function(err) {
        res.status(500).send(new Error(err)); 
      });
    }
  } 

  module.exports = EnergenieManager;
}