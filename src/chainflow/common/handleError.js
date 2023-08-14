const delay = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const isError = (value) => {
  return value instanceof Error;
}

const friendlyContent = `抱歉, 我目前无法回答您的问题`;

const resolveStatusContent = (status) => {
  const hash = {
    404: '抱歉, 当前请求接口 404, 请排查服务部署情况',
  }
  return hash[status] || friendlyContent;
}

const handleError = async (error, onTokenStream) => {
  if (isError(error)) {
    const res = error.response || {}
    let content = friendlyContent;
    if (res.status) {
      content = resolveStatusContent(res.status);
    }
    console.log('Catch Error:', error.message);
    for (const ch of content) {
      onTokenStream(ch);
      await delay(30);
    }
    return friendlyContent;
  }
  return null;
}

module.exports = exports = handleError;