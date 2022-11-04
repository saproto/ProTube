const fetch = require('node-fetch');
const { format_hh_mm_ss } = require('../utils/time-formatter');
const { isEmpty } = require('lodash');
const SUCCESS = true;
const FAIL = false;

let queue = [];
let currentVideo = {};
const self = this;

exports.getQueue = () => queue;
exports.isQueueEmpty = () => queue.length <= 0;
exports.getCurrentVideo = () => currentVideo;

//Calculate the total duration of the playlist and return it
exports.getTotalDuration = () => {
    let sum = 0;
    queue.forEach(video => sum += video.duration);
    return format_hh_mm_ss(sum);
}

//Add a video to the queue
exports.addFair = video => {
    if(findDoppelganger(video)) throw new softError('Video already in queue!!');
    // check for nr of videos in queue if not an admin
    if(!video.user.is_admin){
        let videoCount = 0;
        for(const vid of queue) {
            console.log(vid.user);
            videoCount += vid.user.user_id === video.user.user_id;
        }
        if(videoCount >= parseInt(process.env.USER_MAX_VIDEOS_IN_QUEUE)) {
            throw new softError('Video limit in the queue reached!');
        }
    }
    performFairAdd(video);
    return SUCCESS;
}

// Add multiple videos at once (playlist eg)
exports.addAllFair = videos => {
    for(const video of videos) {
        self.addFair(video);
    }
    return SUCCESS;
}

//Add a video to the first position of the queue
exports.addToTop = video => {
    // Found a double! Move the video to the top
    if(findDoppelganger(video)) queue.splice(queue.indexOf(doppelganger)).unshift(video);
    //Video is not already in the queue, so add it to the top
    else queue.unshift(video);
}

//Update the current video with the video in queue position 0, and remove it from the queue
exports.moveToNext = async () => {
    // Queue has an item, can be shifted
    if(queue.length > 0){
        currentVideo = queue.shift()
        if(currentVideo.user.user_id) {
            try {
                await fetch(`${process.env.LARAVEL_ENDPOINT}/api/protube/played?` + new URLSearchParams({
                    secret: process.env.LARAVEL_API_KEY,
                    user_id: currentVideo.user.user_id,
                    video_id: currentVideo.id,
                    video_title: currentVideo.title
                }));
            } catch(e) {
                //TODO add nice error
                console.log("Failed to send video data to protube site");
            }
        };
    }else {
        throw new softError('Unable to move to the next item in the queue!');
    }

    eventBus.emit('queue-update');
    return SUCCESS;
}

// Removing a specific video from the queue
exports.removeVideo = (videoID) => {
    // todo array.fiter instead of this
    let toDeleteIndex = null;
    queue.forEach((item, index) => {
        if(item.id === videoID){
            toDeleteIndex = index;
            return SUCCESS;
        } return FAIL;
    });
    if(toDeleteIndex >= 0){
        queue.splice(toDeleteIndex, 1);
        eventBus.emit('queue-update');
        return SUCCESS;
    }
    return FAIL;
}

exports.setCurrentVideo = (video) => {
    currentVideo = video
}

function performFairAdd(video) {
    queue.push(video);
    organizeQueue();
}

// Check for an identical video in the queue
function findDoppelganger(video) {
    return queue.filter(spot => spot.id === video.id)[0];
}

// This orders the queue on a round-robin style considering first come first serve
function organizeQueue(){
    // get all ids in the queue on which to order
    const allIds = new Set(queue.map(item => item.user.user_id));
    let videosPerUser = [];
    // create a 2d array for all videos per user [[videos of user a], [videos of user b]]
    allIds.forEach((userId) => {
        videosPerUser.push(queue.filter((element, pos) => {
            return element.user.user_id == userId;
        }));
    });

    let newQueue = [];
    const maxVideos = videosPerUser.slice().sort((a, b) => { return b.length - a.length })[0].length;
    let userCount = allIds.size;

    // round robin style of adding to the new queue
    // we loop x times for the longest 2d array and loop in that the amount of users that still need to 
    // be added to the new queue
    for(let i = 0; i < maxVideos; i++){
        let emptyElements = false;
        for(let j = 0; j < userCount; j++) {
            newQueue.push(videosPerUser[j].shift());
            if(!videosPerUser[j].length) emptyElements = true;
        };
        // if a user has run out of videos we can reduce the next loop size
        if(emptyElements){
            videosPerUser = videosPerUser.filter((element) => {
                if(!element.length) userCount--;
                return element.length
            });
        }
    }
    queue = newQueue;
    eventBus.emit('queue-update');
}