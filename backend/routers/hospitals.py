from fastapi import APIRouter, HTTPException
import math
import httpx
import schemas

router = APIRouter(tags=["hospitals"])

# ── Haversine distance formula ─────────────────────────────────────────────────
def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two GPS coordinates."""
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


# ── Overpass API helpers ───────────────────────────────────────────────────────
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",   # mirror 1
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",  # mirror 2
]

HEADERS = {
    # Overpass returns 406 if no User-Agent is set
    "User-Agent": "TonyHealthApp/1.0 (health analysis platform; contact@tonyhealth.app)",
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json",
}

def build_overpass_query(lat: float, lon: float, radius_m: int = 10000) -> str:
    """
    Returns an Overpass QL query that fetches hospitals + clinics within `radius_m` metres.
    Uses `out center` so that WAY elements get a centroid lat/lon.
    """
    return f"""
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:{radius_m},{lat},{lon});
  way["amenity"="hospital"](around:{radius_m},{lat},{lon});
  node["amenity"="clinic"](around:{radius_m},{lat},{lon});
  way["amenity"="clinic"](around:{radius_m},{lat},{lon});
);
out center;
"""


async def query_overpass(query: str) -> dict:
    """Try each Overpass mirror in turn; return the first successful JSON response."""
    async with httpx.AsyncClient(timeout=35, follow_redirects=True) as client:
        for endpoint in OVERPASS_ENDPOINTS:
            try:
                resp = await client.post(
                    endpoint,
                    data={"data": query},   # httpx handles URL-form-encoding correctly
                    headers={
                        "User-Agent": "TonyHealthApp/1.0 (health analysis platform; contact@tonyhealth.app)",
                        "Accept": "application/json",
                    },
                )
                if resp.status_code == 200:
                    return resp.json()
                # Log non-200 to aid debugging but keep trying mirrors
            except Exception:
                continue  # try next mirror
    raise RuntimeError("All Overpass mirrors failed or timed out.")


# ── Route ──────────────────────────────────────────────────────────────────────
@router.post("/nearby-hospitals")
async def get_nearby_hospitals(location: schemas.LocationRequest):
    """
    Fetch nearby hospitals & clinics using OpenStreetMap Overpass API.
    Returns up to 15 results sorted by distance (closest first).
    Each result includes a Google Maps directions URL.
    """
    lat = location.latitude
    lon = location.longitude

    query = build_overpass_query(lat, lon)

    try:
        data = await query_overpass(query)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hospital search failed: {str(e)}")

    hospitals = []
    seen_names: set[str] = set()

    for el in data.get("elements", []):
        tags = el.get("tags", {})
        name = tags.get("name", "").strip()
        if not name:
            continue

        # Deduplicate by name (node + way often appear for the same building)
        if name in seen_names:
            continue
        seen_names.add(name)

        # `node` elements have top-level lat/lon; `way` elements have center{}
        el_lat = el.get("lat") or (el.get("center") or {}).get("lat")
        el_lon = el.get("lon") or (el.get("center") or {}).get("lon")
        if not el_lat or not el_lon:
            continue

        distance = haversine(lat, lon, el_lat, el_lon)

        # Build a Google Maps directions link for one-tap navigation
        maps_url = (
            f"https://www.google.com/maps/dir/?api=1"
            f"&destination={el_lat},{el_lon}"
            f"&destination_place_id={name.replace(' ', '+')}"
        )

        hospitals.append({
            "id":           el.get("id"),
            "name":         name,
            "type":         tags.get("amenity", "hospital").capitalize(),
            "address":      ", ".join(filter(None, [
                                tags.get("addr:street"),
                                tags.get("addr:housenumber"),
                                tags.get("addr:city"),
                            ])) or None,
            "phone":        tags.get("phone") or tags.get("contact:phone") or tags.get("telephone"),
            "website":      tags.get("website") or tags.get("contact:website"),
            "emergency":    tags.get("emergency"),
            "opening_hours": tags.get("opening_hours"),
            "latitude":     el_lat,
            "longitude":    el_lon,
            "distance_km":  distance,
            "maps_url":     maps_url,
        })

    hospitals.sort(key=lambda x: x["distance_km"])
    return {"hospitals": hospitals[:15], "total": len(hospitals)}
