type DragFile = { name: string; type: string; data: string };
let activeDragId: string | null = null;

chrome.runtime.onMessage.addListener((message: { type?: string; dragId?: string }, _sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ type: 'PONG' });
  } else if (message.type === 'CAREEROS_DRAG_STARTED' && message.dragId) {
    activeDragId = message.dragId;
  } else if (message.type === 'CAREEROS_DRAG_ENDED' && message.dragId === activeDragId) {
    activeDragId = null;
  }
  return false;
});

document.addEventListener('dragover', (event) => {
  if (activeDragId && event.isTrusted) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }
}, true);

document.addEventListener('drop', (event) => {
  if (!activeDragId || !event.isTrusted) return;
  const dragId = activeDragId;
  activeDragId = null;
  event.preventDefault();
  event.stopImmediatePropagation();
  const target = event.target;
  if (!(target instanceof Element)) return;

  chrome.runtime.sendMessage({ type: 'GET_DOCUMENT_DRAG', dragId }, (response?: { file?: DragFile }) => {
    if (chrome.runtime.lastError || !response?.file) return;
    const { name, type, data } = response.file;
    const bytes = Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
    const file = new File([bytes], name, { type });
    const transfer = new DataTransfer();
    transfer.items.add(file);

    const input = target.matches('input[type="file"]')
      ? target as HTMLInputElement
      : target.closest('label')?.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (input) {
      input.files = transfer.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      target.dispatchEvent(new DragEvent('drop', {
        bubbles: true, cancelable: true, composed: true, dataTransfer: transfer,
      }));
    }
  });
}, true);

export {};
