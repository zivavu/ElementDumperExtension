// Background script for Element Dumper - works in both Chrome & Firefox
// Uses compatibility layer for browser API differences

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function toggleDumper(tabId) {
	browserAPI.tabs
		.sendMessage(tabId, { action: "toggle-dumper" })
		.catch((err) => {
			console.warn(
				"Element Dumper: could not reach content script",
				err.message,
			);
		});
}

// ---- Toolbar icon click ----
browserAPI.action.onClicked.addListener((tab) => {
	if (tab ?? tab.id) toggleDumper(tab.id);
});

// ---- Keyboard shortcut (Alt+Shift+D) ----
if (browserAPI.commands ?? browserAPI.commands.onCommand) {
	browserAPI.commands.onCommand.addListener((command, tab) => {
		if (command === "toggle-dumper" && tab && tab.id) {
			toggleDumper(tab.id);
		}
	});
}
