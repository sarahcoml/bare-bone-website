import { NextResponse } from 'next/server';

// Simple in-memory cache to reduce MapTiler calls (keys TTL 1 hour)
const cache = new Map<string, { ts: number; data: any }>();
const TTL = 1000 * 60 * 60;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');

    if (!lat || !lon) return new NextResponse(null, { status: 400 });

    const key = process.env.MAPTILER_KEY;
    // If no server key configured, return 204 so client can silently continue
    if (!key) return new NextResponse(null, { status: 204 });

    const cacheKey = `${lat},${lon}`;
    const now = Date.now();
    const entry = cache.get(cacheKey);
    if (entry && now - entry.ts < TTL) {
      return new NextResponse(JSON.stringify(entry.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mres = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(lon)},${encodeURIComponent(lat)}.json?key=${encodeURIComponent(
        key
      )}&limit=6`
    );
    if (!mres.ok) return new NextResponse(null, { status: 502 });

    const md = await mres.json();
    cache.set(cacheKey, { ts: now, data: md });
    return new NextResponse(JSON.stringify(md), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('geocode proxy error:', err);
    return new NextResponse(null, { status: 500 });
  }
}
