{
  /**
   * Sample File.
   * Demonstrating how to change status of sockets of Energenie power strip.
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
    
    power_strip.getSockets()
      .then(function(sockets) {
        let state = true;
        for (id in sockets) {
          power_strip.setSocketState(id, state).then(function(val) {
            console.log(val);
          }).catch(function(err) {
            console.error(new Error(err));
          });
        }
      }).catch(function(err) {
        console.error(new Error(err)); 
      });
  }
}