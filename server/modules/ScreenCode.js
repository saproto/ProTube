// const { updateCodeAdminScreen } = require('./socket_endpoints/AdminScreen');
const { User } = require("./DataBase");
const { Op } = require("sequelize");

let recreateScreencodeInterval = setInterval(
  regenerateAuthToken,
  parseInt(process.env.CODE_REFRESH_INTERVAL) * 1000
);
let screenCode;
regenerateAuthToken();
setInterval(
  revokeExpiredRemotes,
  parseInt(process.env.CODE_VALID_FLUSHING_INTERVAL) * 1000
);

function regenerateAuthToken() {
  const setCode = parseInt(process.env.FORCE_CODE || -1);
  screenCode =
    setCode !== -1 ? setCode : Math.floor(1000 + Math.random() * 9000);
  eventBus.emit("new-screen-code", screenCode);
  logger.serverInfo(`New auth token: ${screenCode}`);
}

exports.getScreenCode = () => screenCode;

exports.adminResetScreenCode = async () => {
  logger.serverInfo(`Admin requested new auth token`);

  // Screencode token interval reset + regeneration
  clearInterval(recreateScreencodeInterval);
  recreateScreencodeInterval = setInterval(
    regenerateAuthToken,
    parseInt(process.env.CODE_REFRESH_INTERVAL) * 1000
  );
  regenerateAuthToken();

  // Revoking all correct screencodes on this session
  await User.update(
    { valid_remote_until: 0 },
    {
      where: { valid_remote_until: { [Op.not]: 0 } },
    }
  );
  await revokeExpiredRemotes();

  return enums.SUCCESS;
};

exports.checkScreenCode = (code) => {
  return parseInt(code) === screenCode;
};

// Disconnecting currently connected but expired sockets
async function revokeExpiredRemotes() {
  const sockets = await io.of("/socket/remote").fetchSockets();
  let flushCount = 0;

  // finding all connected but expired remotes and disconnecting them
  for (const sock of sockets) {
    await sock.request.user.reload();
    if (!sock.request.user.hasValidRemote()) {
      sock.disconnect(true);
      flushCount++;
    }
  }
  if (flushCount > 0) logger.serverInfo(`Flushed ${flushCount} sockets!`);
}
