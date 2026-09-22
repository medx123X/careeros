type DragFile = { name: string; type: string; data: string };
type ActiveDrag = { dragId: string; file: DragFile; tabId: number; expiresAt: number };

let activeDrag: ActiveDrag | null = null;

chrome.runtime.onInstalled.addListener(() => {
  console.info('CareerOS extension installed');
});

chrome.runtime.onMessage.addListener((message: { type?: string; dragId?: string; file?: DragFile }, sender, sendResponse) => {
  if (message.type === 'START_DOCUMENT_DRAG' && !sender.tab && message.dragId && message.file) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId === undefined) return;
      activeDrag = { dragId: message.dragId!, file: message.file!, tabId, expiresAt: Date.now() + 30000 };
      chrome.tabs.sendMessage(tabId, { type: 'CAREEROS_DRAG_STARTED', dragId: message.dragId }).catch(() => {});
    });
    return false;
  }

  if (message.type === 'GET_DOCUMENT_DRAG' && sender.tab?.id !== undefined) {
    const drag = activeDrag;
    if (drag && drag.tabId === sender.tab.id && drag.dragId === message.dragId && drag.expiresAt > Date.now()) {
      sendResponse({ file: drag.file });
    } else {
      sendResponse({ error: 'Document drag expired' });
    }
    return false;
  }

  if (message.type === 'END_DOCUMENT_DRAG' && !sender.tab) {
    if (activeDrag) {
      activeDrag.expiresAt = Math.min(activeDrag.expiresAt, Date.now() + 5000);
      chrome.tabs.sendMessage(activeDrag.tabId, { type: 'CAREEROS_DRAG_ENDED', dragId: activeDrag.dragId }).catch(() => {});
    }
    return false;
  }
  return false;
});
