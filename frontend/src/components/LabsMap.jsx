import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { useEffect } from "react";
import { Building2, MapPin, Phone, Navigation, Clock, Shield, ChevronRight, ExternalLink } from "lucide-react";
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
// All layout uses explicit inline styles so Leaflet's or Tailwind's global CSS
// cannot interfere with alignment.

function LabPopupContent({ lab }) {
  return (
    <div style={{
      width: "280px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "block",
      overflow: "hidden",
    }}>

      {/* ── Header band ── */}
      <div style={{
        background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
        padding: "16px",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "12px",
        boxSizing: "border-box",
        width: "100%",
      }}>
        {/* Lab icon */}
        <div style={{
          width: "42px",
          height: "42px",
          minWidth: "42px",
          background: "rgba(255,255,255,0.18)",
          borderRadius: "11px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1.5px solid rgba(255,255,255,0.3)",
        }}>
          <Building2 size={20} color="white" strokeWidth={2} />
        </div>

        {/* Name + location */}
        <div style={{ flex: "1 1 0", minWidth: 0, overflow: "hidden" }}>
          <p style={{
            margin: 0,
            padding: 0,
            fontWeight: 700,
            fontSize: "14px",
            color: "white",
            lineHeight: "1.35",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {lab.name}
          </p>
          <p style={{
            margin: "4px 0 0",
            padding: 0,
            fontSize: "11px",
            color: "rgba(255,255,255,0.72)",
            lineHeight: "1",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {lab.city}{lab.state ? `, ${lab.state}` : ""}
          </p>
        </div>

        {/* Verified pill */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "4px",
          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: "20px",
          padding: "4px 9px",
        }}>
          <Shield size={10} color="white" strokeWidth={2.5} />
          <span style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "white",
            letterSpacing: "0.4px",
            lineHeight: 1,
          }}>
            Verified
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        background: "white",
        padding: "14px 16px 16px",
        boxSizing: "border-box",
        width: "100%",
      }}>

        {/* Address */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "8px",
          marginBottom: "9px",
        }}>
          <div style={{ flexShrink: 0, marginTop: "2px" }}>
            <MapPin size={13} color="#9ca3af" strokeWidth={2} />
          </div>
          <p style={{
            margin: 0,
            padding: 0,
            fontSize: "12px",
            color: "#4b5563",
            lineHeight: "1.55",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {lab.address}
          </p>
        </div>

        {/* Phone */}
        {lab.contactNumber && (
          <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            marginBottom: "9px",
          }}>
            <div style={{ flexShrink: 0 }}>
              <Phone size={13} color="#9ca3af" strokeWidth={2} />
            </div>
            <p style={{
              margin: 0,
              padding: 0,
              fontSize: "12px",
              color: "#4b5563",
              lineHeight: 1,
            }}>
              {lab.contactNumber}
            </p>
          </div>
        )}

        {/* Slots available */}
        {lab.slotCapacityOnline > 0 && (
          <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            marginBottom: "13px",
          }}>
            <div style={{ flexShrink: 0 }}>
              <Clock size={13} color="#10b981" strokeWidth={2} />
            </div>
            <p style={{
              margin: 0,
              padding: 0,
              fontSize: "12px",
              fontWeight: 600,
              color: "#059669",
              lineHeight: 1,
            }}>
              {lab.slotCapacityOnline} slots available
            </p>
            {/* Live dot */}
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              animation: "pulse 2s infinite",
              flexShrink: 0,
            }} />
          </div>
        )}

        {/* Divider */}
        <div style={{
          height: "1px",
          background: "#f3f4f6",
          marginBottom: "13px",
        }} />

        {/* CTA buttons row */}
        <div style={{ display: "flex", flexDirection: "row", gap: "8px", boxSizing: "border-box", width: "100%" }}>

          {/* Get Directions */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lab.latitude},${lab.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", flex: 1 }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1.5px solid #bfdbfe",
                borderRadius: "10px",
                height: "38px",
                fontSize: "11.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                letterSpacing: "0.1px",
                boxSizing: "border-box",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1d4ed8";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#eff6ff";
                e.currentTarget.style.color = "#1d4ed8";
                e.currentTarget.style.borderColor = "#bfdbfe";
              }}
            >
              <Navigation size={13} strokeWidth={2.5} />
              Directions
            </div>
          </a>

          {/* View Lab Details */}
          <Link to={`/lab/${lab.id}`} style={{ textDecoration: "none", flex: 1 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                background: "#111827",
                color: "white",
                borderRadius: "10px",
                height: "38px",
                fontSize: "11.5px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s ease",
                letterSpacing: "0.1px",
                boxSizing: "border-box",
                width: "100%",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#0d9488"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#111827"; }}
            >
              View Details
              <ChevronRight size={13} strokeWidth={2.5} />
            </div>
          </Link>
        </div>
      </div>
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
            <Popup className="user-popup" closeButton={false}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", color: "#065f46", fontWeight: 600, fontSize: "13px" }}>
                <Navigation size={15} color="#10b981" />
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