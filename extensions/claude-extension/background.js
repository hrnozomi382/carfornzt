chrome.runtime.onInstalled.addListener(() => {
  console.log('Claude Extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});