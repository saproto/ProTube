const moment = require('moment');

exports.format_mm_ss = time => moment.utc(moment.duration(time, 'seconds').as('milliseconds')).format('m:ss');
exports.format_hh_mm_ss = time => moment.utc(moment.duration(time, 'seconds').as('milliseconds')).format('HH:mm:ss');
exports.getCurrentUnix = () => moment().unix();