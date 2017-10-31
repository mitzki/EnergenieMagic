{
  const http = require('http');
  
  /** Energenie power strip actions */
  const ACTIONS = {
    LOGIN: { PATH: '/login.html', METHOD: 'POST' },
    SET_SOCK_STATE: { PATH: '/energenie.html', METHOD: 'POST' },
    GET_SOCKS: { PATH: '/status.html', METHOD: 'GET' }
  };  
  /** Timeout for logoutTimeoutHandler */
  const LOGOUT_TIMEOUT = 30000;
  
  /** Handling timeout for logout from Energenie power strip. */
  let logoutTimeoutHandler = null;
  /** Information about sockets on Energenie power strip. */
  let sockets = {};
  /** Options to control Energenie power strip. */
  let options = {};

  /**
   * Login to Energenie via http request. Detect if login worked by searching 
   * in the script tag for the sockstates in the response.
   * 
   * @param {Object} postData_ Postdata for overwriting standard from options.
   * @return {Promise} boolean If login was successfull. 
   */
  function login(postData_) {
    return new Promise(function (resolve, reject) {
      let postData = 'pw=' + options.password;
      if (postData_)
        postData = postData_;

      if (logoutTimeoutHandler !== null)
        resolve(true);

      let request = http.request({
        method: ACTIONS.LOGIN.METHOD,
        port: options.port,
        host: options.host,
        path: ACTIONS.LOGIN.PATH,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, function(res) {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (!postData_) {
            // Searching for "var sockstates = [0,0,0,0]" from index.html
            var regexSock = /var sockstates = \[(.*?)\];/;
            var sockContent = regexSock.exec(data);
            if (!sockContent) { 
              reject(new Error('LOGIN_FAILED')); return;
            }
          }

          resolve(true);
        });
      }, function(err) {
        if (!postData_)
          console.error('LOGIN_ERR', err);
        
        if (logoutTimeoutHandler)
          clearTimeout(logoutTimeoutHandler);

        logoutTimeoutHandler = null;
        reject(err);
      });

      request.write(postData);
      request.end();
    });
  }
  
  /**
   * Logout from Energenie via http request. Logout is made by
   * sending a http request to login.html without post data.
   * The logout waits until the TIMEOUT is up to logout from the
   * system.
   * 
   * @return {Promise} boolean If login was successfull. 
   */
  function logout() {
    return new Promise(function (resolve, reject) {
      logoutTimeoutHandler = setTimeout(function() {
        login('')
          .then(function() {
            console.log('LOGOUT');
            clearTimeout(logoutTimeoutHandler);
            logoutTimeoutHandler = null;
            resolve(true);
          }).catch(function(err) {
            console.error('LOGOUT_ERROR', err);
            reject(err);
          });
      }, LOGOUT_TIMEOUT);
    });
  }

  /**
   * Does the http request, collecting the data and return it.
   * 
   * @return {Promise} Collected data from http request.
   */
  function request(action, postData) {
    return new Promise((resolve, reject) => {
      let request = http.request({
        method: action.METHOD,
        port: options.port,
        host: options.host,
        path: action.PATH,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, function(res) {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => { resolve(data); });
      }, function(err) {
        reject(err);
      });

      request.write(postData);
      request.end();
    });
  }

  /**
   * Sending http request to Energenie power stripe. You can use the
   * defined const ACTIONS. Before send the http request it will be checked
   * if the session needs to be refreshed or not. Login/Logout handling.
   * 
   * @param {Enum} action Http-request path and method. 
   * @param {*} postData Data to send. 
   * @return {Promise} Collected data from http request.
   */
  function sendPostRequest(action, postData) {
    return new Promise(function(resolve, reject) { 
      // Checking if login is needed
      if (logoutTimeoutHandler === null)
        login().then(() => {
          request(action, postData).then((data) => {
            resolve(data);
            logout();
          }).catch((err) => {
            reject(err);
            logout();
          });
        });
      else
        request(action, postData).then((data) => {
          resolve(data);
        }).catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Energie Core Class.
   * 
   * @author Michael Kolodziejczyk
   */
  class EnergenieCore {
    
    constructor(options_) {
      options = options_;
    }

    setSocket(id, state) {
      return new Promise((resolve, reject) => {
        if (sockets[id]) {
          state = (state == true || state == '1') ? '1' : '0';
          let postData = id  + '=' + state;
          sendPostRequest(ACTIONS.SET_SOCK_STATE, postData)
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

    getSockets() {
      return new Promise((resolve, reject) => {
        sendPostRequest(ACTIONS.GET_SOCKS, '')
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

            if (logoutTimeoutHandler === null)
              logout();
          
            resolve(sockets);
          }).catch(function(err) {
            console.error('Getting Sockets failed...');
            console.error(err);
            reject(new Error(err));
          });
      });
    }
    
  }

  module.exports = EnergenieCore;
}