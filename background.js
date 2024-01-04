let extensionEnabled = false; // Variable to track extension state

chrome.action.onClicked.addListener((tab) => {
    extensionEnabled = !extensionEnabled; // Toggle extension state

    //   // Inform content scripts about the state change (send a message)
    //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //     const activeTab = tabs[0];
    //     chrome.tabs.sendMessage(activeTab.id, { extensionEnabled });
    //   });

    // Save the state of extensionEnabled to storage
    chrome.storage.local.set({ isEnabled: extensionEnabled });

    // Update the extension icon to indicate the current state
    const iconPath = extensionEnabled
        ? { '16': 'images/icon_enabled16.png', '48': 'images/icon_enabled48.png', '128': 'images/icon_enabled128.png' }
        : { '16': 'images/icon16.png', '48': 'images/icon48.png', '128': 'images/icon128.png' };
    chrome.action.setIcon({ path: iconPath });
});