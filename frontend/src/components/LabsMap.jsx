import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { useEffect } from "react";
import { Building2, MapPin, Phone, Navigation, Clock, Shield } from "lucide-react";
import { Chip } from "@heroui/react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// ── Custom Icons ──────────────────────────────────────────────────────────────

const userIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" fill="none" width="44" height="44">
      <circle cx="22" cy="22" r="20" fill="#10b981" fill-opacity="0.15"/>
      <circle cx="22" cy="22" r="13" fill="#10b981"/>
      <circle cx="22" cy="22" r="7" fill="white"/>
      <circle cx="22" cy="22" r="4" fill="#10b981"/>
    </svg>
  `),
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

const labIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="40" height="52">
      <defs>
        <filter id="s" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M20 0C9 0 0 9 0 20c0 15 20 32 20 32S40 35 40 20C40 9 31 0 20 0z" fill="#0d9488" filter="url(#s)"/>
      <circle cx="20" cy="19" r="11" fill="white"/>
      <path d="M15.5 13h9v2h-3.5v4.5l4 6h-9l4-6V15H15.5v-2z" fill="#0d9488"/>
    </svg>
  `),
  iconSize: [40, 52],
  iconAnchor: [20, 52],
  popupAnchor: [0, -54],
});

const selectedLabIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 62" width="48" height="62">
      <defs>
        <filter id="ss" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path d="M24 0C10.7 0 0 10.7 0 24c0 18 24 38 24 38S48 42 48 24C48 10.7 37.3 0 24 0z" fill="#059669" filter="url(#ss)"/>
      <circle cx="24" cy="22" r="14" fill="white"/>
      <path d="M18.5 15h11v2.5h-4v5.5l5 7.5H17.5l5-7.5V17.5H18.5V15z" fill="#059669"/>
    </svg>
  `),
  iconSize: [48, 62],
  iconAnchor: [24, 62],
  popupAnchor: [0, -64],
});

// ── Recenter helper ────────────────────────────────────────────────────────────

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14, { animate: true, duration: 0.8 });
    }
  }, [center, map]);
  return null;
}

// ── Lab popup content ──────────────────────────────────────────────────────────

function LabPopupContent({ lab }) {
  return (
    <div className="p-3 min-w-[240px] max-w-[280px]">
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{lab.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{lab.city}, {lab.state}</p>
        </div>
      </div>

      {/* Verified */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <Shield className="w-3 h-3 text-emerald-500" />
        <span className="text-[11px] font-semibold text-emerald-600">Verified Lab</span>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-2">
        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{lab.address}</p>
      </div>

      {/* Phone */}
      {lab.contactNumber && (
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-xs text-gray-600">{lab.contactNumber}</p>
        </div>
      )}

      {/* Slots */}
      {lab.slotCapacityOnline > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-600">{lab.slotCapacityOnline} slots available</span>
        </div>
      )}

      {/* CTA */}
      <Link to={`/lab/${lab.id}`}>
        <div className="w-full h-8 bg-gray-900 hover:bg-teal-700 rounded-xl text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer">
          View Lab Details →
        </div>
      </Link>
    </div>
  );
}

// ── Main map component ─────────────────────────────────────────────────────────

function LabsMap({ userLocation, labs, selectedLab, className = "" }) {
  const defaultCenter = [20.5937, 78.9629];
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;
  const zoom = userLocation ? 13 : 5;

  return (
    <div className={`overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        {/* Clean, light tile layer — similar to Google Maps style */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <RecenterMap
          center={
            selectedLab?.latitude && selectedLab?.longitude
              ? [selectedLab.latitude, selectedLab.longitude]
              : userLocation
              ? [userLocation.lat, userLocation.lng]
              : null
          }
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="custom-popup" closeButton={false}>
              <div className="px-3 py-2 flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <Navigation className="w-4 h-4" />
                You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Lab markers */}
        {labs?.map(
          (lab) =>
            lab.latitude &&
            lab.longitude && (
              <Marker
                key={lab.id}
                position={[lab.latitude, lab.longitude]}
                icon={selectedLab?.id === lab.id ? selectedLabIcon : labIcon}
              >
                <Popup className="lab-popup" maxWidth={300} closeButton={false}>
                  <LabPopupContent lab={lab} />
                </Popup>
              </Marker>
            )
        )}
      </MapContainer>
    </div>
  );
}

export default LabsMap;