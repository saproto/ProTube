let showQueue = true;
let showPhotos = true;

exports.getCurrentSetting = () => {
  return {
    showQueue: showQueue,
    showPhotos: showPhotos,
  };
};

exports.toggleQueueVisibility = () => {
  showQueue = !showQueue;
  eventBus.emit("queue-photos-visibility-changed", this.getCurrentSetting());
  return enums.SUCCESS;
};

exports.togglePhotosVisibility = () => {
  showPhotos = !showPhotos;
  eventBus.emit("queue-photos-visibility-changed", this.getCurrentSetting());
  return enums.SUCCESS;
};
