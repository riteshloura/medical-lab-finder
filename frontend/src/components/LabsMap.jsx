import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { useEffect } from "react";
import { Building2, MapPin, Phone, Navigation } from "lucide-react";
import { Button, Chip } from "@heroui/react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// Custom marker icons
const userIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" width="48" height="48">
      <circle cx="24" cy="24" r="22" fill="#10b981" opacity="0.2"/>
      <circle cx="24" cy="24" r="16" fill="#10b981"/>
      <circle cx="24" cy="24" r="10" fill="white"/>
      <circle cx="24" cy="24" r="6" fill="#10b981"/>
    </svg>
  `),
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

const labIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60" width="48" height="60">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M24 0C11 0 0 11 0 24c0 18 24 36 24 36s24-18 24-36C48 11 37 0 24 0z" fill="#0d9488" filter="url(#shadow)"/>
      <circle cx="24" cy="22" r="14" fill="white"/>
      <path d="M24 12a10 10 0 100 20 10 10 0 000-20zm-1.5 4h3v6h3.5l-5 5-5-5h3.5v-6z" fill="#0d9488"/>
    </svg>
  `),
  iconSize: [48, 60],
  iconAnchor: [24, 60],
  popupAnchor: [0, -60],
});

// Component to recenter map when location changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, {
        animate: true,
        duration: 1,
      });
    }
  }, [center, map]);
  return null;
}

// Lab Popup Content Component
function LabPopupContent({ lab }) {
  return (
    <div className="p-4 min-w-[260px]">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{lab.name}</h3>
          <p className="text-xs text-gray-500">{lab.city}, {lab.state}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{lab.address}</p>
      </div>
      
      {lab.contactNumber && (
        <div className="flex items-center gap-2 mb-3">
          <Phone className="w-4 h-4 text-gray-400" />
          <p className="text-sm text-gray-600">{lab.contactNumber}</p>
        </div>
      )}

      {lab.slotCapacityOnline > 0 && (
        <div className="mb-3">
          <Chip size="sm" color="success" variant="flat">
            {lab.slotCapacityOnline} slots available
          </Chip>
        </div>
      )}
      
      <Link to={`/lab/${lab.id}`}>
        <Button
          size="sm"
          fullWidth
          className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          View Lab Details
        </Button>
      </Link>
    </div>
  );
}

function LabsMap({ userLocation, labs, className = "" }) {
  // Default center (India) if no user location
  const defaultCenter = [20.5937, 78.9629];
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;
  const zoom = userLocation ? 13 : 5;

  return (
    <div className={`rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200 bg-white ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={true}
        className="h-full w-full"
        style={{ 
          minHeight: "500px",
          height: "100%",
          width: "100%",
          zIndex: 0
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
        />
        
        <RecenterMap center={userLocation ? [userLocation.lat, userLocation.lng] : null} />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
                  <Navigation className="w-5 h-5" />
                  <span className="text-sm">Your Location</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Lab Markers */}
        {labs && labs.length > 0 && labs.map((lab) => (
          lab.latitude && lab.longitude && (
            <Marker
              key={lab.id}
              position={[lab.latitude, lab.longitude]}
              icon={labIcon}
            >
              <Popup className="lab-popup" maxWidth={300}>
                <LabPopupContent lab={lab} />
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

export default LabsMap;
