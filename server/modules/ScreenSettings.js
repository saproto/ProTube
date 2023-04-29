let screenSetting = enums.SCREEN_SETTINGS.SHOW_DEFAULT;

exports.getCurrentSetting = () => screenSetting;

exports.newScreenSetting = () => {
    screenSetting = (screenSetting + 1) % Object.keys(enums.SCREEN_SETTINGS).length;
    eventBus.emit('new-screen-setting', screenSetting);
}