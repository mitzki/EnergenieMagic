{
  const http = require('http');
  const Timer = require('./Timer');

  /** Energenie power strip core actions */
  const CORE_ACTIONS = {
    LOGIN: { PATH: '/login.html', METHOD: 'POST' }
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
  function login(postData_) {
    return new Promise(function (resolve, reject) {
      let postData = 'pw=' + options.password;
      if (postData_)
        postData = postData_;

      if (logoutTimer.stillTicking()) {
        resolve(true); return;
      }

      let request = http.request({
        method: CORE_ACTIONS.LOGIN.METHOD,
        port: options.port,
        host: options.host,
        path: CORE_ACTIONS.LOGIN.PATH,
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
          logout();
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
      logoutTimer.set(() => {
        login('')
          .then(function() {
            console.log('LOGOUT');
            resolve(true);
          }).catch(function(err) {
            console.error('LOGOUT_ERROR', err);
            reject(err);
          });
      });
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
   * @author Michael Kolodziejczyk
   */
  class EnergenieCore {
    
    constructor(options_) {
      options = options_;
    }

    /**
     * Sending http request to Energenie power stripe by using the request
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