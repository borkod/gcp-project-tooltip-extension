// Saves options to chrome.storage
const saveOptions = () => {
    const auth = document.getElementById('auth').value;
  
    chrome.storage.local.set(
      { authOption: auth },
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 750);
      }
    );
  };
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.local.get(
      { authOption: 'adc' },
      (items) => {
        document.getElementById('auth').value = items.authOption;
      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);