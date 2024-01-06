// chrome.action.onClicked.addListener((tab) => {
//     extensionEnabled = !extensionEnabled; // Toggle extension state

//     // Save the state of extensionEnabled to storage
//     chrome.storage.local.set({ isEnabled: extensionEnabled });

//     // Update the extension icon to indicate the current state
//     const iconPath = extensionEnabled
//         ? { '16': '/images/icon_enabled16.png', '48': '/images/icon_enabled48.png', '128': '/images/icon_enabled128.png' }
//         : { '16': '/images/icon16.png', '48': '/images/icon48.png', '128': '/images/icon128.png' };
//     chrome.action.setIcon({ path: iconPath });
// });

chrome.action.onClicked.addListener(async (tab) => {
    let extensionEnabled = false; // Variable to track extension state
    // Load the state of extensionEnabled from storage
    chrome.storage.local.get('isEnabled', (result) => {
        extensionEnabled = result.isEnabled || false;
    });
    extensionEnabled = !extensionEnabled; // Toggle extension state
    // Save the state of extensionEnabled to storage
    chrome.storage.local.set({ isEnabled: extensionEnabled });
    // Update the extension icon to indicate the current state
    const iconPath = extensionEnabled
        ? { '16': '/images/icon_enabled16.png', '48': '/images/icon_enabled48.png', '128': '/images/icon_enabled128.png' }
        : { '16': '/images/icon16.png', '48': '/images/icon48.png', '128': '/images/icon128.png' };
    chrome.action.setIcon({ path: iconPath });

    await chrome.scripting.unregisterContentScripts({ ids: ['foo'] }).catch(() => { });
    if (extensionEnabled) {
        chrome.scripting.registerContentScripts([{
            id: 'foo',
            js: ['src/contentScript.js'],
            matches: ['https://console.cloud.google.com/*', 'file:///C:/Users/borko/Downloads/testpage.html'],
            //runAt: 'document_start', // ?
        }]);
    }
    const execOpts = extensionEnabled ? { files: ['src/contentScript.js'] } : {};
    // Do I need this or can I just execute the script on the tab argument?
    // const tabs = (await chrome.tabs.query({}))
    //   .sort(t => t.active ? -1 : 0); // processing the active tab(s) first
    // for (const {id} of tabs) {
    //   chrome.scripting.executeScript({target: {tabId: id}, ...execOpts})
    //     .catch(() => {});
    // }
    chrome.scripting.executeScript({ target: { tabId: tab.id }, ...execOpts })
        .catch(() => { });
});

