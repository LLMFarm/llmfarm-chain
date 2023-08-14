const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname);

const hash = {};
try {
  const files = fs.readdirSync(schemaPath);

  for (const file of files) {
    const filepath = path.join(schemaPath, file);
    const extName = path.extname(filepath);

    // 仅加载 JavaScript 文件
    if (file === 'index.js') continue;
    if (extName === '.js') {
      const modulePath = require.resolve(filepath);
      const module = require(modulePath);
      if (module.ignored) {
        continue;
      }
      const moduleKey = module.type;
      hash[moduleKey] = module;
    }
  }
} catch (err) {
  console.error('无法读取目录:', err);
}

// console.log("远程支持的节点类型: ", Object.keys(hash))
module.exports = exports = hash;