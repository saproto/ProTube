let screenSetting = enums.SCREEN_SETTINGS.SHOW_DEFAULT;


exports.showOnlyQueue = () => {
    screenSetting = enums.SCREEN_SETTINGS.SHOW_QUEUE;
}


exports.showOnlyPhotos = () => {
    screenSetting = enums.SCREEN_SETTINGS.SHOW_PHOTOS;
}


exports.showNothing = () => {
    screenSetting = enums.SCREEN_SETTINGS.SHOW_NOTHING;
}


exports.showDefault = () => {
    screenSetting = enums.SCREEN_SETTINGS.SHOW_DEFAULT;
}

exports.getCurrentSetting = () => screenSetting;

exports.newScreenSetting = (_newSetting) => {
    let newSetting = parseInt(_newSetting);
    if(newSetting < 0 || newSetting > 3) 
        throw new hardError(`Invalid screen setting!`);
    
    
    screenSetting = newSetting;

    eventbus.emit('new-screen-setting', newSetting);
}