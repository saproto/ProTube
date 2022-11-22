const logger = require('./logger');
const {format_mm_ss, format_hh_mm_ss} = require('./time-formatter');

const {Client} = require('youtubei');
const youtube = new Client();

//search for a YouTube video
exports.search = async(query, isAdmin = false) => {
    logger.youtubeInfo(`Search initiated for query ${query}`);
    const videos = await youtube.search(query, {type: 'video'});
    if(!videos) return new Error('Could not find any videos');
    videos.map(video => sanitizeVideo(video));
    if(isAdmin) return videos;

    return videos.filter(video => video.duration <= (parseInt(process.env.YOUTUBE_MAX_DURATION) || 600));
}

//get metadata for a single YouTube video
exports.getVideo = async(videoId, isAdmin = false) => {
    logger.youtubeInfo(`Getting metadata for video ${videoId}`);
    let video;
    try{
        // throws error if unknown video
        video = await youtube.getVideo(videoId);
    }catch(e){
        throw new softError('Could not find this video');
    }

    video = sanitizeVideo(video);
    if(!isAdmin && video.duration > (parseInt(process.env.YOUTUBE_MAX_DURATION) || 600)) throw new softError('Video is too long.');
    return video;
}

//get all videos of a playlist and return them
exports.getVideosInPlaylist = async(playlistId) => {
    logger.youtubeInfo(`Getting videos associated with playlist ${playlistId}`);
    let playlist = await youtube.getPlaylist(playlistId);
    if(!playlist) throw new softError('Could not find that playlist');
    let {videos} = playlist;
    if(!videos) throw new softError('Could not find any videos');
    videos.map(video => sanitizeVideo(video));
    return videos.filter(video => video.duration <= (parseInt(process.env.YOUTUBE_MAX_DURATION) || 600));
}

const sanitizeVideo = video => {
    if(video.related) delete video.related;
    if(video.comments) delete video.comments;
    delete video.client;
    video.channel = video.channel.name;
    video.thumbnail = video.thumbnails[video.thumbnails.length - 1];
    if(video.duration >= 3600) video.durationFormatted = format_hh_mm_ss(video.duration);
    else video.durationFormatted = format_mm_ss(video.duration);
    video.viewsFormatted = formatViews(video.viewCount);
    delete video.thumbnails;
    return video;
}

function formatViews(views){
    if(views > 999 && views < 1000000){
        return (views/1000).toFixed(1) + 'k';
    } else if(views > 1000000 && views < 1000000000){
        return (views/1000000).toFixed(1) + 'M';
    } else if (views > 1000000000){
        return (views/1000000000).toFixed(1) + 'B';
    }
  return views;
}