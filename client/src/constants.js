// success and error codes used in the applications
export const STATUS = Object.freeze({
    SUCCESS: 0,
    WARNING: 1,
    ERROR: 2,
    NOTHING: -1,
});

// true/false in code for readability
export const FAIL = false;
export const SUCCESS = true;

// Mode the player is currently in
export const MODES = Object.freeze({
	PLAYING: 0,
	IDLE: 1,
	PAUSED: 2
});

// type player that is currently playing
export const TYPES = Object.freeze({
	RADIO: 0,
	VIDEO: 1,
});
