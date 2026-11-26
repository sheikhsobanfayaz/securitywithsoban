#!/usr/bin/env python3
"""Fetch latest cybersecurity stories from official RSS/Atom feeds into public/news.json."""

from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import html
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PATH = os.path.join(ROOT_DIR, "public", "news.json")
MAX_ITEMS = 15
MAX_SUMMARY_LEN = 180
REQUEST_TIMEOUT = 15

FEEDS = [
    {
        "source": "The Hacker News",
        "category": "Security News",
        "category_slug": "security-news",
        "urls": ["https://feeds.feedburner.com/TheHackersNews"],
    },
    {
        "source": "BleepingComputer",
        "category": "Security News",
        "category_slug": "security-news",
        "urls": ["https://www.bleepingcomputer.com/feed/"],
    },
    {
        "source": "Krebs on Security",
        "category": "Threat Intel",
        "category_slug": "threat-intel",
        "urls": ["https://krebsonsecurity.com/feed/"],
    },
    {
        "source": "Dark Reading",
        "category": "Security News",
        "category_slug": "security-news",
        "urls": ["https://www.darkreading.com/rss.xml"],
    },
    {
        "source": "SANS ISC",
        "category": "Threat Intel",
        "category_slug": "threat-intel",
        "urls": [
            "https://isc.sans.edu/rssfeed_full.xml",
            "https://isc.sans.edu/rssfeed.xml",
        ],
    },
    {
        "source": "CISA Advisories",
        "category": "Advisories",
        "category_slug": "advisories",
        "urls": [
            "https://www.cisa.gov/cybersecurity-advisories/all.xml",
            "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        ],
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SecurityWithSobanNewsBot/1.0; +https://sheikhsobanfayaz.github.io/securitywithsoban/)",
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
}


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower() if tag else ""


def clean_text(raw: str) -> str:
    if not raw:
        return ""
    text = html.unescape(raw)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = text.replace("\u2014", " - ").replace("\u2013", "-")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def truncate_summary(text: str, limit: int = MAX_SUMMARY_LEN) -> str:
    if not text or len(text) <= limit:
        return text
    cut = text[: limit - 3]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut.rstrip(".,;:!? ") + "..."


def parse_date(raw: str) -> datetime:
    if not raw:
        return datetime.now(timezone.utc)
    val = raw.strip()
    try:
        dt = parsedate_to_datetime(val)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except (TypeError, ValueError):
        pass

    iso_val = val.replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(iso_val)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except ValueError:
        return datetime.now(timezone.utc)


def extract_link(entry: ET.Element) -> str:
    fallback = ""
    for child in entry:
        name = local_name(child.tag)
        if name == "link":
            href = (child.attrib.get("href") or "").strip()
            rel = (child.attrib.get("rel") or "").strip().lower()
            text = (child.text or "").strip()
            candidate = href or text
            if candidate.startswith(("http://", "https://")):
                if rel in ("", "alternate"):
                    return candidate
                if not fallback:
                    fallback = candidate
        elif name == "guid":
            is_perma = (child.attrib.get("isPermaLink") or "true").lower()
            text = (child.text or "").strip()
            if is_perma != "false" and text.startswith(("http://", "https://")) and not fallback:
                fallback = text
    return fallback


def canonical_url(url: str) -> str:
    parsed = urllib.parse.urlsplit(url.strip())
    query_pairs = [
        (k, v)
        for k, v in urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        if not k.lower().startswith("utm_")
    ]
    clean_query = urllib.parse.urlencode(query_pairs)
    path = parsed.path.rstrip("/") or "/"
    return urllib.parse.urlunsplit((parsed.scheme.lower(), parsed.netloc.lower(), path, clean_query, ""))


def parse_feed_xml(xml_bytes: bytes, feed_meta: dict) -> list:
    xml_text = xml_bytes.decode("utf-8", errors="replace")
    xml_text = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F]", "", xml_text).lstrip("\ufeff \t\r\n")
    root = ET.fromstring(xml_text)

    entries = [el for el in root.iter() if local_name(el.tag) in ("item", "entry")]
    parsed_items = []

    for entry in entries:
        fields = {}
        for child in entry:
            name = local_name(child.tag)
            text = "".join(child.itertext()).strip()
            if name not in fields or not fields[name]:
                fields[name] = text

        title = clean_text(fields.get("title", ""))
        link = extract_link(entry)
        if not title or not link:
            continue

        raw_summary = (
            fields.get("summary")
            or fields.get("description")
            or fields.get("content")
            or fields.get("encoded")
            or ""
        )
        cleaned_summary = clean_text(raw_summary)
        if cleaned_summary.startswith("(c) SANS") and fields.get("encoded"):
            cleaned_summary = clean_text(fields.get("encoded", ""))
        summary = truncate_summary(cleaned_summary)
        if not summary:
            summary = f"Latest security coverage published by {feed_meta['source']}."

        raw_date = (
            fields.get("pubdate")
            or fields.get("published")
            or fields.get("updated")
            or fields.get("date")
            or ""
        )
        dt = parse_date(raw_date)

        parsed_items.append(
            {
                "title": title,
                "link": link,
                "source": feed_meta["source"],
                "category": feed_meta["category"],
                "category_slug": feed_meta["category_slug"],
                "published": dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "published_display": dt.strftime("%b %d, %Y %H:%M UTC"),
                "summary": summary,
                "_dt": dt,
            }
        )

    return parsed_items


def parse_cisa_kev_json(raw_bytes: bytes, feed_meta: dict) -> list:
    data = json.loads(raw_bytes.decode("utf-8", errors="replace"))
    vulns = data.get("vulnerabilities") or []
    vulns_sorted = sorted(vulns, key=lambda v: v.get("dateAdded", ""), reverse=True)[:10]
    parsed = []
    for v in vulns_sorted:
        cve_id = clean_text(v.get("cveID", ""))
        vuln_name = clean_text(v.get("vulnerabilityName", ""))
        short_desc = clean_text(v.get("shortDescription", ""))
        date_added = (v.get("dateAdded") or "").strip()
        if not cve_id or not vuln_name:
            continue
        dt = parse_date(date_added)
        parsed.append(
            {
                "title": f"CISA KEV Advisory: {cve_id} - {vuln_name}",
                "link": f"https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext={urllib.parse.quote(cve_id)}",
                "source": feed_meta["source"],
                "category": feed_meta["category"],
                "category_slug": feed_meta["category_slug"],
                "published": dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "published_display": dt.strftime("%b %d, %Y %H:%M UTC"),
                "summary": truncate_summary(short_desc or vuln_name),
                "_dt": dt,
            }
        )
    return parsed


def fetch_feed(feed_meta: dict) -> list:
    last_err = None
    for url in feed_meta["urls"]:
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                data = resp.read()
            if url.lower().endswith(".json"):
                items = parse_cisa_kev_json(data, feed_meta)
            else:
                items = parse_feed_xml(data, feed_meta)
            if items:
                return items
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ET.ParseError, json.JSONDecodeError, OSError) as exc:
            last_err = exc
    if last_err:
        print(f"[WARN] Skipped {feed_meta['source']}: {last_err}", file=sys.stderr)
    return []


def main() -> int:
    collected = []
    sources_succeeded = 0

    for feed_meta in FEEDS:
        items = fetch_feed(feed_meta)
        if items:
            sources_succeeded += 1
            print(f"[OK] {feed_meta['source']}: {len(items)} items")
            collected.extend(items)

    if not collected and os.path.exists(OUTPUT_PATH):
        print("[WARN] Zero items fetched; preserving existing news.json.", file=sys.stderr)
        return 0

    collected.sort(key=lambda item: item["_dt"], reverse=True)

    seen_links = set()
    seen_titles = set()
    deduped = []

    for item in collected:
        link_key = canonical_url(item["link"])
        title_key = re.sub(r"[^a-z0-9]+", "", item["title"].lower())
        if link_key in seen_links or (title_key and title_key in seen_titles):
            continue
        seen_links.add(link_key)
        if title_key:
            seen_titles.add(title_key)
        clean_item = {k: v for k, v in item.items() if k != "_dt"}
        deduped.append(clean_item)
        if len(deduped) >= MAX_ITEMS:
            break

    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    payload = {
        "generated_at": now_utc,
        "sources_checked": len(FEEDS),
        "sources_succeeded": sources_succeeded,
        "items": deduped,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"[DONE] Wrote {len(deduped)} stories from {sources_succeeded}/{len(FEEDS)} sources to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
