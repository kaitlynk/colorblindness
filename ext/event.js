function injectedMethod(tab, method, callback) {
	chrome.tabs.executeScript(null, { file: "jquery.min.js" }, function() {
        chrome.tabs.executeScript(null, { file: "inject.js" });
    });
	chrome.tabs.executeScript(tab.id, { file: 'inject.js' }, function() {
		chrome.tabs.sendMessage(tab.id, { method: method }, callback);
	});
}

function getBgColors(tab) {
	injectedMethod(tab, 'setColorblindBox', function(response) {
	});
}

chrome.browserAction.onClicked.addListener(getBgColors);