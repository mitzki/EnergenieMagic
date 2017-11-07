{
  /**
   * Sample File.
   * Demonstrating how to change status of sockets of Energenie power strip.
   * 
   * @author Michael Kolodziejczyk
   */
  const EnergenieMagic = require('../src/EnergenieManager.js');
  
  function getArgVByKey(key) {
    let args = process.argv;
    for (let arg in args)
      if (args[arg].trim() === key)
        if (args.length > parseInt(arg) + 1)
          return args[parseInt(arg) + 1];

    switch(key) {
    case '--port':  return 80;
    case '--state': return true;
    }

    return '';
  }

  if (process.argv.length < 5) {
    console.error(new Error('NOT_ENOUGH_ARGUMENTS'));
  } else {
    const powerStripOptions = {
      password: getArgVByKey('--password'),
      host: getArgVByKey('--host'),
      port: parseInt(getArgVByKey('--port'))
    };
    const powerStrip = new EnergenieMagic(powerStripOptions);

    powerStrip.setSocketState(
      powerStripOptions, 
      getArgVByKey('--id'), 
      getArgVByKey('--state'))
      .then(() => {
        powerStrip.getSocketStates().then(function(sockets) {
          console.log(sockets);
        }).catch(function(err) {
          console.error(new Error(err)); 
        });
      }).catch((err) => {
        console.error(err);
      });
  }
}