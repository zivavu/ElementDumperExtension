// Background script for Element Dumper - works in Firefox (MV2) and Chrome (MV3)

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function toggleDumper(tabId) {
	browserAPI.tabs
		.sendMessage(tabId, { action: "toggle-dumper" })
		.catch(() => {});
}

// ---- Toolbar icon click ----
// MV2 uses browserAction, MV3 uses action
const actionAPI = browserAPI.browserAction || browserAPI.action;
if (actionAPI?.onClicked) {
	actionAPI.onClicked.addListener((tab) => {
		if (tab?.id) toggleDumper(tab.id);
	});
}

// ---- Keyboard shortcut (Alt+Shift+D) ----
if (browserAPI.commands?.onCommand) {
	browserAPI.commands.onCommand.addListener((command, tab) => {
		if (command === "toggle-dumper" && tab?.id) {
			toggleDumper(tab.id);
		}
	});
}
