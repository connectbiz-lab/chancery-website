#!/usr/bin/env python3
"""Replay content ops (updates keyed by NATURAL keys) against a Supabase REST API.

  python3 apply_content_ops.py <ops.json> <base_url> <key> [--bearer] [--dry-run]

Local: pass the service-role key with --bearer (apikey + Authorization).
Cloud: pass the sb_secret_ key WITHOUT --bearer (apikey header only).
UUIDs differ between environments, so rows are matched by slug / name / kind+hotel.
"""
import sys, json, urllib.request, urllib.parse
ops_path, base, key = sys.argv[1:4]; bearer = '--bearer' in sys.argv; dry = '--dry-run' in sys.argv
H = {'apikey': key, 'Content-Type': 'application/json', 'Prefer': 'return=representation'}
if bearer: H['Authorization'] = 'Bearer ' + key
def call(method, path, body=None):
    req = urllib.request.Request(base.rstrip('/') + '/rest/v1' + path, data=json.dumps(body).encode() if body is not None else None, headers=H, method=method)
    with urllib.request.urlopen(req) as r:
        raw = r.read().decode(); return json.loads(raw) if raw else []
hotels = {h['slug']: h['id'] for h in call('GET', '/hotel?select=id,slug')}
def flt(match):
    parts = []
    for k, v in match.items():
        if k == 'hotel': parts.append('hotel_id=' + ('is.null' if v is None else 'eq.' + hotels[v]))
        else: parts.append(f"{k}=eq.{urllib.parse.quote(str(v))}")
    return '&'.join(parts)
for op in json.load(open(ops_path)):
    t, m = op['table'], op['match']; label = f"{t} {m}"
    rows = call('GET', f"/{t}?select=id&{flt(m)}")
    if op['op'] == 'update':
        if len(rows) != 1: print(f"SKIP ({len(rows)} rows matched) {label}"); continue
        if not dry: call('PATCH', f"/{t}?id=eq.{rows[0]['id']}", op['set'])
        print(f"{'would update' if dry else 'updated'} {label}: {list(op['set'])}")
    elif op['op'] == 'insert_if_missing':
        if rows: print(f"exists, skipped insert {label}"); continue
        body = dict(op['row']);
        if 'hotel' in body: body['hotel_id'] = hotels[body.pop('hotel')] if body['hotel'] else None
        if not dry: call('POST', f"/{t}", body)
        print(f"{'would insert' if dry else 'inserted'} {label}")
