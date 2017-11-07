{
  /** Timeout for logoutTimeoutHandler (default: 30 seconds) */
  let TIMEOUT = 30000;
  /** Handling timeout for logout from Energenie power strip. */
  let timeoutHandler = null;
  /** Function that should be executed */
  let func = null;
  /** Class context */
  let that;
  
  /**
   * Timer Class.
   * 
   * Handling execution timeout of a function. 
   * 
   * @author Michael Kolodziejczyk
   */
  class Timer {

    constructor(timeout) {
      if (timeout) TIMEOUT = timeout;
      
      that = this;
    }

    /**
     * Checking if timeouthandler is still active.
     * 
     * @return {bool} Is timeoutHandler still alive?
     */
    stillTicking() {
      if (timeoutHandler !== null)
        return true;

      return false;
    }

    /**
     * Setting function that should be executed after the set
     * timeout.
     * 
     * @param {Function} func_ 
     * @return {bool} Was function added to timeoutHandler?
     */
    set(func_) {
      if (timeoutHandler === null) {
        func = func_;
        timeoutHandler = setTimeout(() => {
          func.call();
          that.clear();
        }, TIMEOUT);

        return true;
      }

      return false;
    }

    /**
     * Resetting timeoutHandler. Resetting only when timeoutHandler
     * is active. 
     * 
     * @return {bool} Was reset?
     */
    reset() {
      let func_ = func;
      
      if (timeoutHandler === null)
        return false;

      that.clear();
      that.set(func_);
      
      return true;
    }

    /**
     * Clearing timeout and set function to null.
     */
    clear() {
      clearTimeout(timeoutHandler);
      timeoutHandler = null;
      func = null;
    }
  }

  module.exports = Timer;
}