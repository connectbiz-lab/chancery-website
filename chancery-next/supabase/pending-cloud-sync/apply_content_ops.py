#!/usr/bin/env python3
"""Replay content ops (updates keyed by NATURAL keys) against a Supabase REST API.

  python3 apply_content_ops.py <ops.json> <base_url> <key> [--bearer] [--dry-run]

Local: pass the service-role key with --bearer (apikey + Authorization).
Cloud: pass the sb_secret_ key WITHOUT --bearer (apikey header only).
UUIDs differ between environments, so rows are matched by slug / name / kind+hotel.
Ops: update / insert_if_missing / delete / replace_children (image rows of one parent) /
replace_gallery (a hotel's whole gallery). In `set`, `hotel` is a slug (or null = shared).
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
    if op['op'] == 'replace_gallery':
        # Replace a hotel's whole gallery with `rows` (deterministic, re-runnable).
        hid = hotels[op['hotel']]
        if not dry:
            call('DELETE', f"/gallery_image?hotel_id=eq.{hid}")
            call('POST', '/gallery_image', [dict(r, hotel_id=hid) for r in op['rows']])
        print(f"{'would replace' if dry else 'replaced'} gallery of {op['hotel']}: {len(op['rows'])} images"); continue
    if op['op'] == 'replace_faq':
        # Replace the whole FAQ (sections + items) with `sections` — deterministic, re-runnable.
        if not dry:
            call('DELETE', '/faq_item?section_id=not.is.null')
            call('DELETE', '/faq_section?title=not.is.null')
            created = call('POST', '/faq_section', [{'title': s['title'], 'order': i + 1} for i, s in enumerate(op['sections'])])
            ids = {s['title']: s['id'] for s in created}
            items = [dict(q, section_id=ids[s['title']], order=j + 1) for s in op['sections'] for j, q in enumerate(s['items'])]
            call('POST', '/faq_item', items)
        print(f"{'would replace' if dry else 'replaced'} FAQ: {len(op['sections'])} sections, {sum(len(s['items']) for s in op['sections'])} questions"); continue
    t, m = op['table'], op['match']; label = f"{t} {m}"
    rows = call('GET', f"/{t}?select=id&{flt(m)}")
    if op['op'] == 'update':
        if len(rows) != 1: print(f"SKIP ({len(rows)} rows matched) {label}"); continue
        body = dict(op['set'])
        # `hotel` in `set` is a slug (ids differ per environment); null = shared by both hotels.
        if 'hotel' in body: body['hotel_id'] = None if body['hotel'] is None else hotels[body.pop('hotel')]; body.pop('hotel', None)
        if not dry: call('PATCH', f"/{t}?id=eq.{rows[0]['id']}", body)
        print(f"{'would update' if dry else 'updated'} {label}: {list(op['set'])}")
    elif op['op'] == 'delete':
        if len(rows) != 1: print(f"SKIP ({len(rows)} rows matched) {label}"); continue
        if not dry: call('DELETE', f"/{t}?id=eq.{rows[0]['id']}")
        print(f"{'would delete' if dry else 'deleted'} {label}")
    elif op['op'] == 'replace_children':
        # Replace ALL child image rows of one parent (room/venue/restaurant) with `rows`.
        if len(rows) != 1: print(f"SKIP ({len(rows)} parents matched) {label}"); continue
        fk, child = op['fk'], op['child']
        if not dry:
            call('DELETE', f"/{child}?{fk}=eq.{rows[0]['id']}")
            call('POST', f"/{child}", [dict(r, **{fk: rows[0]['id']}) for r in op['rows']])
        print(f"{'would replace' if dry else 'replaced'} {child} of {label}: {len(op['rows'])} images")
    elif op['op'] == 'insert_if_missing':
        if rows: print(f"exists, skipped insert {label}"); continue
        body = dict(op['row']);
        if 'hotel' in body: body['hotel_id'] = hotels[body.pop('hotel')] if body['hotel'] else None
        if not dry: call('POST', f"/{t}", body)
        print(f"{'would insert' if dry else 'inserted'} {label}")
