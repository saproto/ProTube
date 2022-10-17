// success and error codes used in the applications
exports.STATUS = Object.freeze({
    SUCCESS: 0,
    WARNING: 1,
    ERROR: 2,
    NOTHING: -1,
});

// true/false in code for readability
exports.FAIL = false;
exports.SUCCESS = true;

// Mode the player is currently in
exports.MODES = Object.freeze({
	PLAYING: 0,
	IDLE: 1,
	PAUSED: 2
});

// type player that is currently playing
exports.TYPES = Object.freeze({
	RADIO: 0,
	VIDEO: 1,
});
