import React, { useState, useRef, useCallback, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { COLORS } from "../constants";
import { useTheme } from "../theme/ThemeProvider";
import { charlestonPubs } from "@/data/pubs";

export type PubPin = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
};

export type MapControls = {
  animateTo: (lat: number, lon: number) => void;
};

const LEAFLET_CSS = `
  .leaflet-container { width: 100%; height: 100%; font-family: inherit; }
  .leaflet-popup-content-wrapper { border-radius: 8px; }
  .leaflet-popup-content { margin: 8px 12px; font-size: 14px; }
  .leaflet-popup-content .pub-popup { cursor: pointer; }
  .leaflet-popup-content .pub-popup:hover { text-decoration: underline; }
`;

const ProviderLocationMap = ({
  initialLatitude,
  initialLongitude,
  onPubsChanged,
  onPubPress,
  onMapReady,
}: {
  initialLatitude: number;
  initialLongitude: number;
  onPubsChanged?: (pubs: PubPin[]) => void;
  onPubPress?: (pub: PubPin) => void;
  onMapReady?: (controls: MapControls) => void;
}) => {
  const { dark } = useTheme();
  const [pubs, setPubs] = useState<PubPin[]>([]);
  const [loading, setLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPubPressRef = useRef(onPubPress);
  onPubPressRef.current = onPubPress;

  const updatePubs = useCallback((newPubs: PubPin[]) => {
    setPubs(newPubs);
    onPubsChanged?.(newPubs);
  }, [onPubsChanged]);

  const loadFallback = useCallback(() => {
    const fallback = charlestonPubs.map((p: any) => ({
      id: p.id.toString(),
      latitude: p.latitude,
      longitude: p.longitude,
      name: p.name,
      address: p.address,
    }));
    updatePubs(fallback);
  }, [updatePubs]);

  const fetchPubsInRegion = useCallback(async (bounds: { south: number; north: number; west: number; east: number }) => {
    setLoading(true);
    try {
      const overpassQuery = [
        "[out:json][timeout:15];",
        "(",
        `node["amenity"~"pub|bar|biergarten"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});`,
        `way["amenity"~"pub|bar|biergarten"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});`,
        `node["leisure"="beer_garden"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});`,
        `way["leisure"="beer_garden"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});`,
        ");",
        "out center 200;",
      ].join("");

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(overpassQuery),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.ok) {
        const data = await response.json();
        const fetched: PubPin[] = (data.elements || [])
          .filter((el: any) => el.tags?.name)
          .map((el: any) => ({
            id: el.id.toString(),
            latitude: el.lat || el.center?.lat,
            longitude: el.lon || el.center?.lon,
            name: el.tags.name,
            address: [
              el.tags["addr:housenumber"],
              el.tags["addr:street"],
              el.tags["addr:city"],
              el.tags["addr:state"],
            ]
              .filter(Boolean)
              .join(", ") || "Nearby",
          }))
          .filter((p: PubPin) => p.latitude && p.longitude);

        if (fetched.length > 0) {
          updatePubs(fetched);
        } else {
          loadFallback();
        }
      } else {
        loadFallback();
      }
    } catch {
      loadFallback();
    }
    setLoading(false);
  }, [updatePubs, loadFallback]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Inject CSS
    const styleEl = document.createElement("style");
    styleEl.textContent = LEAFLET_CSS;
    document.head.appendChild(styleEl);

    // Load Leaflet CSS from CDN
    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkEl);

    const L = require("leaflet");

    // Fix default marker icons for webpack/metro
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current).setView(
      [initialLatitude, initialLongitude],
      14
    );

    const tileUrl = dark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("moveend", () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const b = map.getBounds();
        fetchPubsInRegion({
          south: b.getSouth(),
          north: b.getNorth(),
          west: b.getWest(),
          east: b.getEast(),
        });
      }, 800);
    });

    mapInstanceRef.current = map;

    if (onMapReady) {
      onMapReady({
        animateTo: (lat: number, lon: number) => {
          map.flyTo([lat, lon], 15, { duration: 0.5 });
        },
      });
    }

    // Initial fetch
    fetchPubsInRegion({
      south: initialLatitude - 0.03,
      north: initialLatitude + 0.03,
      west: initialLongitude - 0.03,
      east: initialLongitude + 0.03,
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      styleEl.remove();
      linkEl.remove();
    };
  }, []);

  // Update markers when pubs change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const L = require("leaflet");

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pubs.forEach((pub) => {
      const marker = L.marker([pub.latitude, pub.longitude]).addTo(map);
      const popupContent = document.createElement("div");
      popupContent.className = "pub-popup";
      popupContent.innerHTML = `<strong>${pub.name}</strong><br/><small>Tap to rate</small>`;
      popupContent.addEventListener("click", () => {
        onPubPressRef.current?.(pub);
      });
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });
  }, [pubs]);

  return (
    <View style={styles.container}>
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: 400,
          borderRadius: 12,
          overflow: "hidden",
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding pubs...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%" as any,
    height: 400,
    borderRadius: 16,
    paddingVertical: 12,
  },
  loadingOverlay: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: "medium",
  },
});

export default ProviderLocationMap;
