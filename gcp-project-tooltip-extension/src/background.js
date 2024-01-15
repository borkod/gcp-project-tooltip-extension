chrome.action.onClicked.addListener(async (tab) => {
    let { enabled } = await chrome.storage.local.get('enabled');
    enabled = !enabled;
    chrome.storage.local.set({ enabled });
    // Update the extension icon to indicate the current state
    const iconPath = enabled
        ? { '16': '/images/icon_enabled16.png', '48': '/images/icon_enabled48.png', '128': '/images/icon_enabled128.png' }
        : { '16': '/images/icon16.png', '48': '/images/icon48.png', '128': '/images/icon128.png' };
    chrome.action.setIcon({ path: iconPath });

    try {
        await chrome.scripting.unregisterContentScripts({ ids: ['project-id-content-script'] });
    } catch (error) {
        console.log(error);
    }

    let projectIDMap = {};

    if (enabled) {

        var auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?';
        const manifest = chrome.runtime.getManifest();
        const client_id = manifest.oauth2.client_id;
        const scopes = manifest.oauth2.scopes.join(' ');
        const redirect_url = 'https://' + chrome.runtime.id + '.chromiumapp.org/';
        var auth_params = {
            client_id: client_id,
            redirect_uri: redirect_url,
            response_type: 'token',
            scope: scopes,
        };

        const url = new URLSearchParams(Object.entries(auth_params));
        url.toString();
        auth_url += url;

        let token;
        try {
            token = await new Promise((resolve, reject) => {
                chrome.identity.launchWebAuthFlow({ url: auth_url, interactive: true }, function (responseUrl) {
                    if (chrome.runtime.lastError) {
                        // If there's an error, reject the promise
                        reject(chrome.runtime.lastError);
                    } else {
                        let url = new URL(responseUrl);
                        let params = new URLSearchParams(url.hash.substring(1)); // remove the '#' at the start
                        resolve(params.get('access_token'));
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }


        const gcp_url = new URL('https://cloudresourcemanager.googleapis.com/v1/projects')

        const headers = new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        })

        const queryParams = { headers };

        await fetch(gcp_url, queryParams)
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


        try {
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, ...execOpts });
        } catch (error) {
            console.log(error);
        }
    }
});