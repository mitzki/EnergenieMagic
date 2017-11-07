{
  const http = require('http');
  const Timer = require('./Timer');

  /** Energenie power strip core actions */
  const CORE_ACTIONS = {
    LOGIN: { PATH: '/login.html', METHOD: 'POST' },
    LOGOUT: { PATH: '/login.html', METHOD: 'GET' }
  };  
  
  /** Options to control Energenie power strip. */
  let options = {};
  let logoutTimer = new Timer();

  /**
   * Login to Energenie via http request. Detect if login worked by searching 
   * in the script tag for the sockstates in the response.
   * 
   * @param {Object} postData_ Postdata for overwriting standard from options.
   * @return {Promise} boolean If login was successfull. 
   */
  function login() {
    return new Promise(function (resolve, reject) {
      if (logoutTimer.stillTicking()) {
        resolve(true); return;
      }

      request(CORE_ACTIONS.LOGIN, 'pw=' + options.password)
        .then((data) => {
          logout();
          // Searching for "var sockstates = [0,0,0,0]" from index.html
          var regexSock = /var sockstates = \[(.*?)\];/;
          var sockContent = regexSock.exec(data);
          if (!sockContent) { 
            reject(new Error('LOGIN_FAILED')); return;
          }
          resolve(true);
        });
    }).catch((err) => {
      if (!postData_)
        console.error('LOGIN_ERR', err);

      reject(err);
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
    return logoutTimer.set(
      () => {
        request(CORE_ACTIONS.LOGOUT, '')
          .then(function() {
            console.info('LOGOUT');
            return true;
          }).catch(function(err) {
            return new Error('LOGOUT_ERROR', err);
          });
      });
  }

  /**
   * Collecting the data from the http-request and return it.
   * Resetting logout timer while getting data and being requested.
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
        res.on('end', () => { 
          logoutTimer.reset();
          resolve(data); 
        });
      }, function(err) {
        reject(err);
      });
      
      request.write(postData);
      request.end();
    });
  }

  /**
   * Energie Core Class.
   * 
   * Handling the http requests. Holds a session to
   * Energenie strip 30 seconds, before logout. Every
   * time a request is done while the session is still
   * alive the logoutTimeoutHandler will be reset to
   * wait 30 seconds before logging out from power strip.
   * 
   * @author Michael Kolodziejczyk
   */
  class EnergenieCore {
    
    constructor(options_) {
      options = options_;
    }

    /**
     * Sending http request to Energenie power strip by using the request
     * function. 
     * You can use the defined *_ACTIONS ENUMS.
     * 
     * @param {Enum} action Http-request path and method. 
     * @param {Object} postData Data to send. 
     * @return {Promise} Collected data from http request.
     */
    sendPostRequest(action, postData) {
      return new Promise(function(resolve, reject) { 
        login().then(() => {
          request(action, postData).then((data) => {
            resolve(data);
          }).catch((err) => {
            reject(err);
          });
        });
      });
    }    
  }

  module.exports = EnergenieCore;
}