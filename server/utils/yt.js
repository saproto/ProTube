const logger = require("./logger");
const { format_mm_ss, format_hh_mm_ss } = require("./time-formatter");

const { Client, SearchResult } = require("youtubei");
const youtube = new Client();

//search for a YouTube video
exports.search = async (
  query,
  continuationToken,
  isAdmin = false,
  queue = []
) => {
  let result;
  let videos;

  if (!continuationToken) {
    logger.youtubeInfo(`Search initiated for query ${query}`);
    result = await youtube.search(query, { type: "video" });
    videos = result.items;
  } else {
    logger.youtubeInfo(`Searching the next page for query`);
    //search the next page of the query (we have to create a new SearchResult due to library restrictions)
    result = new SearchResult({ client: youtube });
    result.continuation = continuationToken;
    videos = await result.next();
  }

  let newContinuation = result.continuation;

  if (!videos) return new Error("Could not find any videos");

  videos.map((video) => sanitizeVideo(video));
  // Checking if video already in queue
  videos.forEach((video) => {
    if (queue.some((queueVid) => queueVid.id === video.id)) {
      // If video is in queue set status to SUCCESS
      video.status = enums.STATUS.SUCCESS;
    }
  });

  return {
    videos: isAdmin
      ? videos
      : videos.filter(
          (video) =>
            video.duration <=
            (parseInt(process.env.YOUTUBE_MAX_DURATION) || 600)
        ),
    continuationToken: newContinuation,
  };
};

//get metadata for a single YouTube video
exports.getVideo = async (videoId, isAdmin = false) => {
  logger.youtubeInfo(`Getting metadata for video ${videoId}`);
  let video;
  try {
    // throws error if unknown video
    video = await youtube.getVideo(videoId);
  } catch (e) {
    throw new softError("Could not find this video");
  }

  video = sanitizeVideo(video);
  if (
    !isAdmin &&
    video.duration > (parseInt(process.env.YOUTUBE_MAX_DURATION) || 600)
  )
    throw new softError("Video is too long.");
  return video;
};

exports.getPlaylistInfo = async(playlistId)=>{
  let playlist;
  try {
    playlist = await youtube.getPlaylist(playlistId);
  } catch (e) {
    throw new hardError("Error at fetching videos!");
  }
  if (!playlist) throw new softError("Could not find that playlist");
  return {
    id: playlist.id,
    title: playlist.title,
    channel: playlist.channel.name,
    thumbnail: playlist.thumbnails[playlist.thumbnails.length - 1],
    videoCount: playlist.videoCount,
  };
}
//get all videos of a playlist and return them
exports.getVideosInPlaylist = async (playlistId, isAdmin = false) => {
  logger.youtubeInfo(`Getting videos associated with playlist ${playlistId}`);
  let playlist, videos;
  try {
    playlist = await youtube.getPlaylist(playlistId);
    videos = playlist.videos.items;
  } catch (e) {
    throw new hardError("Error at fetching videos!");
  }
  if (!playlist) throw new softError("Could not find that playlist");
  if (!videos) throw new softError("Could not find any videos");

  videos.map((video) => sanitizeVideo(video));
  if (isAdmin) return videos;

  return videos.filter(
    (video) =>
      video.duration <= (parseInt(process.env.YOUTUBE_MAX_DURATION) || 600)
  );
};

const sanitizeVideo = (video) => {
  delete video.related;
  delete video.description;
  delete video.comments;
  delete video.client;

  video.channel = video.channel.name;
  video.thumbnail = video.thumbnails[video.thumbnails.length - 1];
  delete video.thumbnails;

  if (video.duration >= 3600)
    video.durationFormatted = format_hh_mm_ss(video.duration);
  else video.durationFormatted = format_mm_ss(video.duration);

  video.viewsFormatted = formatViews(video.viewCount);

  return video;
};

function formatViews(views) {
  if (views > 999 && views < 1000000) {
    return (views / 1000).toFixed(1) + "k";
  } else if (views > 1000000 && views < 1000000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views > 1000000000) {
    return (views / 1000000000).toFixed(1) + "B";
  }
  return views;
}
