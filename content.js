console.log('Content script loaded');

// Add this at the very top of content.js
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .screenshot-selector {
        position: fixed;
        border: 2px solid #0095ff;
        background: rgba(0, 149, 255, 0.1);
        z-index: 10000;
        cursor: move;
        display: none;
      }
  
      .screenshot-selector .resize-handle {
        width: 10px;
        height: 10px;
        background: #0095ff;
        position: absolute;
        cursor: se-resize;
        right: -5px;
        bottom: -5px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Call this immediately
  injectStyles();

const REMOVE_BG_API_KEY = 'WysnYhxxrD8FFUuXbMLULzzE';

let isSelecting = false;
let selector = null;
let startX, startY;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'takeScreenshot') {
    startSelection();
  }
});

function startSelection() {
  // Create selector element if it doesn't exist
  if (!selector) {
    selector = document.createElement('div');
    selector.className = 'screenshot-selector';
    
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    selector.appendChild(handle);
    
    document.body.appendChild(selector);
  }

  // Add styles if not already added
  if (!document.querySelector('#screenshot-styles')) {
    const style = document.createElement('style');
    style.id = 'screenshot-styles';
    style.textContent = `
      .screenshot-selector {
        position: fixed;
        border: 2px solid #0095ff;
        background: rgba(0, 149, 255, 0.1);
        z-index: 10000;
        cursor: move;
      }
      .screenshot-selector .resize-handle {
        width: 10px;
        height: 10px;
        background: #0095ff;
        position: absolute;
        cursor: se-resize;
        right: -5px;
        bottom: -5px;
      }
    `;
    document.head.appendChild(style);
  }

  // Show selector and setup events
  selector.style.display = 'block';
  isSelecting = true;

  document.addEventListener('mousedown', startDraw);
  document.addEventListener('mousemove', draw);
  document.addEventListener('mouseup', endDraw);
}

function startDraw(e) {
  if (!isSelecting) return;
  
  startX = e.clientX;
}

async function removeBackground(imageUrl) {
  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to remove background');
    }

    const blob = await response.blob();
    const clipboardItem = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([clipboardItem]);
    
    alert('Image copied to clipboard!');
  } catch (error) {
    alert('Error: ' + error.message);
  }
} 