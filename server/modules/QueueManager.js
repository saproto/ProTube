const { isEmpty } = require("lodash");
const { format_hh_mm_ss } = require("../utils/time-formatter");

let queue = [];
let currentVideo = {};
const self = this;

exports.getQueue = () => queue;
exports.isQueueEmpty = () => queue.length <= 0;
exports.getCurrentVideo = () => currentVideo;

//Calculate the total duration of the playlist and return it
exports.getTotalDurationFormatted = () => {
  return format_hh_mm_ss(self.getTotalDuration());
};

exports.getTotalDuration = () => {
  let sum = 0;
  queue.forEach((video) => (sum += video.duration));
  return sum;
};

//Add a video to the queue
exports.addFair = (video) => {
  if (findDoppelganger(video)) throw new softError("Video already in queue!!");
  // check for nr of videos in queue if not an admin
  if (!video.user.admin) {
    let videoCount = 0;
    for (const vid of queue) {
      videoCount += vid.user.id === video.user.id;
    }
    if (videoCount >= parseInt(process.env.USER_MAX_VIDEOS_IN_QUEUE)) {
      throw new softError("Video limit in the queue reached!");
    }
  }
  performFairAdd(video);
  return enums.SUCCESS;
};

// Add multiple videos at once (playlist eg)
exports.addAllFair = (videos) => {
  let partiallyAdded = false;
  for (const video of videos) {
    try {
      self.addFair(video);
    } catch (e) {
      partiallyAdded = true;
    }
  }
  if (partiallyAdded)
    throw new softError("Not all videos were added to the queue!");
  return enums.SUCCESS;
};

//Add a video to the first position of the queue
exports.addToTop = (video) => {
  const doppelganger = findDoppelganger(video);

  // Found a double! Remove the video from the queue
  if (doppelganger) queue.splice(queue.indexOf(doppelganger), 1);
  //Video is not in the queue, so add it to the top (prefer to insert original video again)
  queue.unshift(doppelganger ?? video);
};

//Update the current video with the video in queue position 0, and remove it from the queue
exports.moveToNext = () => {
  // Queue has an item, can be shifted
  if (queue.length > 0) currentVideo = queue.shift();
  else throw new softError("Unable to move to the next item in the queue!");

  eventBus.emit("queue-update");
  return enums.SUCCESS;
};

// Removing videos by video id from the queue
exports.removeVideos = (videoIDs, userID, isAdmin = false) => {
  let deletedVideos = 0;
  let newQueue = queue.filter((video) => {
    // video is in list of requested removal videos
    if (videoIDs.indexOf(video.id) !== -1) {
      // User is no admin or does not own the videoID -> illegal removal
      if (!isAdmin && userID !== video.user.id) {
        throw new hardError("Illegal removal of video!");
      }
      deletedVideos++;
      return false;
    }
    // keep video
    return true;
  });
  queue = newQueue;

  logger.queueInfo(`Removed ${deletedVideos} video(s) from the Queue!`);
  if (!self.isQueueEmpty()) organizeQueue();

  eventBus.emit("queue-update");
  return enums.SUCCESS;
};

exports.clearQueue = () => {
  queue = [];
  logger.queueInfo(`Cleared queue!`);
  eventBus.emit("queue-update");
  return enums.SUCCESS;
};

exports.setCurrentVideo = (video) => {
  currentVideo = video;
};

function performFairAdd(video) {
  queue.push(video);
  organizeQueue();
}

// Check for an identical video in the queue
function findDoppelganger(video) {
  return queue.filter((spot) => spot.id === video.id)[0];
}

// This orders the queue on a round-robin style considering first come first serve
function organizeQueue() {
  let oldQueue = queue;

  // insert the current video at the front of the queue
  if (!isEmpty(currentVideo)) {
    oldQueue.unshift(currentVideo);
  }

  // get all ids in the queue on which to order
  const allIds = new Set(oldQueue.map((item) => item.user.id));
  let videosPerUser = [];
  // create a 2d array for all videos per user [[videos of user a], [videos of user b]]
  allIds.forEach((userId) => {
    videosPerUser.push(
      oldQueue.filter((element) => {
        return element.user.id == userId;
      })
    );
  });

  let newQueue = [];
  const maxVideos = videosPerUser.slice().sort((a, b) => {
    return b.length - a.length;
  })[0].length;
  let userCount = allIds.size;

  // round robin style of adding to the new queue
  // we loop x times for the longest 2d array and loop in that the amount of users that still need to
  // be added to the new queue
  for (let i = 0; i < maxVideos; i++) {
    let emptyElements = false;
    for (let j = 0; j < userCount; j++) {
      newQueue.push(videosPerUser[j].shift());
      if (!videosPerUser[j].length) emptyElements = true;
    }
    // if a user has run out of videos we can reduce the next loop size
    if (emptyElements) {
      videosPerUser = videosPerUser.filter((element) => {
        if (!element.length) userCount--;
        return element.length;
      });
    }
  }

  // The currentvideo wasn't empty and was added for the sorting algorithm. Remove it again
  if (!isEmpty(currentVideo)) {
    newQueue.shift();
  }

  queue = newQueue;
  eventBus.emit("queue-update");
}
