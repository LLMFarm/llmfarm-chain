const delay = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const streaming = async (message, onTokenStream, duration = 30) => {
  let content = message || "";
  if (typeof message != 'string') {
    content = JSON.stringify(message);
  }
  for (const ch of content) {
    onTokenStream(ch);
    await delay(duration);
  }
  return message;
}

module.exports = exports = {
  streaming
};