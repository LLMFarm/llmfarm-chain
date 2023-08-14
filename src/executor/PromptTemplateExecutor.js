require('module-alias/register');
const Executor = require('./Executor');
const { z } = require("zod");
const { StructuredOutputParser } = require("langchain/output_parsers");

// SQL 执行器
class PromptTemplateExecutor extends Executor {
  constructor(setting = {}, value = {}, context = {}, onTokenStream, isEnding = false) {
    super(setting, value, context, onTokenStream, isEnding);
  }

  async init() {

  }

  async run(inputs = {}) {
    await this.getStructuredInstruction(inputs);
  }

  async getStructuredInstruction(inputs = {}) {
    const config = this.value.config || [];
    const def = {};
    for (const item of config) {
      if (item.type === 'number') {
        def[item.key] = z.number().describe(item.label);
        continue;
      }
      def[item.key] = z.string().describe(item.label);
    }
    const parser = StructuredOutputParser.fromZodSchema(z.object(def));
    const formatInstructions = parser.getFormatInstructions();
    return formatInstructions
  }
}

module.exports = exports = PromptTemplateExecutor;