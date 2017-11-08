{
  const url = require('url');
  const EnergenieCore = require('./EnergenieCore');
  
  /** @type {Enum} Socket Actions */
  const SOCKET_ACTIONS = {
    SET_SOCK_STATE: { PATH: '/energenie.html', METHOD: 'POST' },
    GET_SOCKS: { PATH: '/status.html', METHOD: 'GET' }
  };
  /** EnergenieCore Class */
  let energenieCore;
  /** Power strip name */
  let name = '';
  /** Information about sockets on Energenie power strip. */
  let sockets = {};
  /** Options: host, password & port */
  let options = {};
  /** Class context */
  let that;

  /**
   * Converting JSON path to JS-Array
   * 
   * @param {JSON} json json to convert to array.
   * @return {Array} json as array. 
   */
  function json2array(json){
    var arr = [];
    var jKeys = Object.keys(json);
    for (let jCnt = 0; jCnt < jKeys.length; jCnt++)
      arr.push(json[jKeys[jCnt]]);

    return arr;
  }

  /**
   * Grabbing power strip name from header in body tag.
   * 
   * @param {String} bodyData <body>(.*)</body>
   */
  function grabPowerStripName(bodyData) {
    let regexStripName = /<div id="header"><h2>(.*?)<\/h2><\/div>/;
    let regexStripNameContent = regexStripName.exec(bodyData);
    if (regexStripNameContent != null)
      name = regexStripNameContent[1].trim();
  }

  /**
   * Grabbing names of sockets of power strip.
   * 
   * @param {String} scriptData <script>(.*)</script>
   */
  function grabSockNames(scriptData) {
    let regexSockName = /var sock_names = \[(.*?)\];/;
    let sockNameContent = regexSockName.exec(scriptData);
    let sockNames = null;
    
    if (sockNameContent === null) {
      console.error(new Error('SOCKET_NAME_ARRAY_NOT_FOUND'));
      return null;  
    }

    /** Adding found sock names */
    sockNames = sockNameContent[1].split(',');
    for (let i = 0; i < sockNames.length; i++) {
      let sockName = sockNames[i].trim();
      let key = 'cte' + (i+1);
      if (!sockets[key]) sockets[key] = {};
      sockets[key]['name'] = 
        sockName.substr(1, sockName.length - 2).trim();     
    }
  }

  /**
   * Grabbing states of sockets of power strip.
   * 
   * @param {String} scriptData <script>(.*)</script>
   */
  function grabSockStates(scriptData) {
    let regexSock = /var ctl = \[(.*?)\];/;
    let sockContent = regexSock.exec(scriptData);
    if (sockContent === null) {
      console.error(new Error('SOCKET_ARRAY_NOT_FOUND'));
      return null;
    }

    /** Adding found key & state */
    let sockStates = sockContent[1].split(',');
    for (let i = 0; i < sockStates.length; i++) {
      let key = 'cte' + (i+1);
      if (!sockets[key]) sockets[key] = {};
      sockets[key]['key'] = 'cte' + (i+1);
      sockets[key]['state'] = (sockStates[i] === '1') ? true : false;
    }
  }

  /**
   * Energenie Magic Class.
   *
   * @author Michael Kolodziejczyk
   */
  class EnergeniePowerStrip {

    constructor(options_) {
      options = options_;
      energenieCore = new EnergenieCore(options);
      that = this;
    }

    /**
     * Setting sock state of Energenie plug stripe by using id and state.
     * 
     * @param {String} id ID of the socket.
     * @param {boolean} state Future state of the socket.
     * @return {Promise} {boolean} Was changing the socket state, okay?
     */
    setSocketState(id, state) {
      return new Promise((resolve, reject) => {
        that.getSockets().then(() => {
          if (sockets[id]) {
            state = (state == true || state == '1') ? '1' : '0';
            let postscriptData = id  + '=' + state;
            energenieCore.sendPostRequest(
              SOCKET_ACTIONS.SET_SOCK_STATE, postscriptData)
              .then((val) => {     
                console.info('Updating ' + id + ' to ' + state + ' finished.');
                resolve(true);
              }).catch((err) => {
                console.error('Updating ' + id + ' to ' + state + ' failed.');
                reject(new Error(err));
              });
          }
        });
      });
    }

    /**
     * Getting sock states. Reading response and searching via regex
     * inside the <script></script>-tag for the states and the names 
     * array.
     * 
     * @return {Promise} Sockets of power strip.
     */
    getSockets() {
      return new Promise((resolve, reject) => {
        energenieCore.sendPostRequest(SOCKET_ACTIONS.GET_SOCKS, '')
          .then(function(res) {
            /** Script data of index.html */
            let scriptData = res.substring(
              res.indexOf('<script>') + 8, res.indexOf('</script>'));
            /** Body data of index.html */
            let bodyData = res.substring(
              res.indexOf('<body>') + 6, res.indexOf('</body>')
            );
            
            /* Grabbing information from request */
            grabSockStates(scriptData);
            grabSockNames(scriptData);
            grabPowerStripName(bodyData);

            let socks = {
              host: options.host,
              name: name,
              sockets: json2array(sockets)
            };

            resolve(socks);
          }).catch(function(err) {
            console.error('Getting Sockets failed...');
            console.error(err);
            reject(new Error(err));
          });
      });
    }
  }

  module.exports = EnergeniePowerStrip;
}