const axios = require("axios");
const GO_HOST = process.env.GO_HOST;

const getUserInfo = async (sessionValue) => {
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${GO_HOST}/api/user/get`,
    headers: {
      Cookie: `gfsessionid=${sessionValue}`,
    },
  };
  const response = await axios(config);
  return response.data;
};

module.exports = exports = async (ctx, next) => {
  const sessionValue = ctx.cookies.get("gfsessionid");
  if (sessionValue && GO_HOST) {
    const info = await getUserInfo(sessionValue);
    const user = info.data;
    if (user && user.id) {
      ctx.userId = user.id;
    }
  }
  await next();
};
