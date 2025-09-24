import os
import logging
from datetime import datetime
from typing import Optional

import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/tlv300")
WHOIS_API_KEY = os.getenv("WHOIS_API_KEY", "")
WHOIS_BASE_URL = "https://www.whoisxmlapi.com/whoisserver/WhoisService"

# Mongo (optional, degrade gracefully if not available)
mongo_client = None
lookups_collection = None
try:
    from pymongo import MongoClient  # type: ignore

    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1000)
    default_db = None
    try:
        default_db = mongo_client.get_default_database()
    except Exception:
        default_db = None
    db_name = default_db.name if default_db is not None else "tlv300"
    db = mongo_client.get_database(db_name)
    lookups_collection = db.get_collection("lookups")
    # Trigger a quick ping
    mongo_client.admin.command("ping")
except Exception as e:
    logging.warning(f"MongoDB not available or misconfigured: {e}")
    mongo_client = None
    lookups_collection = None


class DomainInfo(BaseModel):
    domainName: str
    registrar: str
    registrationDate: str
    expirationDate: str
    estimatedDomainAge: str
    hostnames: str


class ContactInfo(BaseModel):
    registrantName: str
    technicalContactName: str
    administrativeContactName: str
    contactEmail: str


app = FastAPI(title="TLV300 WHOIS API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _normalize_date_str(s: str) -> str:
    s = s.strip()
    # common suffixes
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    s = s.replace(" UTC", "+00:00")
    # ensure "T" separator
    if "T" not in s and " " in s[:20]:
        s = s.replace(" ", "T", 1)
    # normalize timezone offset like +HHMM to +HH:MM
    import re
    m = re.search(r"([+-])(\d{2})(\d{2})$", s)
    if m and ":" not in s[-6:]:
        s = s[: m.start()] + f"{m.group(1)}{m.group(2)}:{m.group(3)}"
    return s


def _parse_datetime(s: str) -> Optional[datetime]:
    try:
        from datetime import timezone
        dt = datetime.fromisoformat(_normalize_date_str(s))
        # make naive UTC
        if dt.tzinfo is not None:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        return dt
    except Exception:
        pass
    # fallback common patterns
    from datetime import timezone
    patterns = [
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d-%b-%Y",
    ]
    for p in patterns:
        try:
            dt = datetime.strptime(s, p)
            # naive -> assume UTC
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).replace(tzinfo=None)
        except Exception:
            continue
    return None


def _calculate_domain_age(registration_date: Optional[str]) -> str:
    if not registration_date:
        return "Unknown"
    dt = _parse_datetime(registration_date)
    if not dt:
        return "Unknown"
    now = datetime.utcnow()
    years = int((now - dt).days // 365)
    return f"{years} years"


def _truncate_hostnames(hostnames: Optional[list[str]]) -> str:
    if not hostnames:
        return ""
    s = ", ".join(hostnames)
    return (s[:22] + "...") if len(s) > 25 else s


def _first(*values: Optional[str]) -> Optional[str]:
    for v in values:
        if v:
            return v
    return None


def _extract_domain_info(whois_data: dict) -> DomainInfo:
    record = whois_data.get("WhoisRecord", {})
    registry = record.get("registryData", {})
    ns = registry.get("nameServers", {})
    created = _first(
        registry.get("createdDateNormalized"),
        registry.get("createdDate"),
        record.get("createdDateNormalized"),
        record.get("createdDate"),
    )
    expires = _first(
        registry.get("expiresDateNormalized"),
        registry.get("expiresDate"),
        record.get("expiresDateNormalized"),
        record.get("expiresDate"),
    )
    return DomainInfo(
        domainName=record.get("domainName", "N/A"),
        registrar=registry.get("registrarName") or record.get("registrarName", "N/A"),
        registrationDate=created or "N/A",
        expirationDate=expires or "N/A",
        estimatedDomainAge=_calculate_domain_age(created),
        hostnames=_truncate_hostnames(ns.get("hostNames", [])),
    )


def _extract_contact_info(whois_data: dict) -> ContactInfo:
    record = whois_data.get("WhoisRecord", {})
    registry = record.get("registryData", {})
    contacts = registry.get("contacts") or record.get("contacts") or {}

    def _pick_contact(role: str) -> dict:
        # primary from contacts
        if isinstance(contacts, dict) and role in contacts and isinstance(contacts[role], dict):
            return contacts[role]
        # alternate key names
        alt_keys = {
            "technical": ["technical", "technicalContact", "tech"],
            "administrative": ["administrative", "administrativeContact", "admin"],
            "registrant": ["registrant", "owner"],
        }[role]
        for k in alt_keys:
            v = registry.get(k) or record.get(k)
            if isinstance(v, dict):
                return v
        return {}

    registrant = _pick_contact("registrant")
    technical = _pick_contact("technical")
    administrative = _pick_contact("administrative")

    def _name(o: dict) -> str:
        return o.get("name") or o.get("organization") or "N/A"

    def _email(*objs: dict) -> str:
        for o in objs:
            v = o.get("email")
            if v:
                return v
        return "N/A"

    contact_email = record.get("contactEmail") or registry.get("contactEmail") or _email(
        registrant, technical, administrative
    )

    return ContactInfo(
        registrantName=_name(registrant),
        technicalContactName=_name(technical),
        administrativeContactName=_name(administrative),
        contactEmail=contact_email,
    )


@app.get("/health")
def health():
    return {"status": "OK"}


@app.get("/api/whois/{domain}")
def get_whois(domain: str, type: str = Query("domain")):
    if not WHOIS_API_KEY:
        raise HTTPException(status_code=500, detail="WHOIS_API_KEY not configured")

    try:
        resp = requests.get(
            WHOIS_BASE_URL,
            params={
                "apiKey": WHOIS_API_KEY,
                "domainName": domain.strip().lower(),
                "outputFormat": "JSON",
            },
            timeout=10,
        )
        if resp.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid WHOIS API key")
        if resp.status_code == 429:
            raise HTTPException(status_code=429, detail="WHOIS rate limit exceeded")
        resp.raise_for_status()

        data = resp.json()
        if not data or not data.get("WhoisRecord"):
            raise HTTPException(status_code=404, detail="Domain information not found")

        t = (type or "domain").strip().lower()
        result = _extract_contact_info(data) if t == "contact" else _extract_domain_info(data)

        # best-effort persistence
        try:
            if lookups_collection is not None:
                lookups_collection.insert_one({
                    "domain": domain.strip().lower(),
                    "type": t,
                    "result": result.model_dump(),
                    "createdAt": datetime.utcnow(),
                })
        except Exception as e:
            logging.warning(f"Failed to persist lookup: {e}")

        return result
    except HTTPException:
        raise
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch WHOIS data: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history")
def history(limit: int = 20):
    if lookups_collection is None:
        return {"items": []}
    try:
        items = (
            lookups_collection
            .find({}, {"_id": 0})
            .sort("createdAt", -1)
            .limit(max(1, min(limit, 100)))
        )
        return {"items": list(items)}
    except Exception as e:
        logging.warning(f"Failed to read history: {e}")
        return {"items": []}
