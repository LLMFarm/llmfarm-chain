require("module-alias/register");
const chatCompletion = require("@src/llm/openai/chatCompletion");
const handleError = require("@src/chainflow/common/handleError");
const { getTokenConsumed, recordTokenConsumed } = require("../common/token");

// 解析处理 OpenAI 的 SSE 数据
const messageToValue = (message) => {
  if (message == "data: [DONE]") {
    return { type: "done" };
  }
  const data = message.split("data:")[1];
  const value = JSON.parse(data);
  // console.log(JSON.stringify(value, null, 2));
  if (value.error) {
    console.log(value.error.message);
    return { type: "text", text: '很抱歉给您带来不便，由于当前访问量过大，我们的系统无法满足所有用户的请求，建议您稍后重新提问。' }
  }
  const choices = value.choices || [];
  const choice = choices[0] || {};
  if (choice.finish_reason === "stop") {
    return { type: "stop" };
  }
  if (choice.delta.role == "assistant") {
    return { type: "assistant" };
  }
  return { type: "text", text: choice.delta.content };
};

// OpenAI GPT-3.5 Chat Completion
const ChatCompletion = async (inputs, nodeValue = {}, context, onTokenStream, __IS_ENDING = false) => {
  console.log("chatCompletion", inputs)
  const questionPrompt = inputs.prompt;
  const systemContext = inputs.context;
  const temperature = nodeValue.temperature != undefined ? parseFloat(nodeValue.temperature) : 0.5;

  // 上下文处理
  let messages = [];
  if (systemContext) {
    const message = { "role": "user", "content": systemContext }
    messages.push(message);
    const AI = { 'role': 'assistant', 'content': '我已理解需求, 请开始提问' }
    messages.push(AI);
  }
  messages.push(...(context.messages || []));

  console.log("GPT-3.5 Chat Completion", questionPrompt);
  const model = nodeValue['modelName'] || "gpt-3.5-turbo";
  console.log('model', model);
  const response = await chatCompletion({
    model,
    prompt: questionPrompt,
    streaming: __IS_ENDING,
    messages,
    temperature,
    OPENAI_KEY: context.OPENAI_KEY, // 读取接口传过来的 OPENAI_KEY
  }).catch(err => {
    console.log('err', err);
    return err;
  });

  const err = await handleError(response, __IS_ENDING ? onTokenStream : () => { });
  if (err) { return err }

  if (__IS_ENDING === false) {
    // console.log('返回值', JSON.stringify(response.data, null, 2));
    const result = response.data;
    const choices = result.choices || [];
    const choice = choices[0] || {};

    const consumed = getTokenConsumed(questionPrompt, messages || [], choice.message.content);
    recordTokenConsumed(context, "gpt-3.5-turbo", consumed);
    return choice.message.content;
  }

  let fullContent = "";
  const fn = new Promise((resolve, reject) => {
    let content = "";
    response.data.on("data", (chunk) => {
      content += chunk;
      while (content.indexOf("\n\n") !== -1) {
        const index = content.indexOf("\n\n");
        const message = content.slice(0, index);
        content = content.slice(index + 2);
        const value = messageToValue(message);
        if (value.type === "text") {
          ch = value.text;
          process.stdout.write(ch);
          fullContent += ch;
          onTokenStream(ch);
        } else {
          console.log(value);
        }
      }
    });

    response.data.on("end", () => {
      resolve(content);
    });
  });

  await fn;
  console.log("完整内容", fullContent);

  const consumed = getTokenConsumed(questionPrompt, messages || [], fullContent);
  recordTokenConsumed(context, model, consumed);
  return fullContent;
};

module.exports = exports = ChatCompletion;

