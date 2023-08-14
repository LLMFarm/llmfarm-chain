const UserInputText = require('./NodeUserInputText');
const PromptTemplate = require('./NodePromptTemplate');
const ChatCompletion = require('./NodeChatCompletion');

const executorHash = {
  UserInputText,
  PromptTemplate,
  ChatCompletion
}

module.exports = exports = executorHash;