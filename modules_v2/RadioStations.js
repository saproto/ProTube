const fetch = require('node-fetch');

let allRadioStations = [];
const FAIL = false;

exports.getAllRadioStations = () => allRadioStations;

// needs to be changed with randomness/sufficiently large interval to prevent ip ban
setInterval(async () => {
    await updateRadioStations
}, 1800*1000);

async function updateRadioStations(){
    try {
        const response = await fetch('https://www.nederland.fm/common/radio/zenders/nederland.js');
        const data = await response.text();
        allRadioStations = JSON.parse(data.split(' = ')[1]).items;
    } catch(e) {
        logger.serverError("Error at updating radio stations!");
    }
}
  
// check if the radio we're trying to set is really valid
exports.validateRadioStation = (radiostationId) => {
    let foundStation = FAIL;
    allRadioStations.forEach((station) => {
        if(radiostationId === station.z) foundStation = station;
    });
    return foundStation;
}

updateRadioStations();

// maybe migrate to a neatehr solution using tunein's api{ http://api.radiotime.com&render=json }