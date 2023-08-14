const { get_encoding, encoding_for_model } = require("@dqbd/tiktoken");

const calcToken = (text, modelName = "gpt-3.5-turbo") => {
  const enc = encoding_for_model(modelName);
  const inputs = enc.encode(text);
  enc.free();
  return inputs.length
}

/**
 * 计算 token 消耗
 * @param {*} prompt 
 * @param {*} messages 
 * @param {*} content 
 */
const getTokenConsumed = (prompt, messages, content) => {
  let fullContent = prompt + content;
  for (const message of messages) {
    fullContent += message.content;
  }
  return calcToken(fullContent);
}

const CONSUMED_KEY = 'TOKEN_CONSUMED'
const recordTokenConsumed = (context, modelName, tokenConsumed = 0) => {
  const hash = context[CONSUMED_KEY] || {};
  if (hash[modelName]) {
    hash[modelName] += tokenConsumed;
  } else {
    hash[modelName] = tokenConsumed;
  }
  context[CONSUMED_KEY] = hash;
}

module.exports = exports = {
  calcToken,
  getTokenConsumed,
  recordTokenConsumed
};

// const len = calcToken("hello world 我是一个好孩子");
// console.log(len); 