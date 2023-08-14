require("dotenv").config();
const OPENAI_PROXY_HOST = process.env.OPENAI_PROXY_HOST;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const OPENAI_AZURE = process.env.OPENAI_AZURE;
const OPENAI_AZURE_HOST = process.env.OPENAI_AZURE_HOST;
const OPENAI_AZURE_KEY = process.env.OPENAI_AZURE_KEY;
const OPENAI_AZURE_DEPLOYMENT = process.env.OPENAI_AZURE_DEPLOYMENT;
const OPENAI_AZURE_EMBEDDING = process.env.OPENAI_AZURE_EMBEDDING;

const deploymentHash = {
  'embeddings': OPENAI_AZURE_EMBEDDING
}

const resolveConfig = (uri, API_KEY) => {
  if (OPENAI_AZURE) {
    return resolveAzureConfig(uri, API_KEY);
  }
  return resolveOpenAIConfig(uri, API_KEY);
}

const resolveAzureConfig = (uri) => {
  const deployment = deploymentHash[uri] || OPENAI_AZURE_DEPLOYMENT;
  const url = `${OPENAI_AZURE_HOST}/openai/deployments/${deployment}/${uri}?api-version=2023-05-15`
  const headers = {
    'api-key': OPENAI_AZURE_KEY
  }
  return { url, headers }
}

const resolveOpenAIConfig = (uri, API_KEY) => {
  const url = `${OPENAI_PROXY_HOST}/v1/${uri}`;
  const headers = {
    'Authorization': `Bearer ${API_KEY || OPENAI_API_KEY}`,
  }
  return { url, headers }
}

module.exports = exports = resolveConfig;