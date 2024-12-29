let processedImage = null;

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('dropZone');
  const preview = document.getElementById('preview');
  const copyButton = document.getElementById('copyResult');
  const loading = document.getElementById('loading');

  // Handle paste events
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        handleImage(blob);
        break;
      }
    }
  });

  // Handle drop zone click
  dropZone.addEventListener('click', () => {
    navigator.clipboard.read()
      .then(items => {
        for (let item of items) {
          if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
            item.getType('image/png').then(blob => {
              handleImage(blob);
            });
            break;
          }
        }
      })
      .catch(err => {
        console.error('Failed to read clipboard:', err);
        alert('Please copy an image to your clipboard first!');
      });
  });

  // Handle copy result button
  copyButton.addEventListener('click', async () => {
    if (processedImage) {
      try {
        const clipboardItem = new ClipboardItem({
          'image/png': processedImage
        });
        await navigator.clipboard.write([clipboardItem]);
        
        // Show success feedback
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        copyButton.style.background = '#4CAF50';
        setTimeout(() => {
          copyButton.textContent = originalText;
          copyButton.style.background = '';
        }, 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
        alert('Failed to copy image to clipboard');
      }
    }
  });
  
  const API_KEY = process.env.REMOVE_BG_API_KEY || '';

  async function handleImage(blob) {
    // Show loading state
    loading.style.display = 'block';
    dropZone.style.display = 'none';
    preview.style.display = 'none';
    copyButton.style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('image_file', blob);

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to remove background');
      }

      processedImage = await response.blob();
      preview.src = URL.createObjectURL(processedImage);
      
      // Hide loading, show result
      loading.style.display = 'none';
      preview.style.display = 'block';
      copyButton.style.display = 'block';
      dropZone.style.display = 'flex';
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process image: ' + error.message);
      
      // Reset UI
      loading.style.display = 'none';
      dropZone.style.display = 'flex';
    }
  }
});