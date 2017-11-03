{
  /**
   * Sample File.
   * Demonstrating how to get status information from Energenie power strip.
   * 
   * @author Michael Kolodziejczyk
   */
  const EnergenieMagic = require('../src/EnergeniePowerStrip.js');
  
  function getArgVByKey(key) {
    let args = process.argv;
    for (let arg in args)
      if (args[arg].trim() === key)
        if (args.length > parseInt(arg) + 1)
          return args[parseInt(arg) + 1];

    if (key == '--port')
      return 80;

    return '';
  }

  if (process.argv.length < 3) {
    console.error(new Error('NOT_ENOUGH_ARGUMENTS'));
  } else {
    const power_strip = new EnergenieMagic({
      password: getArgVByKey('--password'),
      host: getArgVByKey('--host'),
      port: getArgVByKey('--port')
    });
    let sockets = {};

    power_strip.getSockets().then(function(sockets_) {
      sockets = sockets_;
    }).catch(function(err) {
      console.error(new Error(err)); 
    });
  }
}
