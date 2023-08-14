const Memory = require('@src/sequelize/memory.js');

const createMemory = async (chatId, chainId) => {
  const memory = {};
  memory.chainId = chainId;
  memory.chatId = chatId;
  memory.value = {};
  memory.createTime = new Date();
  memory.updateTime = new Date();
  const result = await Memory.create(memory).catch((error) => {
    return error;
  });
  return result;
}

/**
 * @param {*} chatId 对话ID
 * @param {*} chainId 流程ID
 * @returns 
 */
const fetchMemory = async (chatId, chainId) => {

  const memory = await Memory.findOne({
    where: { chatId, chainId }
  })
  if (memory) {
    return memory;
  }
  return await createMemory(chatId, chainId);
}

const updateMemory = async (memory, value) => {
  const where = { id: memory.id }
  await Memory.update({ value }, { where })
  console.log('更新 memory 成功');
}

module.exports = exports = {
  fetchMemory,
  updateMemory
}

const run = async () => {
  await Memory.sync();
  console.memory("Memory.sync done");
}

// run();