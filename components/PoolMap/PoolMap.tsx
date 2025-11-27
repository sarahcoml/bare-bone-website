"use client";

import React, { useEffect, useState, useCallback, useRef, MutableRefObject } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import styles from "./PoolMap.module.css";

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006]; // [lat, lng] for NYC

function ChangeMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

/* small helper to expose the created map instance to the parent via ref */
function MapRef({ mapRef }: { mapRef: MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      // only clear ref if it still points to this map
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

const poolPinSVG = encodeURIComponent(`
  <svg width="38" height="54" viewBox="0 0 38 54" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="0" y="0" width="200%" height="200%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.25"/>
      </filter>
    </defs>
    <path filter="url(#shadow)" d="M19 51c8-12 16-20.5 16-31C35 10.058 28.284 3 19 3S3 10.058 3 20c0 10.5 8 19 16 31z" fill="#143DF4" stroke="white" stroke-width="5"/>
    <circle cx="19" cy="22" r="7" fill="white"/>
    <circle cx="19" cy="22" r="5" fill="#143DF4"/>
  </svg>
`);
const poolIcon = L.icon({
  iconUrl: `data:image/svg+xml,${poolPinSVG}`,
  iconSize: [38, 54],
  iconAnchor: [19, 51],
  popupAnchor: [0, -51],
});
const userPinSVG = encodeURIComponent(`
  <svg width="38" height="54" viewBox="0 0 38 54" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="0" y="0" width="200%" height="200%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.25"/>
      </filter>
    </defs>
    <path filter="url(#shadow)" d="M19 51c8-12 16-20.5 16-31C35 10.058 28.284 3 19 3S3 10.058 3 20c0 10.5 8 19 16 31z" fill="#C8A2C8" stroke="white" stroke-width="5"/>
    <circle cx="19" cy="22" r="7" fill="white"/>
    <circle cx="19" cy="22" r="5" fill="#C8A2C8"/>
  </svg>
`);
const userIcon = L.icon({
  iconUrl: `data:image/svg+xml,${userPinSVG}`,
  iconSize: [38, 54],
  iconAnchor: [19, 51],
  popupAnchor: [0, -51],
});

type Pool = { id: number; name: string; lat: number; lon: number };

const PoolMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [clientMounted, setClientMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_CENTER);
  const [pools, setPools] = useState<Pool[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // mark client mount (protects leaflet from SSR/strict-mode double-init)
  useEffect(() => {
    setClientMounted(true);
  }, []);

  // clear the ref on unmount but DO NOT call map.remove() — react-leaflet
  // manages the map lifecycle. Calling remove() yourself can cause
  // "Map container is being reused by another instance" when react-leaflet
  // also tears down the map.
  useEffect(() => {
    return () => {
      mapRef.current = null;
    };
  }, []);

  // replace existing fetchPoolName + fetchPools with the refined implementations below

  const KEYWORD_RE = /\b(pool|swim|aquatic|aquatics|aquatic centre|aquatic center|ymca|leisure|recreation|community|aquaticcentre|aquaticcenter)\b/i;

  /**
   * Try multiple strategies to get a human-friendly pool name:
   * 1) Nominatim reverse (prefer `name`)
   * 2) Small Overpass search around the coord for any nearby named pool/POI
   * 3) MapTiler geocoding (optional if NEXT_PUBLIC_MAPTILER_KEY is set)
   */
  async function fetchPoolName(lat: number, lon: number): Promise<string | null> {
    // 1) Nominatim reverse
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(lat),
        lon: String(lon),
        addressdetails: "1",
        zoom: "18",
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        headers: { "User-Agent": "wym-app/1.0 (contactwymofficial@gmail.com)" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.name === "string" && data.name.trim()) {
          // prefer explicit name
          return data.name.trim();
        }
        if (data && typeof data.display_name === "string") {
          const short = data.display_name.split(",")[0].trim();
          if (short) return short;
        }
      }
    } catch {
      /* ignore and continue */
    }

    // 2) Small Overpass POI search near the point (prefer named results)
    try {
      const r = 200; // meters
      const q = `
        [out:json];
        (
          node(around:${r},${lat},${lon})["name"]["leisure"="swimming_pool"];
          way(around:${r},${lat},${lon})["name"]["leisure"="swimming_pool"];
          relation(around:${r},${lat},${lon})["name"]["leisure"="swimming_pool"];
          node(around:${r},${lat},${lon})["name"]["amenity"="sports_centre"];
          node(around:${r},${lat},${lon})["name"~"${KEYWORD_RE.source}",i];
        );
        out tags center 1;
      `;
      const or = await axios.get("https://overpass-api.de/api/interpreter", { params: { data: q } });
      const els = Array.isArray(or.data?.elements) ? or.data.elements : [];
      if (els.length) {
        // pick the best element with a name and keyword match when possible
        const withName = els.filter((e: any) => e.tags && e.tags.name);
        if (withName.length) {
          // prefer ones whose name contains a keyword
          const best = withName.find((e: any) => KEYWORD_RE.test(e.tags.name)) || withName[0];
          if (best.tags && best.tags.name) return best.tags.name.trim();
        }
      }
    } catch {
      /* ignore and continue */
    }

    // 3) MapTiler (optional) - try only if key present
    try {
      const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
      if (MAPTILER_KEY) {
        const mres = await fetch(
          `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${MAPTILER_KEY}&limit=6`
        );
        if (mres.ok) {
          const md = await mres.json();
          if (md.features && md.features.length) {
            const facility = md.features.find((f: any) =>
              (f.properties?.category || "").toLowerCase().includes("swimming")
            );
            const textFeature = facility || md.features.find((f: any) => KEYWORD_RE.test(f.text || ""));
            if (textFeature) return (textFeature.text || textFeature.properties?.label || "").trim() || null;
          }
        }
      }
    } catch {
      /* ignore */
    }

    return null;
  }

  /**
   * Refined fetchPools:
   * - include tags in Overpass output
   * - prefer tag-based names, then enrich missing names with fetchPoolName
   * - limit external lookups concurrency to avoid rate-limits
   */
  const fetchPools = useCallback(
    async (lat: number, lon: number) => {
      const radius = 5000;
      const query = `
        [out:json][timeout:25];
        (
          node["leisure"="swimming_pool"](around:${radius},${lat},${lon});
          way["leisure"="swimming_pool"](around:${radius},${lat},${lon});
          relation["leisure"="swimming_pool"](around:${radius},${lat},${lon});
        );
        out center tags;
      `;
      try {
        const res = await axios.get("https://overpass-api.de/api/interpreter", {
          params: { data: query },
        });
        const elements = Array.isArray(res.data?.elements) ? res.data.elements : [];

        // Build basic records including tags for richer heuristics later
        const initial = elements
          .map((el: any) => {
            const latVal = el.lat ?? el.center?.lat;
            const lonVal = el.lon ?? el.center?.lon;
            if (latVal == null || lonVal == null) return null;
            return {
              id: el.id,
              lat: latVal,
              lon: lonVal,
              tags: el.tags || {},
            } as const;
          })
          .filter(Boolean) as ReadonlyArray<{ id: number; lat: number; lon: number; tags: Record<string, any> }>;

        // Helper to derive a name from tags if possible
        const deriveNameFromTags = (tags: Record<string, any>): string | null => {
          const prefer = [
            "name",
            "official_name",
            "name:en",
            "operator",
            "operator:name",
            "ref",
            "brand",
            "description",
            "note",
          ];
          for (const k of prefer) {
            if (tags[k] && typeof tags[k] === "string" && tags[k].trim()) return tags[k].trim();
          }

          // try addr tags
          const addr = tags["addr:housename"] || tags["addr:place"] || tags["addr:street"];
          if (addr && typeof addr === "string") return addr.trim();

          return null;
        };

        // Limit concurrent external lookups to avoid hammering APIs
        const CONCURRENCY = 6;
        const results: Pool[] = [];
        for (let i = 0; i < initial.length; i += CONCURRENCY) {
          const chunk = initial.slice(i, i + CONCURRENCY);
          const promises = chunk.map(async (p) => {
            const fromTags = deriveNameFromTags(p.tags);
            if (fromTags) {
              return { id: p.id, name: fromTags, lat: p.lat, lon: p.lon } as Pool;
            }
            const ext = await fetchPoolName(p.lat, p.lon);
            if (ext) return { id: p.id, name: ext, lat: p.lat, lon: p.lon } as Pool;
            return {
              id: p.id,
              name: `Swimming Pool (${p.lat.toFixed(5)}, ${p.lon.toFixed(5)})`,
              lat: p.lat,
              lon: p.lon,
            } as Pool;
          });
          const settled = await Promise.allSettled(promises);
          for (const s of settled) {
            if (s.status === "fulfilled") results.push(s.value);
          }
        }

        // dedupe by id and set
        const uniq = new Map<number, Pool>();
        for (const p of results) uniq.set(p.id, p);
        setPools(Array.from(uniq.values()));
      } catch (err) {
        console.error("fetchPools error:", err);
        setPools([]);
      }
    },
    [setPools]
  );

  // Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      fetchPools(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        fetchPools(latitude, longitude);
      },
      () => {
        fetchPools(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      },
      { maximumAge: 60_000 }
    );
  }, [fetchPools]);

  // Handle "Use My Location" button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        fetchPools(latitude, longitude);
        setGeoError(null);
      },
      () => {
        setGeoError("Location permission denied or unavailable.");
      }
    );
  };

  // Handle search submit (simple, uses nominatim)
  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!search) return;
      setSearchLoading(true);
      try {
        const res = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: search, format: "json", limit: 1 },
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          const { lat, lon } = res.data[0];
          const latN = parseFloat(lat);
          const lonN = parseFloat(lon);
          setUserLocation([latN, lonN]);
          fetchPools(latN, lonN);
          setGeoError(null);
        } else {
          setGeoError("Location not found.");
        }
      } catch (err) {
        console.error("search error:", err);
        setGeoError("Error searching for location.");
      } finally {
        setSearchLoading(false);
      }
    },
    [search, fetchPools]
  );

  // Suggestions (debounced)
  useEffect(() => {
    if (search.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(search)}&limit=6`;
        if (userLocation) url += `&lat=${userLocation[0]}&lon=${userLocation[1]}`;
        const r = await fetch(url, { signal: controller.signal });
        const data = await r.json();
        const items = (data.features || []).map((f: any) => ({
          display_name:
            (f.properties?.name || "") +
            (f.properties?.city ? `, ${f.properties.city}` : "") +
            (f.properties?.country ? `, ${f.properties.country}` : ""),
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          place_id: "photon-" + (f.properties?.osm_id ?? Math.random()),
        }));
        setSuggestions(items);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 160);

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [search, userLocation]);

  const handleSuggestionClick = (s: any) => {
    setSearch(s.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setUserLocation([s.lat, s.lon]);
    fetchPools(s.lat, s.lon);
    setHighlightedIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleSuggestionClick(suggestions[highlightedIndex]);
    }
  };

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => setUserCountry(data.country_code))
      .catch(() => setUserCountry(null));
  }, []);

  return (
    <div className={styles.poolmapContainer}>
      <form className={styles.poolmapForm} onSubmit={handleSearch} autoComplete="off">
        <div className={styles.inputDropdownWrapper}>
          <div className={styles.inputWithIcon}>
            <span className={styles.searchIcon}>
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <circle cx="9" cy="9" r="7" stroke="#888" strokeWidth="2" />
                <line x1="14.2" y1="14.2" x2="18" y2="18" stroke="#888" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search for a place"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setTimeout(() => setInputFocused(false), 120)}
              onKeyDown={handleInputKeyDown}
              className={styles.poolmapInput}
              autoComplete="off"
            />
          </div>
          {inputFocused && showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestionsDropdown}>
              {suggestions.map((s, idx) => {
                const [main, ...rest] = s.display_name.split(",");
                return (
                  <li
                    key={s.place_id}
                    className={idx === highlightedIndex ? styles.suggestionActive : ""}
                    onMouseDown={() => handleSuggestionClick(s)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <span className={styles.suggestionMain}>{main?.trim()}</span>
                    {rest.length > 0 && <span className={styles.suggestionSub}>{rest.join(",").trim()}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <button type="submit" disabled={searchLoading} className={styles.poolmapSearchBtn}>
          {searchLoading ? "Searching..." : "Search"}
        </button>
        <button type="button" onClick={handleUseMyLocation} className={styles.poolmapLocationBtn}>
          Use My Location
        </button>
      </form>
      {geoError && <p className={styles.poolmapError}>{geoError}</p>}
      <div id="pool-map-wrap" className={styles.poolmapMapWrapper} style={{ height: 420 }}>
        {clientMounted && (
          <MapContainer
            center={userLocation}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            {/* expose map via MapRef (no DOM hacks) */}
            <MapRef mapRef={mapRef} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <ChangeMapCenter center={userLocation} />
            <Marker position={userLocation} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            {pools.map((pool) => (
              <Marker key={pool.id} position={[pool.lat, pool.lon]} icon={poolIcon}>
                <Popup>
                  <b>{pool.name}</b>
                  <br />
                  {pool.lat.toFixed(5)}, {pool.lon.toFixed(5)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default PoolMap;