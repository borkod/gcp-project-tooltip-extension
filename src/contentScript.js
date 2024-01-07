
let myMap = {};

async function startProcess() {
    await new Promise((resolve, reject) => {
        chrome.storage.local.get('myMap', (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                myMap = result.myMap;
                createMutationObserver();
            }
        });
    });
}

startProcess();

function createMutationObserver() {
    // Define a new observer - Should this be const or let? With const, getting error: Uncaught SyntaxError: Identifier 'observer' has already been declared
    const observer = new MutationObserver((mutations) => {
        let toProcessNodes = [];
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // Check if the added node is a text node
                if (node.nodeType === Node.TEXT_NODE) {
                    // Check if the text node contains project id and its parent does not have the tooltip style                
                    if (testNode(node)) {
                        toProcessNodes.push(node);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // If the added node is an element, check its child nodes
                    const textNodes = [];
                    findTextNodes(node, textNodes);
                    textNodes.forEach((textNode) => {
                        if (testNode(textNode)) {
                            toProcessNodes.push(textNode);
                        }
                    });
                }
            });
        });
        createTooltips(toProcessNodes);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function testNode(node) {
    const regex = new RegExp("\\b(" + Object.keys(myMap).join("|") + ")\\b", "gi"); // Match any key from myMap
    return regex.test(node.textContent) && !node.parentNode.classList.contains('gcp-tooltip') && !node.parentNode.classList.contains('gcp-tooltiptext')
}


// This is the same findTextNodes function from your code
function findTextNodes(node, textNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
            findTextNodes(node.childNodes[i], textNodes);
        }
    }
}

// Create tooltips over the text nodes
function createTooltips(textNodes) {
    const regex = new RegExp("\\b(" + Object.keys(myMap).join("|") + ")\\b", "gi"); // Match any key from myMap
    textNodes.forEach(node => {
        let match;
        const matches = [];
        // Store all matches
        while ((match = regex.exec(node.textContent)) !== null) {
            matches.push(match);
        }
        // Replace matches from last to first
        for (let i = matches.length - 1; i >= 0; i--) {
            match = matches[i];
            if (testNode(match)) {
                continue;
            }

            const div = document.createElement('div');
            div.classList.add('gcp-tooltip');
            div.textContent = match[0]; // Use the matched text

            const span = document.createElement('span');
            span.classList.add('gcp-tooltiptext');
            span.textContent = myMap[match[0].toUpperCase()]; // Use the value from myMap

            div.appendChild(span);

            const replaced = node.splitText(match.index);
            replaced.nodeValue = replaced.nodeValue.substring(match[0].length);
            replaced.parentNode.insertBefore(div, replaced);
        }
    });
}
