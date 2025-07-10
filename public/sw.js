const CACHE_NAME = 'contaflix-voice-v1';
const urlsToCache = [
  '/',
  '/voice-agent',
  '/voice-agent/setup',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Handle background sync for offline voice messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'voice-message-sync') {
    event.waitUntil(syncVoiceMessages());
  }
});

async function syncVoiceMessages() {
  // Sync pending voice messages when back online
  const messages = await getStoredMessages();
  for (const message of messages) {
    try {
      await sendMessage(message);
      await removeStoredMessage(message.id);
    } catch (error) {
      console.error('Failed to sync message:', error);
    }
  }
}

async function getStoredMessages() {
  // Get messages from IndexedDB
  return [];
}

async function removeStoredMessage(id) {
  // Remove synced message from IndexedDB
}

async function sendMessage(message) {
  // Send message to server
}