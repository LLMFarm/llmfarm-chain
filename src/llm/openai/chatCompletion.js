const axios = require("axios");
require("dotenv").config();
// const OPENAI_PROXY_HOST = process.env.OPENAI_PROXY_HOST;
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// console.log("OPENAI_PROXY_HOST", OPENAI_PROXY_HOST);
const resolveConfig = require('./resolver');

const chatCompletion = async (options = {}) => {
  const {
    model = "gpt-3.5-turbo",
    prompt,
    temperature = 0.7,
    messages = [],
    streaming,
    OPENAI_KEY = '', // 用户自定义密钥
  } = options;

  const massageUser = [{ "role": "user", "content": prompt }];
  const { url, headers } = resolveConfig('chat/completions', OPENAI_KEY);

  // url: `${OPENAI_PROXY_HOST}/v1/chat/completions`,
  console.log("url", url);
  console.log("messages all", messages.concat(massageUser));
  console.log('温度值', temperature);
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url,
    headers: {
      // Authorization: `Bearer ${OPENAI_KEY || OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      ...headers
    },
    data: {
      model: model,
      temperature,
      messages: messages.concat(massageUser),
      stream: streaming,
    },
  };
  // console.log('OPENAI', config.headers.Authorization)
  if (streaming) {
    config.responseType = "stream"
  }

  const result = await axios.request(config);
  return result;
};

module.exports = exports = chatCompletion;
