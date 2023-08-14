// config/env.js

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// 先构造出.env*文件的绝对路径
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const dotenvPath = resolveApp(".env");

// 按优先级由高到低的顺序加载.env文件
dotenv.config({ path: `${dotenvPath}.local` }); // 加载.env.local
dotenv.config({ path: `${dotenvPath}.development.local` }); // 加载.env.development.local
// dotEnv.config({ path: `${dotenvPath}` }); // 加载.env

// 打印一下此时的 process.env
console.log(process.env.OPENAI_API_KEY); // OPENAI_API_KEY
