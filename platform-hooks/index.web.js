/**
 * platform-hooks/index.web.js
 * Web-specific shim for platform-hooks.
 * Excludes native-only modules like react-native-maps.
 */
const React = require('react');
const { useState, useCallback, useEffect, useRef } = React;
const { Platform, View, Text } = require('react-native');

// ─── In-memory store ─────────────────────────────────────────────────────────
const SEED = [
  { id: 'c1', title: 'Burst water pipe near Block A', category: 'water', status: 'in_progress', priority: 'high', description: 'Water has been leaking since morning causing road damage.', location: 'Block A, Gate 2', worker_id: 'w1', created_at: Date.now() - 86400000 * 2, updated_at: Date.now() - 3600000, upvotes: 12, photo: null, lat: 12.9716, lng: 77.5946, ai_risk: 'High', ai_category: 'Water Infrastructure', resolution_notes: '' },
  { id: 'c2', title: 'Street light not working', category: 'electricity', status: 'pending', priority: 'medium', description: 'Three consecutive street lights on Main Avenue are off.', location: 'Main Avenue, Block C', worker_id: null, created_at: Date.now() - 86400000, updated_at: Date.now() - 86400000, upvotes: 8, photo: null, lat: 12.9726, lng: 77.5956, ai_risk: 'Medium', ai_category: 'Electrical Infrastructure', resolution_notes: '' },
  { id: 'c3', title: 'Deep pothole on Entry Road', category: 'roads', status: 'resolved', priority: 'high', description: 'Large pothole causing vehicle damage.', location: 'Entry Road, Main Gate', worker_id: 'w3', created_at: Date.now() - 86400000 * 5, updated_at: Date.now() - 86400000, upvotes: 24, photo: null, lat: 12.9706, lng: 77.5936, ai_risk: 'High', ai_category: 'Road Infrastructure', resolution_notes: 'Pothole filled and road patched successfully.' },
  { id: 'c4', title: 'Suspicious activity near parking', category: 'safety', status: 'pending', priority: 'critical', description: 'Unknown individuals loitering near parking lot B at night.', location: 'Parking Lot B', worker_id: null, created_at: Date.now() - 7200000, updated_at: Date.now() - 7200000, upvotes: 31, photo: null, lat: 12.9736, lng: 77.5966, ai_risk: 'Critical', ai_category: 'Community Safety', resolution_notes: '' },
  { id: 'c5', title: 'Garbage not collected for 3 days', category: 'sanitation', status: 'in_progress', priority: 'medium', description: 'Regular garbage collection missed multiple times this week.', location: 'Block D, Row 4', worker_id: 'w4', created_at: Date.now() - 86400000 * 3, updated_at: Date.now() - 43200000, upvotes: 18, photo: null, lat: 12.9746, lng: 77.5976, ai_risk: 'Medium', ai_category: 'Waste Management', resolution_notes: '' },
];

const store = { complaints: SEED.slice() };
const listeners = new Set();

function notifyAll() {
  listeners.forEach(function(fn) { try { fn(); } catch(e) {} });
}

// ─── useQuery ────────────────────────────────────────────────────────────────
function useQuery(resource) {
  const [, forceUpdate] = useState(0);

  useEffect(function() {
    const fn = function() { forceUpdate(function(n) { return n + 1; }); };
    listeners.add(fn);
    return function() { listeners.delete(fn); };
  }, []);

  const data = store[resource] ? store[resource].slice() : [];
  return { data: data, loading: false, refetch: function() { forceUpdate(function(n) { return n + 1; }); } };
}

// ─── useMutation ─────────────────────────────────────────────────────────────
function useMutation(resource, operation) {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(function(payload) {
    return new Promise(function(resolve, reject) {
      setLoading(true);
      setTimeout(function() {
        try {
          if (!store[resource]) store[resource] = [];
          if (operation === 'insert') {
            store[resource] = [payload].concat(store[resource]);
          } else if (operation === 'update') {
            store[resource] = store[resource].map(function(item) {
              return item.id === payload.id ? Object.assign({}, item, payload.data) : item;
            });
          } else if (operation === 'delete') {
            store[resource] = store[resource].filter(function(item) { return item.id !== payload.id; });
          }
          notifyAll();
          setLoading(false);
          resolve({ success: true });
        } catch(e) {
          setLoading(false);
          reject(e);
        }
      }, 500);
    });
  }, [resource, operation]);

  return { mutate: mutate, loading: loading };
}

// ─── useCamera ───────────────────────────────────────────────────────────────
function useCamera() {
  const [photo, setPhoto] = useState(null);

  const takePhoto = useCallback(function() {
    return new Promise(function(resolve) {
      resolve({ error: 'Camera not available on web. Please use Upload File instead.' });
    });
  }, []);

  return { takePhoto: takePhoto, photo: photo };
}

// ─── useLocation ─────────────────────────────────────────────────────────────
function useLocation() {
  const getCurrentLocation = useCallback(function() {
    return new Promise(function(resolve) {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) { resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); },
          function() { resolve({ latitude: 12.9716, longitude: 77.5946 }); },
          { timeout: 8000 }
        );
      } else {
        resolve({ latitude: 12.9716, longitude: 77.5946 });
      }
    });
  }, []);

  return { getCurrentLocation: getCurrentLocation };
}

// ─── useShare ────────────────────────────────────────────────────────────────
function useShare() {
  const share = useCallback(function(options) {
    return new Promise(function(resolve) {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ text: options.message || '', url: options.url || '' })
          .then(function() { resolve({ success: true }); })
          .catch(function(e) { resolve({ error: e.message }); });
      } else {
        resolve({ success: true });
      }
    });
  }, []);

  return { share: share };
}

// ─── useMaps ─────────────────────────────────────────────────────────────────
function useMaps(initialRegion) {
  const defaultRegion = initialRegion || { latitude: 12.9716, longitude: 77.5946, latitudeDelta: 0.03, longitudeDelta: 0.03 };
  const [region, setRegion] = useState(defaultRegion);
  const mapRef = { current: null };

  // Web fallback: Just a placeholder view
  const MockMap = function({ style, children }) {
    return (
      <View style={[{ backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ color: '#666' }}>Map View Mock (Web)</Text>
        {children}
      </View>
    );
  };

  const MockMarker = function({ coordinate, title, description, children }) {
    return (
      <View style={{ position: 'absolute', top: '50%', left: '50%' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'red' }} />
        {children}
      </View>
    );
  };

  return { 
    MapView: MockMap, 
    Marker: MockMarker, 
    mapRef: mapRef, 
    region: region, 
    setRegion: setRegion, 
    isAvailable: true 
  };
}

// ─── useFilePicker ───────────────────────────────────────────────────────────
function useFilePicker() {
  const [lastFile, setLastFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickDocument = useCallback(function(options) {
    setIsLoading(true);
    try {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = (options && options.type) ? options.type.join(',') : '*/*';
      input.onchange = function(e) {
        var file = e.target && e.target.files && e.target.files[0];
        if (file) {
          var uri = URL.createObjectURL(file);
          setLastFile({ uri: uri, name: file.name, size: file.size, mimeType: file.type });
        }
        setIsLoading(false);
      };
      input.click();
    } catch(e) { setIsLoading(false); }
  }, []);

  return { pickDocument: pickDocument, lastFile: lastFile, isLoading: isLoading };
}

module.exports = {
  useQuery: useQuery,
  useMutation: useMutation,
  useCamera: useCamera,
  useLocation: useLocation,
  useShare: useShare,
  useMaps: useMaps,
  useFilePicker: useFilePicker,
};
