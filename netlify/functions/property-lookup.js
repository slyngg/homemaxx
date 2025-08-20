/*
  Netlify Function: property-lookup
  GET /.netlify/functions/property-lookup?address=...

  Provider order:
    1) ATTOM (ATTOM_API_KEY)
    2) Realty Mole (REALTYMOLE_API_KEY)
  Output normalized for frontend autofill.
*/

const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const address = (event.queryStringParameters && event.queryStringParameters.address || '').trim();
  if (!address) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Missing address parameter' }) };
  }

  const ATTOM_API_KEY = process.env.ATTOM_API_KEY;
  const REALTYMOLE_API_KEY = process.env.REALTYMOLE_API_KEY;

  let normalized = {
    provider: 'none',
    address,
    beds: null,
    baths_full: null,
    baths_half: null,
    baths: null,
    sqft: null,
    lot_size: null,
    year_built: null,
    stories: null,
    basement: null,
    pool: { has_pool: null, type: null },
    parking: { covered: null, garage_spaces: null, carport: null }
  };

  async function tryAttom() {
    if (!ATTOM_API_KEY) return null;
    const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/expandedprofile?address=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { apikey: ATTOM_API_KEY }, timeout: 12000 });
    if (!res.ok) throw new Error(`ATTOM error: ${res.status}`);
    const data = await res.json();
    const p = data && Array.isArray(data.property) && data.property.length ? data.property[0] : null;
    if (!p) return { provider: 'attom', ...normalized };

    const b = p.building || {};
    const rooms = b.rooms || {};
    const size = b.size || {};
    const lot = p.lot || {};
    const park = b.parking || {};

    const beds = rooms.beds != null ? Number(rooms.beds) : null;
    const bathsFull = rooms.bathsfull != null ? Number(rooms.bathsfull) : null;
    const bathsHalf = rooms.bathshalf != null ? Number(rooms.bathshalf) : null;
    const totalBaths = (bathsFull != null || bathsHalf != null) ? (Number(bathsFull || 0) + Number(bathsHalf || 0) * 0.5) : null;

    const sqft = size.bldgsize != null ? Number(size.bldgsize) : (size.livingsize != null ? Number(size.livingsize) : null);
    const lotSize = lot.lotsize1 != null ? Number(lot.lotsize1) : (lot.lotSize != null ? Number(lot.lotSize) : null);

    const yearBuilt = b.yearbuilt != null ? Number(b.yearbuilt) : (p.summary && p.summary.yearbuilt ? Number(p.summary.yearbuilt) : null);
    const stories = b.levels != null ? Number(b.levels) : null;

    let basement = null;
    if (typeof b.basement === 'string') {
      const val = b.basement.toLowerCase();
      basement = val !== 'none' && val !== 'no';
    }

    let hasPool = null; let poolType = null;
    if (b.pooltype || b.pool) {
      const v = String(b.pooltype || b.pool).toLowerCase();
      hasPool = v !== 'none' && v !== 'no' && v !== '';
      poolType = hasPool ? v : null;
    }

    let garageSpaces = null; let carport = null; let covered = null;
    if (park) {
      if (park.garage1cars != null) garageSpaces = Number(park.garage1cars);
      else if (park.prkgSize != null) garageSpaces = Number(park.prkgSize);
      if (park.prkgType) {
        const t = String(park.prkgType).toLowerCase();
        carport = t.includes('carport');
        if (t.includes('garage')) covered = true;
      }
      if (garageSpaces != null && garageSpaces > 0) covered = true;
    }

    return {
      provider: 'attom', address,
      beds,
      baths_full: bathsFull,
      baths_half: bathsHalf,
      baths: totalBaths,
      sqft,
      lot_size: lotSize,
      year_built: yearBuilt,
      stories,
      basement,
      pool: { has_pool: hasPool, type: poolType },
      parking: { covered, garage_spaces: garageSpaces, carport }
    };
  }

  async function tryRealtyMole() {
    if (!REALTYMOLE_API_KEY) return null;
    // Realty Mole Property API
    const url = `https://api.realtymole.com/properties?address=${encodeURIComponent(address)}&apiKey=${encodeURIComponent(REALTYMOLE_API_KEY)}`;
    const res = await fetch(url, { timeout: 12000 });
    if (!res.ok) throw new Error(`RealtyMole error: ${res.status}`);
    const data = await res.json();
    const p = Array.isArray(data) && data.length ? data[0] : (data && data.property ? data.property : null);
    if (!p) return { provider: 'realtymole', ...normalized };

    const beds = p.bedrooms != null ? Number(p.bedrooms) : (p.numberBedrooms != null ? Number(p.numberBedrooms) : null);
    const baths = p.bathrooms != null ? Number(p.bathrooms) : (p.numberBathrooms != null ? Number(p.numberBathrooms) : null);
    // Normalize to full/half where possible (best-effort)
    let baths_full = null, baths_half = null;
    if (typeof baths === 'number') {
      baths_full = Math.floor(baths);
      baths_half = baths - baths_full >= 0.5 ? 1 : 0;
    }
    const sqft = p.squareFootage != null ? Number(p.squareFootage) : (p.livingArea != null ? Number(p.livingArea) : null);
    const lot_size = p.lotSize != null ? Number(p.lotSize) : null;
    const year_built = p.yearBuilt != null ? Number(p.yearBuilt) : null;
    const stories = p.stories != null ? Number(p.stories) : null;

    // Parking info varies; best-effort
    let garage_spaces = null; let covered = null; let carport = null;
    if (p.parking) {
      const tp = String(p.parking).toLowerCase();
      covered = tp.includes('garage') || tp.includes('covered');
      carport = tp.includes('carport');
      const match = tp.match(/(\d+)\s*car/);
      if (match) garage_spaces = Number(match[1]);
    }

    // Pool
    let has_pool = null; let type = null;
    if (p.pool != null) {
      const val = String(p.pool).toLowerCase();
      has_pool = val !== 'none' && val !== 'no';
      type = has_pool ? val : null;
    }

    return {
      provider: 'realtymole', address,
      beds,
      baths_full,
      baths_half,
      baths: typeof baths === 'number' ? baths : (baths_full != null ? baths_full + (baths_half ? 0.5 : 0) : null),
      sqft,
      lot_size,
      year_built,
      stories,
      basement: null, // RealtyMole rarely provides basement
      pool: { has_pool, type },
      parking: { covered, garage_spaces, carport }
    };
  }

  try {
    const providers = [tryAttom, tryRealtyMole];
    for (const fn of providers) {
      try {
        const out = await fn();
        if (out) { normalized = out; break; }
      } catch (_) {
        // fallthrough to next provider
      }
    }
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: true, data: normalized }) };
  } catch (err) {
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ ok: false, error: err.message, data: normalized }) };
  }
};
