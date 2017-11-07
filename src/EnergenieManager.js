{
  const EnergeniePowerStrip = require('./EnergeniePowerStrip');
  
  /** Socket information of power strips  */
  let powerStrips = [];
  /** Socket options of power strips */
  let powerStripsOptions = [];
  
  /**
   * Checking each strip if there were a number
   * of found sockets.
   * 
   * @return {bool} Have we found all socks?
   */
  function checkIfAllStripsAreRequested() {
    for (let i = 0; i < powerStripsOptions.length; i++)
      if (!powerStrips[i]['sockets'])
        return false;

    return true;
  }

  /**
   * Getting options of a power strip.
   * 
   * @param {string} host Host name or IP-Adress of power strip
   * @return {Object} Options of selected power strip. 
   */
  function getStrip(host) {
    for (pKey in powerStripsOptions)
      if (powerStripsOptions[pKey].host === host)
        return powerStripsOptions[pKey];

    return null;
  }

  /**
   * Energenie Manager Class.
   * 
   * Handling a couple of Energenie power strips.
   * 
   * @author Michael Kolodziejczyk
   */
  class EnergenieManager {
    
    /**
     * Constructor.
     * 
     * @param {Array} hosts Array of power strip hosts objects.  
     */
    constructor(hosts) {
      if (hosts) powerStripsOptions = hosts;
    }
    
    /**
     * Getting sock states.
     * 
     * @return {Promise} Sockets of all power strips.
     */
    getSocketStates() {      
      return new Promise((resolve, reject) => {
        for (var i = 0; i < powerStripsOptions.length; i++) {
          let energenieMagic = new EnergeniePowerStrip(powerStripsOptions[i]);
          energenieMagic.getSockets().then((sockets) => {
            powerStrips.push(sockets);
            if (checkIfAllStripsAreRequested())
              resolve(powerStrips);
          }).catch(() => {
            if (checkIfAllStripsAreRequested())
              resolve(powerStrips);
          });
        }
      });
    }

    /**
     * Setting sock state of Energenie plug stripe by using id and state.
     * The power stripe will be selected via host adress or IP.
     * 
     * @param {String} host Host or IP-Adress.
     * @param {String} id ID of the socket.
     * @param {boolean} state Future state of the socket.
     * @return {Promise} {boolean} Was changing the socket state, okay?
     */
    setSocketState(stripOptions, id, state) {
      return new Promise((resolve, reject) => {       
        let strip = new EnergeniePowerStrip(stripOptions);
        resolve(strip.setSocketState(id, state));
      });
    }

    /**
     * For use set socket action via express. e.g.
     *  app.get(ENERGENIE_PREFIX + '/setState', 
     *    energenie.setSocketStateViaRequest);
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
     * For use get sockets action via express. e.g.
     *  app.get(ENERGENIE_PREFIX + '/getSocks', 
     *    energenie.getSocketsViaRequest);
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