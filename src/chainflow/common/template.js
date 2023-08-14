// 模板处理
const { PromptTemplate } = require("langchain/prompts");

/**
 * 模板变量抽取
 * @param {*} template 
 * @returns 变量列表
 */
const extractTemplateVariables = (template) => {
  const regex = /\{([^}]+)\}/g;
  const variables = [];
  let match;

  while ((match = regex.exec(template))) {
    variables.push(match[1].trim());
  }

  return variables;
}

const preprocessValue = (value, variables) => {
  for (const variable of variables) {
    if (value[variable] === undefined) {
      value[variable] = '';
    }
    if (typeof value[variable] !== 'string') {
      value[variable] = JSON.stringify(value[variable]);
    }
  }
  return value;
}

const resolveTemplate = async (template, value = {}) => {

  const variables = extractTemplateVariables(template);
  preprocessValue(value, variables);

  const Template = new PromptTemplate({
    template: template,
    inputVariables: variables,
  });
  const prompt = await Template.format(value)
  return prompt;
}

module.exports = exports = {
  extractTemplateVariables,
  resolveTemplate
}