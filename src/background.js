if (chrome) {
  chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    console.log('details.requestHeaders', details.requestHeaders);
    details.requestHeaders.push({
      name: 'Origin',
      value: 'http://localhost'
    })
    return {
      requestHeaders: details.requestHeaders
    };
  }, { urls: ["<all_urls>"] }, ["blocking", "requestHeaders"]);
}