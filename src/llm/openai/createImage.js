require('dotenv').config();
const http = require('http');

const OPENAI_PROXY_HOST = process.env.OPENAI_PROXY_HOST
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(responseBody);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function sendCurlRequest() {
  const options = {
    hostname: '54.251.195.63',
    path: '/v1/images/generations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OPENAI_API_KEY // 使用环境变量中的OPENAI_API_KEY
    }
  };

  const data = JSON.stringify({
    prompt: 'A cute baby sea otter',
    n: 2,
    size: '1024x1024'
  });

  try {
    const response = await makeRequest(options, data);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

sendCurlRequest();
