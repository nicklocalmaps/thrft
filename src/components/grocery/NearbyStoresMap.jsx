import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapPin, Loader2, Navigation, TrendingDown, X, Home, Search } from 'lucide-react';
import { ALL_STORES } from '@/lib/storeConfig';
import { base44 } from '@/api/base44Client';

const THRFT_BLUE = '#4181ed';

const STORE_SEARCH_TERMS = {
  kroger: 'Kroger', walmart: 'Walmart Supercenter', amazon: 'Amazon Fresh',
  whole_foods: 'Whole Foods Market', trader_joes: "Trader Joe's", aldi: 'Aldi',
  target: 'Target', publix: 'Publix', safeway: 'Safeway', albertsons: 'Albertsons',
  heb: 'H-E-B', meijer: 'Meijer', wegmans: 'Wegmans', costco: 'Costco',
  food_lion: 'Food Lion', stop_shop: 'Stop & Shop', giant_food: 'Giant Food',
  shoprite: 'ShopRite', harris_teeter: 'Harris Teeter', fred_meyer: 'Fred Meyer',
  king_soopers: 'King Soopers', hyvee: 'Hy-Vee', winn_dixie: 'Winn-Dixie',
  jewel_osco: 'Jewel-Osco', hannaford: 'Hannaford', cvs: 'CVS Pharmacy',
  walgreens: 'Walgreens',
};

function scoreColor(rank, total) {
  if (total <= 1) return THRFT_BLUE;
  const pct = rank / (total - 1);
  if (pct <= 0.33) return '#10b981';
  if (pct <= 0.66) return '#f59e0b';
  return '#ef4444';
}

function distanceMiles(lat1, lng1, lat2, lng2) {
  const R    = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve();
    const existing = document.getElementById('gmaps-script');
    if (existing) { existing.addEventListener('load', resolve); return; }
    const script = document.createElement('script');
    script.id    = 'gmaps-script';
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`;
    script.async   = true;
    script.onload  = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function NearbyStoresMap({
  priceData        = null,
  listName         = null,
  initialZip       = null,
  savedAddress     = null,
  favoriteStores   = [],
  onFavoriteToggle = null,
  showFavorites    = false,
  onNearbyResults  = null,
}) {
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);
  const homeMarkerRef  = useRef(null);

  const [loading, setLoading]             = useState(false);
  const [geocoding, setGeocoding]         = useState(false);
  const [userLocation, setUserLocation]   = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [error, setError]                 = useState(null);
  const [zipInput, setZipInput]           = useState(initialZip || '');
  const [currentZip, setCurrentZip]       = useState(null);
  const [addressLabel, setAddressLabel]   = useState(null);

  const priceScores = useMemo(() => {
    if (!priceData) return {};
    const entries = Object.entries(priceData).map(([key, d]) => {
      const total = Array.isArray(d)
        ? d.reduce((s, i) => s + (i.price || 0), 0)
        : (d?.instore_total ?? 0);
      return { key, total };
    }).filter(e => e.total > 0).sort((a, b) => a.total - b.total);
    return Object.fromEntries(
      entries.map((e, i) => [e.key, { rank: i, total: entries.length, price: e.total }])
    );
  }, [priceData]);

  const hasData = Object.keys(priceScores).length > 0;

  const getApiKey = async () => {
    const res = await base44.functions.invoke('getMapsApiKey', {});
    const key = res.data?.key;
    if (!key) throw new Error('No Maps API key returned');
    return key;
  };

  const placeHomeMarker = (map, lat, lng, label) => {
    if (homeMarkerRef.current) homeMarkerRef.current.setMap(null);
    homeMarkerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      title: label || 'Your location',
      icon: {
        path:        window.google.maps.SymbolPath.CIRCLE,
        scale:       10,
        fillColor:   THRFT_BLUE,
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3,
      },
      label: { text: '📍', fontSize: '14px' },
      zIndex: 999,
    });
    const iw = new window.google.maps.InfoWindow({
      content: `<div style="font-family:sans-serif;padding:4px 2px;">
        <strong style="font-size:13px;">${label || 'Your location'}</strong>
        ${savedAddress?.instructions ? `<br/><span style="font-size:11px;color:#64748b;">${savedAddress.instructions}</span>` : ''}
      </div>`,
    });
    homeMarkerRef.current.addListener('click', () => iw.open(map, homeMarkerRef.current));
  };

  const searchNearbyStores = useCallback((map, lat, lng) => {
    const service   = new window.google.maps.places.PlacesService(map);
    const compared  = Object.keys(priceScores);
    const storeKeys = compared.length > 0 ? compared : Object.keys(STORE_SEARCH_TERMS).slice(0, 8);

    const results = [];
    let pending   = storeKeys.length;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    storeKeys.forEach(key => {
      const term    = STORE_SEARCH_TERMS[key] || ALL_STORES.find(s => s.key === key)?.name || key;
      const request = {
        location: new window.google.maps.LatLng(lat, lng),
        radius:   16000,
        keyword:  term,
        type:     'grocery_or_supermarket',
      };

      service.nearbySearch(request, (places, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && places?.length) {
          const nearest   = places[0];
          const score     = priceScores[key];
          const color     = score ? scoreColor(score.rank, score.total) : THRFT_BLUE;
          const dist      = distanceMiles(lat, lng, nearest.geometry.location.lat(), nearest.geometry.location.lng());

          const storeInfo = {
            key,
            name:      ALL_STORES.find(s => s.key === key)?.name || term,
            place:     nearest,
            lat:       nearest.geometry.location.lat(),
            lng:       nearest.geometry.location.lng(),
            price:     score?.price ?? null,
            rank:      score?.rank  ?? null,
            rankTotal: score?.total ?? null,
            color,
            distMiles: dist,
          };

          results.push(storeInfo);

          const marker = new window.google.maps.Marker({
            position: nearest.geometry.location,
            map,
            title: storeInfo.name,
            label: {
              text:       score ? `$${score.price.toFixed(0)}` : '●',
              color:      'white',
              fontSize:   '11px',
              fontWeight: 'bold',
            },
            icon: {
              path:        window.google.maps.SymbolPath.CIRCLE,
              scale:       22,
              fillColor:   color,
              fillOpacity: 0.92,
              strokeColor: 'white',
              strokeWeight: 2.5,
            },
          });

          const iw = new window.google.maps.InfoWindow({
            content: `<div style="font-family:sans-serif;padding:4px 2px;min-width:120px;">
              <strong style="font-size:13px;">${storeInfo.name}</strong><br/>
              <span style="font-size:11px;color:#64748b;">${nearest.vicinity}</span><br/>
              <span style="font-size:11px;color:#64748b;">${dist.toFixed(1)} mi away</span>
              ${score ? `<br/><strong style="font-size:13px;color:${color};">$${score.price.toFixed(2)}</strong>` : ''}
            </div>`,
          });

          marker.addListener('click', () => {
            setSelectedStore(storeInfo);
            iw.open(map, marker);
            map.panTo(nearest.geometry.location);
          });

          markersRef.current.push(marker);
        }

        pending--;
        if (pending === 0) {
          const sorted = results.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99) || a.distMiles - b.distMiles);
          setNearbyResults(sorted);
          onNearbyResults?.(sorted);
          setLoading(false);
        }
      });
    });
  }, [priceScores, onNearbyResults]);

  const initMap = useCallback(async (lat, lng, apiKey, label) => {
    await loadGoogleMapsScript(apiKey);
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center:             { lat, lng },
      zoom:               13,
      mapTypeControl:     false,
      fullscreenControl:  false,
      streetViewControl:  false,
      zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
    });

    mapInstanceRef.current = map;
    placeHomeMarker(map, lat, lng, label);
    searchNearbyStores(map, lat, lng);
  }, [searchNearbyStores]);

  const geocodeZip = useCallback(async (zip, apiKey) => {
    await loadGoogleMapsScript(apiKey);
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: zip + ', USA' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          reject(new Error('Zip code not found'));
        }
      });
    });
  }, []);

  // Auto-load from saved address / initialZip on mount
  useEffect(() => {
    const autoLoad = async () => {
      const zip = savedAddress?.zip || initialZip;
      if (!zip) return;

      setZipInput(zip);
      setLoading(true);
      setError(null);

      let apiKey;
      try { apiKey = await getApiKey(); } catch {
        setError('Could not load Maps. Please try again.');
        setLoading(false);
        return;
      }

      try {
        const { lat, lng } = await geocodeZip(zip, apiKey);
        const label = savedAddress?.street
          ? `${savedAddress.street}${savedAddress.apt ? `, ${savedAddress.apt}` : ''}`
          : `Zip ${zip}`;
        setUserLocation({ lat, lng });
        setCurrentZip(zip);
        setAddressLabel(label);
        await initMap(lat, lng, apiKey, label);
      } catch {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => {
              const { latitude: lat, longitude: lng } = pos.coords;
              setUserLocation({ lat, lng });
              setAddressLabel('Your location');
              initMap(lat, lng, apiKey, 'Your location');
            },
            () => { setError('Could not locate zip code. Please enter your zip code.'); setLoading(false); }
          );
        } else {
          setError('Could not locate zip code. Please try another.');
          setLoading(false);
        }
      }
    };
    autoLoad();
  }, [savedAddress?.zip, initialZip]);

  const handleZipSearch = async () => {
    const zip = zipInput.trim().replace(/\D/g, '').slice(0, 5);
    if (zip.length < 5) { setError('Please enter a valid 5-digit zip code.'); return; }

    setGeocoding(true);
    setError(null);
    setNearbyResults([]);
    setSelectedStore(null);

    let apiKey;
    try { apiKey = await getApiKey(); } catch {
      setError('Could not load Maps. Please try again.');
      setGeocoding(false);
      return;
    }

    try {
      const { lat, lng } = await geocodeZip(zip, apiKey);
      setUserLocation({ lat, lng });
      setCurrentZip(zip);
      setAddressLabel(`Zip ${zip}`);
      setGeocoding(false);
      setLoading(true);
      await initMap(lat, lng, apiKey, `Zip ${zip}`);
    } catch {
      setError('Zip code not found. Please check and try again.');
      setGeocoding(false);
    }
  };

  const handleGPS = async () => {
    setError(null);
    setLoading(true);

    let apiKey;
    try { apiKey = await getApiKey(); } catch {
      setError('Could not load Maps. Please try again.');
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation not supported. Please enter your zip code.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        setAddressLabel('Your location');
        await initMap(lat, lng, apiKey, 'Your location');
      },
      () => {
        setError('Could not get your location. Please allow location access or enter your zip code.');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    return () => markersRef.current.forEach(m => m?.setMap?.(null));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: THRFT_BLUE }} />
          <span className="font-bold text-slate-800 text-sm">Nearby Stores</span>
          {hasData && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
              Price scores loaded
            </span>
          )}
        </div>
        <button onClick={handleGPS} disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: THRFT_BLUE }}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
          {userLocation ? 'Refresh' : 'Use GPS'}
        </button>
      </div>

      {/* Zip search */}
      <div className="px-4 py-3 border-b border-slate-100">
        {savedAddress?.street && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-2.5">
            <Home className="w-3.5 h-3.5 shrink-0" style={{ color: THRFT_BLUE }} />
            <p className="text-xs font-semibold text-blue-800 flex-1 truncate">
              {savedAddress.street}{savedAddress.apt ? `, ${savedAddress.apt}` : ''}, {savedAddress.city} {savedAddress.zip}
            </p>
            {savedAddress.zip && currentZip !== savedAddress.zip && (
              <button
                onClick={() => { setZipInput(savedAddress.zip); handleZipSearch(); }}
                className="text-xs font-bold shrink-0"
                style={{ color: THRFT_BLUE }}
              >
                Load →
              </button>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter zip code…"
              value={zipInput}
              maxLength={5}
              onChange={e => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
              onKeyDown={e => e.key === 'Enter' && zipInput.length === 5 && handleZipSearch()}
              className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button onClick={handleZipSearch} disabled={geocoding || zipInput.length < 5}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: THRFT_BLUE }}>
            {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 my-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
      )}

      {!userLocation && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center px-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7" style={{ color: THRFT_BLUE }} />
          </div>
          <p className="font-bold text-slate-800 mb-1 text-sm">
            {hasData ? 'See which nearby stores are cheapest' : 'Find grocery stores near you'}
          </p>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {hasData
              ? 'Enter your zip code or use GPS to see price scores on the map.'
              : 'Enter your zip code or use GPS to find stores near you.'}
          </p>
        </div>
      )}

      <div ref={mapRef} className="w-full transition-all" style={{ height: userLocation ? 280 : 0 }} />

      {userLocation && hasData && (
        <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400 font-medium">Map scores:</p>
          {[['#10b981', 'Cheapest'], ['#f59e0b', 'Mid'], ['#ef4444', 'Priciest']].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      )}

      {nearbyResults.length > 0 && (
        <div className="border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-2">
            {hasData ? 'Nearby stores · sorted by price' : 'Nearby stores · sorted by distance'}
          </p>
          <div>
            {nearbyResults.map((store, i) => (
              <button
                key={store.key}
                onClick={() => {
                  setSelectedStore(prev => prev?.key === store.key ? null : store);
                  mapInstanceRef.current?.panTo({ lat: store.lat, lng: store.lng });
                  mapInstanceRef.current?.setZoom(15);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors text-left"
                style={{ background: selectedStore?.key === store.key ? '#eff6ff' : undefined }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: store.color }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{store.name}</p>
                  <p className="text-xs text-slate-400 truncate">{store.distMiles.toFixed(1)} mi · {store.place?.vicinity}</p>
                </div>
                {store.price !== null ? (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold" style={{ color: store.color }}>${store.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{store.rank === 0 ? '🏆 Best' : `#${store.rank + 1}`}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 shrink-0">{store.distMiles.toFixed(1)} mi</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedStore && (
        <div className="mx-4 mb-4 p-4 rounded-2xl border-2 bg-white shadow-lg" style={{ borderColor: selectedStore.color }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{selectedStore.name}</p>
              <p className="text-xs text-slate-400 mb-2 truncate">{selectedStore.place?.vicinity}</p>
              <p className="text-xs text-slate-400 mb-2">{selectedStore.distMiles.toFixed(1)} miles away</p>
              {selectedStore.price !== null && (
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 shrink-0" style={{ color: selectedStore.color }} />
                  <span className="font-extrabold text-lg" style={{ color: selectedStore.color }}>
                    ${selectedStore.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedStore.rank === 0
                      ? '🏆 Best price for your list'
                      : `#${selectedStore.rank + 1} of ${selectedStore.rankTotal} stores`}
                  </span>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedStore(null)} className="text-slate-300 hover:text-slate-500 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination_place_id=${selectedStore.place?.place_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1.5 text-xs font-bold hover:underline"
            style={{ color: THRFT_BLUE }}
          >
            <Navigation className="w-3 h-3" /> Get Directions →
          </a>
        </div>
      )}
    </div>
  );
}