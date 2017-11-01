{
  /** Timeout for logoutTimeoutHandler */
  const TIMEOUT = 10000; //30000;
  
  /** Handling timeout for logout from Energenie power strip. */
  let timeoutHandler = null;
  let func = null;
  let that;
  
  class Timer {

    constructor() {
      that = this;
    }

    stillTicking() {
      if (timeoutHandler !== null)
        return true;

      return false;
    }

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

    reset() {
      let func_ = func;
      
      if (timeoutHandler === null)
        return false;

      that.clear();
      that.set(func_);
      
      return true;
    }

    clear() {
      clearTimeout(timeoutHandler);
      timeoutHandler = null;
      func = null;
    }

  }

  module.exports = Timer;
}