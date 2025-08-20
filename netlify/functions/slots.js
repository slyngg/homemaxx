'use strict';
// Netlify Function: slots
// Purpose: Maintain a persistent monthly counter of remaining $7,500 offer slots.
// Methods:
// - GET  -> returns { remaining, monthKey }
// - POST -> body { action: 'decrement' } decrements remaining if > 0, returns { remaining }
// Storage: Netlify Blobs using @netlify/blobs

const { getStore } = require('@netlify/blobs');

// Configure defaults here
const TOTAL_SLOTS_PER_MONTH = 5;
const STORE_NAME = 'offer-slots';

function monthKeyFromDate(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function getStoreKey() {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const key = `slots-${monthKeyFromDate()}`;
  return { store, key };
}

async function readRemaining() {
  const { store, key } = await getStoreKey();
  const raw = await store.get(key, { type: 'json' });
  if (!raw || typeof raw.remaining !== 'number') {
    // Initialize for the month
    await store.set(key, { remaining: TOTAL_SLOTS_PER_MONTH });
    return { remaining: TOTAL_SLOTS_PER_MONTH, monthKey: key.replace('slots-', '') };
  }
  return { remaining: raw.remaining, monthKey: key.replace('slots-', '') };
}

async function decrement() {
  const { store, key } = await getStoreKey();
  // Use a naive read-modify-write; strong consistency requested above.
  const raw = await store.get(key, { type: 'json' });
  let remaining = TOTAL_SLOTS_PER_MONTH;
  if (raw && typeof raw.remaining === 'number') remaining = raw.remaining;
  if (remaining > 0) {
    remaining = remaining - 1;
    await store.set(key, { remaining });
  }
  return { remaining };
}

exports.handler = async function (event) {
  try {
    const method = event.httpMethod || 'GET';
    // Allow GET from anywhere, POST from same-origin (basic guard)
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
    };

    if (method === 'OPTIONS') {
      return { statusCode: 204, headers, body: '' };
    }

    if (method === 'GET') {
      const { remaining, monthKey } = await readRemaining();
      return { statusCode: 200, headers, body: JSON.stringify({ remaining, monthKey }) };
    }

    if (method === 'POST') {
      // Optional: minimal referer check
      try {
        const referer = event.headers && (event.headers.referer || event.headers.Referer);
        if (referer && !/homemaxx\.(netlify\.app|llc)/.test(referer)) {
          // Still proceed but no-op; or enforce by returning 403.
        }
      } catch (_) {}

      const body = event.body ? JSON.parse(event.body) : {};
      if (!body || body.action !== 'decrement') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
      }
      const { remaining } = await decrement();
      return { statusCode: 200, headers, body: JSON.stringify({ remaining }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: String(err && err.message || err) }) };
  }
};
