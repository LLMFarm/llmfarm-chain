const axios = require('axios');
const Executor = require('./Executor');

class NodeAPIExecutor extends Executor {
  constructor(setting = {}, value = {}, context = {}, onTokenStream, isEnding = false) {
    // console.log('NodeAPIExecutor constructor', setting, value, context, onTokenStream, isEnding);
    super(setting, value, context, onTokenStream, isEnding);
  }

  async init() {
    // Perform initialization tasks here
  }

  setAuthorizationHeader(headers = {}) {
    const { authorizationType, authKey, token } = this.setting;

    switch (authorizationType) {
      case 'APIKey':
        headers['Authorization'] = `${authKey} ${token}`;
      case 'JWT':
        headers['Authorization'] = `Bearer ${token}`;
      case 'BearerToken':
        headers['Authorization'] = `Bearer ${token}`;
    }
  }

  async post(url, data = {}) {
    try {
      const headers = {};
      this.setAuthorizationHeader(headers);

      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error) {
      throw new Error(`POST request failed: ${error.message}`);
    }
  }

  async get(url, params = {}) {
    try {
      const headers = {};
      this.setAuthorizationHeader(headers);

      const options = {
        method: 'GET',
        url,
        headers: headers,
        params,
        responseType: 'json'
      }
      console.log("get.options", options)

      const response = await axios(options);
      return response.data;
    } catch (error) {
      throw new Error(`GET request failed: ${error.message}`);
    }
  }

  async run(url, method = 'GET', data = {}) {
    try {
      const headers = {};
      this.setAuthorizationHeader(headers);

      let response;
      if (method === 'GET') {
        response = await axios.get(url, { headers });
      } else if (method === 'POST') {
        response = await axios.post(url, data, { headers });
      }

      return response.data;
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}

module.exports = exports = NodeAPIExecutor;