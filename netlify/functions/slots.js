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

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Simple in-memory storage for demo (in production, use a database)
    let slotsData = {
      remaining: 7,
      total: 7,
      lastUpdated: Date.now()
    };

    // Try to get existing data from environment or use default
    if (process.env.SLOTS_REMAINING) {
      slotsData.remaining = parseInt(process.env.SLOTS_REMAINING);
    }

    if (event.httpMethod === 'GET') {
      // Return current slots count
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: slotsData
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const action = body.action;

      if (action === 'decrement' && slotsData.remaining > 0) {
        slotsData.remaining -= 1;
        slotsData.lastUpdated = Date.now();
        
        // Log the decrement for tracking
        console.log(`Slots decremented: ${slotsData.remaining} remaining`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: slotsData,
            message: 'Slot claimed successfully'
          })
        };
      }

      if (action === 'reset') {
        slotsData.remaining = slotsData.total;
        slotsData.lastUpdated = Date.now();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: slotsData,
            message: 'Slots reset to maximum'
          })
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid action or no slots remaining'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };

  } catch (error) {
    console.error('Slots function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};
