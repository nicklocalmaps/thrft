import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Loader2, Navigation, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALL_STORES } from '@/lib/storeConfig';
import { base44 } from '@/api/base44Client';

const THRFT_BLUE = '#4181ed';

// Store name -> search term mapping for Places API
const STORE_SEARCH_TERMS = {
  kroger: 'Kroger', walmart: 'Walmart Supercenter', amazon: 'Amazon Fresh',
  whole_foods: 'Whole Foods Market', trader_joes: "Trader Joe's", aldi: 'Aldi',
  target: 'Target', publix: 'Publix', safeway: 'Safeway', albertsons: 'Albertsons',
  heb: 'H-E-B', meijer: 'Meijer', wegmans: 'Wegmans', costco: 'Costco',
  food_lion: 'Food Lion', stop_shop: 'Stop & Shop', giant_food: 'Giant Food',
  shoprite: 'ShopRite', harris_teeter: 'Harris Teeter', fred_meyer: 'Fred Meyer',
  king_soopers: 'King Soopers', hyvee: 'Hy-Vee', winn_dixie: 'Winn-Dixie',
  jewel_osco: 'Jewel-Osco', hannaford: 'Hannaford',
};

// Score color: green = cheap, amber = mid, red = expensive
function scoreColor(rank, total) {
  if (total <= 1) return '#4181ed';
  const pct = rank / (total - 1);
  if (pct <= 0.33) return '#10b981';
  if (pct <= 0.66) return '#f59e0b';
  return '#ef4444';
}

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve();
    const existing = document.getElementById('gmaps-script');
    if (existing) { existing.addEventListener('load', resolve); return; }
    const script = document.createElement('script');
    script.id = 'gmaps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function NearbyStoresMap({ priceData, listName }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Compute price scores from priceData
  const priceScores = React.useMemo(() => {
    if (!priceData) return {};
    const entries = Object.entries(priceData).map(([key, d]) => {
      const total = Array.isArray(d) ? d.reduce((s, i) => s + (i.price || 0), 0) : (d?.instore_total ?? 0);
      return { key, total };
    }).filter(e => e.total > 0).sort((a, b) => a.total - b.total);
    return Object.fromEntries(entries.map((e, i) => [e.key, { rank: i, total: entries.length, price: e.total }]));
  }, [priceData]);

  const initMap = async (lat, lng, apiKey) => {
    await loadGoogleMapsScript(apiKey);
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 13,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapInstanceRef.current = map;

    // User marker
    new window.google.maps.Marker({
      position: { lat, lng },
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: THRFT_BLUE,
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 3,
      },
      title: 'Your Location',
      zIndex: 999,
    });

    setMapReady(true);
    searchNearbyStores(map, lat, lng);
  };

  const searchNearbyStores = (map, lat, lng) => {
    const service = new window.google.maps.places.PlacesService(map);
    const compared = Object.keys(priceScores);

    // Only search for stores we have price data for
    const storeKeys = compared.length > 0 ? compared : Object.keys(STORE_SEARCH_TERMS).slice(0, 6);

    const results = [];
    let pending = storeKeys.length;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    storeKeys.forEach(key => {
      const term = STORE_SEARCH_TERMS[key] || ALL_STORES.find(s => s.key === key)?.name || key;
      const request = {
        location: new window.google.maps.LatLng(lat, lng),
        radius: 16000, // 10 miles
        keyword: term,
        type: 'grocery_or_supermarket',
      };

      service.nearbySearch(request, (places, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && places?.length) {
          const nearest = places[0];
          const score = priceScores[key];
          const color = score ? scoreColor(score.rank, score.total) : THRFT_BLUE;

          const storeInfo = {
            key,
            name: ALL_STORES.find(s => s.key === key)?.name || term,
            place: nearest,
            lat: nearest.geometry.location.lat(),
            lng: nearest.geometry.location.lng(),
            price: score?.price ?? null,
            rank: score?.rank ?? null,
            rankTotal: score?.total ?? null,
            color,
          };

          results.push(storeInfo);

          // Custom marker
          const marker = new window.google.maps.Marker({
            position: nearest.geometry.location,
            map,
            title: storeInfo.name,
            label: {
              text: score ? `$${score.price.toFixed(0)}` : '●',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 22,
              fillColor: color,
              fillOpacity: 0.92,
              strokeColor: 'white',
              strokeWeight: 2.5,
            },
          });

          marker.addListener('click', () => setSelectedStore(storeInfo));
          markersRef.current.push(marker);
        }

        pending--;
        if (pending === 0) {
          setNearbyResults(results.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)));
          setLoading(false);
        }
      });
    });
  };

  const handleLocate = async () => {
    setError(null);
    setLoading(true);

    // Fetch Maps API key from backend
    let apiKey;
    try {
      const res = await base44.functions.invoke('getMapsApiKey', {});
      apiKey = res.data?.key;
      if (!apiKey) throw new Error('No key returned');
    } catch {
      setError('Could not load Maps API. Please try again.');
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    // Override the loadGoogleMapsScript call with the fetched key
    window.__thrft_maps_key = apiKey;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        initMap(lat, lng, apiKey);
      },
      () => {
        setError('Could not get your location. Please allow location access and try again.');
        setLoading(false);
      }
    );
  };

  // Cleanup
  useEffect(() => {
    return () => markersRef.current.forEach(m => m?.setMap?.(null));
  }, []);

  const hasData = Object.keys(priceScores).length > 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4" style={{ color: THRFT_BLUE }} />
          <span className="font-semibold text-slate-800">Nearby Stores & Prices</span>
          {hasData && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
              Price scores loaded
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleLocate}
          disabled={loading}
          className="rounded-xl gap-1.5 text-xs h-8"
          style={{ backgroundColor: THRFT_BLUE }}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
          {userLocation ? 'Refresh' : 'Find Nearby Stores'}
        </Button>
      </div>

      {/* Hint before map loads */}
      {!userLocation && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center px-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7" style={{ color: THRFT_BLUE }} />
          </div>
          <p className="font-semibold text-slate-800 mb-1">See which nearby stores are cheapest</p>
          <p className="text-sm text-slate-400 max-w-xs">
            {hasData
              ? 'Click "Find Nearby Stores" to see price scores overlaid on a map of stores near you.'
              : 'Run a price comparison first, then click "Find Nearby Stores" to see scores on the map.'}
          </p>
        </div>
      )}

      {error && (
        <div className="mx-5 my-3 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
      )}

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full transition-all"
        style={{ height: userLocation ? '380px' : '0px' }}
      />

      {/* Store list below map */}
      {nearbyResults.length > 0 && (
        <div className="px-5 pb-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Nearby Stores — by price</p>
          <div className="space-y-2">
            {nearbyResults.map((store, i) => (
              <button
                key={store.key}
                onClick={() => {
                  setSelectedStore(store);
                  mapInstanceRef.current?.panTo({ lat: store.lat, lng: store.lng });
                  mapInstanceRef.current?.setZoom(15);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: store.color }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{store.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{store.place?.vicinity}</p>
                  </div>
                </div>
                {store.price !== null ? (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: store.color }}>${store.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">
                      {store.rank === 0 ? '🏆 Best price' : `#${store.rank + 1} of ${store.rankTotal}`}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No price data</span>
                )}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Map score:</p>
            {[['#10b981', 'Cheapest'], ['#f59e0b', 'Mid'], ['#ef4444', 'Priciest']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected store info card */}
      {selectedStore && (
        <div className="mx-5 mb-4 p-4 rounded-2xl border-2 bg-white shadow-md" style={{ borderColor: selectedStore.color }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-slate-900">{selectedStore.name}</p>
              <p className="text-xs text-slate-400 mb-2">{selectedStore.place?.vicinity}</p>
              {selectedStore.price !== null && (
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" style={{ color: selectedStore.color }} />
                  <span className="font-bold text-lg" style={{ color: selectedStore.color }}>
                    ${selectedStore.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedStore.rank === 0
                      ? '🏆 Best price for your list'
                      : `Rank #${selectedStore.rank + 1} of ${selectedStore.rankTotal} stores`}
                  </span>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedStore(null)} className="text-slate-300 hover:text-slate-500 ml-2 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination_place_id=${selectedStore.place?.place_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold hover:underline"
            style={{ color: THRFT_BLUE }}
          >
            <Navigation className="w-3 h-3" /> Get Directions →
          </a>
        </div>
      )}
    </div>
  );
}