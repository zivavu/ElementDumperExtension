const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function isValidTabUrl(url) {
	if (!url) return false;
	return (
		url.startsWith("http://") ||
		url.startsWith("https://") ||
		url.startsWith("file://")
	);
}

function setBadgeError(tabId) {
	const actionAPI = browserAPI.browserAction || browserAPI.action;
	if (!actionAPI) return;
	actionAPI.setBadgeText?.({ text: "!", tabId });
	actionAPI.setBadgeBackgroundColor?.({ color: "#e04f5f", tabId });
	setTimeout(() => {
		actionAPI.setBadgeText?.({ text: "", tabId });
	}, 2000);
}

async function toggleDumper(tab) {
	if (!tab?.id) return;
	if (!isValidTabUrl(tab.url)) {
		setBadgeError(tab.id);
		return;
	}
	try {
		await browserAPI.tabs.sendMessage(tab.id, { action: "toggle-dumper" });
	} catch (err) {
		setBadgeError(tab.id);
		console.warn("[Element Dumper] Failed to toggle:", err.message);
	}
}

const actionAPI = browserAPI.browserAction || browserAPI.action;
if (actionAPI?.onClicked) {
	actionAPI.onClicked.addListener((tab) => {
		toggleDumper(tab);
	});
}

if (browserAPI.commands?.onCommand) {
	browserAPI.commands.onCommand.addListener((command, tab) => {
		if (command === "toggle-dumper") {
			toggleDumper(tab);
		}
	});
}
