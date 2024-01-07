chrome.action.onClicked.addListener(async (tab) => {
    let { enabled } = await chrome.storage.local.get('enabled');
    enabled = !enabled;
    chrome.storage.local.set({ enabled });
    // Update the extension icon to indicate the current state
    const iconPath = enabled
        ? { '16': '/images/icon_enabled16.png', '48': '/images/icon_enabled48.png', '128': '/images/icon_enabled128.png' }
        : { '16': '/images/icon16.png', '48': '/images/icon48.png', '128': '/images/icon128.png' };
    chrome.action.setIcon({ path: iconPath });

    await chrome.scripting.unregisterContentScripts({ ids: ['project-id-content-script'] }).catch(() => { });

    let projectIDMap = {
        //"880324381977": "liveproject-gke",
    };

    if (enabled) {
        let { token } = await chrome.identity.getAuthToken({ 'interactive': true });

        //const url = new URL('https://cloudresourcemanager.googleapis.com/v3/projects');
        const url = new URL('https://cloudresourcemanager.googleapis.com/v1/projects')

        // This should be parametrized somehow?
        // const params = {
        //     parent: 'organizations/0',
        //     showDeleted: 'false',
        // };

        //url.search = new URLSearchParams(params).toString();

        const headers = new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        })

        const queryParams = { headers };

        await fetch(url, queryParams)
            .then((response) => response.json()) // Transform the data into json
            .then(function (data) {
                data.projects.forEach((project) => {
                    projectIDMap[project.projectNumber] = project.name;
                });
            })

        chrome.storage.local.set({ projectMap: projectIDMap });

        chrome.scripting.registerContentScripts([{
            id: 'project-id-content-script',
            js: ['src/contentScript.js'],
            matches: ['https://console.cloud.google.com/*'],
            runAt: 'document_end', // ?
        }]);

        const execOpts = enabled ? { files: ['src/contentScript.js'] } : {};
        // Do I need this or can I just execute the script on the tab argument?
        // const tabs = (await chrome.tabs.query({}))
        //   .sort(t => t.active ? -1 : 0); // processing the active tab(s) first
        // for (const {id} of tabs) {
        //   chrome.scripting.executeScript({target: {tabId: id}, ...execOpts})
        //     .catch(() => {});
        // }

        chrome.scripting.executeScript({ target: { tabId: tab.id }, ...execOpts })
            .catch(() => { });
    }
});

