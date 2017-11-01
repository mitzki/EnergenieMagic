{
  const url = require('url');
  const EnergenieCore = require('./EnergenieCore');
  
  const SOCKET_ACTIONS = {
    SET_SOCK_STATE: { PATH: '/energenie.html', METHOD: 'POST' },
    GET_SOCKS: { PATH: '/status.html', METHOD: 'GET' }
  }
  /** EnergenieCore Class */
  let energenieCore;
  /** Information about sockets on Energenie power strip. */
  let sockets = {};
  /** Class context */
  let that;
  
  /**
   * Energenie Magic Class.
   *
   * @author Michael Kolodziejczyk
   */
  class EnergeniePowerStrip {

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
      //return energenieCore.setSocket(id, state);
      return new Promise((resolve, reject) => {
        if (sockets[id]) {
          state = (state == true || state == '1') ? '1' : '0';
          let postData = id  + '=' + state;
          energenieCore.sendPostRequest(SOCKET_ACTIONS.SET_SOCK_STATE, postData)
            .then((val) => {     
              console.info('Updating ' + id + ' to ' + state + ' finished.');
              resolve(true);
            }).catch((err) => {
              console.error('Updating ' + id + ' to ' + state + ' failed.');
              reject(new Error(err));
            });
        }
      });
    }

    /**
     * Getting sock states. Reading response and searching via regex
     * inside the <script></script>-tag for the states and the names 
     * array.
     */
    getSockets() {
      //return energenieCore.getSockets();
      return new Promise((resolve, reject) => {
        energenieCore.sendPostRequest(SOCKET_ACTIONS.GET_SOCKS, '')
          .then(function(res) {
            // Extracting sockstates
            let data = res.substring(
              res.indexOf('<script>') + 8, res.indexOf('</script>'));
            let regexSock = /var ctl = \[(.*?)\];/;
            let sockContent = regexSock.exec(data);
            if (sockContent === null) {
              reject(new Error('SOCKET_ARRAY_NOT_FOUND'));
              return;
            }
            
            let regexSockName = /var sock_names = \[(.*?)\];/;
            let sockNameContent = regexSockName.exec(data);
            if (sockNameContent === null) {
              reject(new Error('SOCKET_NAME_ARRAY_NOT_FOUND'));
              return;  
            }

            let sockNames = sockNameContent[1].split(',');
            for (let sKey in sockNames) {
              let sockName = sockNames[sKey].trim();
              sockNames[sKey] = sockName.substr(1, sockName.length - 2).trim();
            }

            let sockStates = sockContent[1].split(',');
            for (let i = 0; i < sockStates.length; i++) {
              sockets['cte' + (i+1)] = {
                key: 'cte' + (i+1),
                name: sockNames[i],
                state: (sockStates[i] === '1') ? true : false
              };
            }

            console.info('GOT_SOCKETS');
            console.info(sockets);
            resolve(sockets);
          }).catch(function(err) {
            console.error('Getting Sockets failed...');
            console.error(err);
            reject(new Error(err));
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

  module.exports = EnergeniePowerStrip;
}