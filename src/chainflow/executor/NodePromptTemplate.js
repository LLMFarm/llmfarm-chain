const { resolveTemplate } = require('@src/chainflow/common/template');
const { streaming } = require("@src/chainflow/common/stream");

const PromptTemplateExecutor = async (inputs = {}, nodeValue = {}, context, onTokenStream, __IS_ENDING = false) => {
  console.log("nodeValue.template", nodeValue.template);
  console.log('PromptTemplateExecutor', inputs);
  // console.log('nodeValue', nodeValue, result);
  const params = Object.assign({}, inputs, {
    question: inputs.question || nodeValue.question,
  })
  console.log("params", params);

  const promptText = await resolveTemplate(nodeValue.template, params);

  if (__IS_ENDING) {
    await streaming(promptText, onTokenStream, 20);
  }
  return promptText;
}

module.exports = exports = PromptTemplateExecutor;