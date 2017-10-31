{
  const url = require('url');
  const EnergenieCore = require('./EnergenieCore');
  
  /** EnergenieCore Class */
  let energenieCore;
  /** Class context */
  let that;
  
  /**
   * Energenie Magic Class.
   *
   * @author Michael Kolodziejczyk
   */
  class EnergenieMagic {

    constructor(options) {
      energenieCore = new EnergenieCore(options);
      that = this;
    }

    /**
     * Setting sock state of Energenie plug stripe by using id and state.
     * 
     * @param {String} id ID of the socket.
     * @param {boolean} state Future state of the socket.
     */
    setSocketState(id, state) {
      return energenieCore.setSocket(id, state);
    }

    /**
     * Getting sock states. Reading response and searching inside the
     * <script></script>-tag for the states and the names array.
     */
    getSockets() {
      return energenieCore.getSockets();
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
      let id = query.key;
      let state = query.state;
      
      that.setSocketState(id, state).then(function(val) {
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
      that.getSockets().then(function(sockets) {
        res.status(200).send(JSON.stringify(sockets));
      }).catch(function(err) {
        res.status(500).send(new Error(err)); 
      });
    }
  }

  module.exports = EnergenieMagic;
}