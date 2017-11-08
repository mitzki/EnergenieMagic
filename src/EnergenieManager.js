{
  const url = require('url');
  const EnergeniePowerStrip = require('./EnergeniePowerStrip');
  
  /** Socket information of power strips  */
  let powerStrips = [];
  /** Socket options of power strips */
  let powerStripsOptions = [];
  /** Class context */
  let that;

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
   * Checking if the powerstrip was already added.
   * 
   * @param {String} powerStripID Power strip count.
   * @return {true | number}  True if should be updated, socket count if update.
   */
  function shouldBeAddedOrUpdated(powerStripID) {
    for (let sCnt = 0; sCnt < powerStrips.length; sCnt++)
      if (powerStrips[sCnt].host === powerStripsOptions[powerStripID].host)
        return sCnt;

    return true;
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

      that = this;
    }
    
    /**
     * Getting sock states.
     * 
     * @return {Promise} Sockets of all power strips.
     */
    getSocketStates() {  
      return new Promise((resolve, reject) => {
        for (var pCnt = 0; pCnt < powerStripsOptions.length; pCnt++) {
          let powerStripID = pCnt;
          let energenieMagic = new EnergeniePowerStrip(powerStripsOptions[pCnt]);
          energenieMagic.getSockets().then((sockets) => {
            let pUpdateKey = shouldBeAddedOrUpdated();
            if (pUpdateKey === true)
              powerStrips.push(sockets);
            else
              powerStrips[pUpdateKey] = sockets;
              
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
     * Setting sock state of Energenie plug strip by using id and state.
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
     * app.get('/setSocket', energenie.setSocketStateViaRequest);
     * 
     * call via http://your-ip/setSocket?
     *  host=<host>&port=<port>&password=<password>&id=<id>&state=<state>
     * 
     * @param {Http.request} req 
     * @param {Http.response} res 
     */
    setSocketStateViaRequest(req, res) {
      let url_parts = url.parse(req.url, true);
      let query = url_parts.query;
      let host = query.host;      
      let stripOptions = getStrip(host);

      that.setSocketState(stripOptions, query.key, query.state)
        .then(function(val) {
          res.status(200).send(true);
        }).catch(function(err) {
          res.status(500).send(new Error(err));
        });
    }

    /**
     * For use get sockets action via express. e.g.
     * app.get('/getSockets', energenie.getSocketsViaRequest);
     * 
     * call via http://your-ip/getSockets
     * 
     * @param {Http.request} req 
     * @param {Http.response} res 
     */
    getSocketsViaRequest(req, res) {
      that.getSocketStates().then(function(sockets) {
        res.status(200).send(JSON.stringify(sockets));
      }).catch(function(err) {
        res.status(500).send(new Error(err)); 
      });
    }
  }

  module.exports = EnergenieManager;
}