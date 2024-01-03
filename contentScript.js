const wordMap = {
    "HELLO": "WORLD",
    "GOOD": "DAY",
  };

// Find all text nodes containing "HELLO"
function findTextNodes(node, textNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
        const regex = new RegExp("\\b(" + Object.keys(wordMap).join("|") + ")\\b", "gi"); // Match any key from wordMap
        if (regex.test(node.textContent)) {
            textNodes.push(node);
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
            findTextNodes(node.childNodes[i], textNodes);
        }
    }
}

// Create tooltips over the text nodes
function createTooltips(textNodes) {
    const regex = new RegExp("\\b(" + Object.keys(wordMap).join("|") + ")\\b", "gi"); // Match any key from wordMap
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
            const div = document.createElement('div');
            div.classList.add('gcp-tooltip');
            div.textContent = match[0]; // Use the matched text

            const span = document.createElement('span');
            span.classList.add('gcp-tooltiptext');
            span.textContent = wordMap[match[0].toUpperCase()]; // Use the value from wordMap

            div.appendChild(span);
  
            const replaced = node.splitText(match.index);
            replaced.nodeValue = replaced.nodeValue.substring(match[0].length);
            replaced.parentNode.insertBefore(div, replaced);
        }
    });
}

// Create a new style element
const style = document.createElement('style');

// Append the style element to the head of the document
document.head.appendChild(style);

// Start finding "HELLO" occurrences and create tooltips in the entire document
const textNodes = [];
findTextNodes(document.body, textNodes);
createTooltips(textNodes);

// Set the CSS you want to apply
style.textContent = `
.gcp-tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black;
}
  
.gcp-tooltip .gcp-tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;

    /* Position the tooltip */
    position: absolute;
    z-index: 1;
}
  
.gcp-tooltip:hover .gcp-tooltiptext {
    visibility: visible;
`;