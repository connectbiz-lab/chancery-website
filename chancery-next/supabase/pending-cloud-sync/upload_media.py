#!/usr/bin/env python3
"""Upload web-ready media files to a Supabase storage bucket (upsert).

  python3 upload_media.py <files.txt> <source_dir> <base_url> <key> [--bearer] [--dry-run]

<files.txt> lists bucket paths (one per line, e.g. rooms/2026-x.webp); each is read
from <source_dir>/<path>. Local: service-role key with --bearer. Cloud: the
sb_secret_ key WITHOUT --bearer (apikey header only).
"""
import sys, os, urllib.request, urllib.parse
files, src, base, key = sys.argv[1:5]; bearer = '--bearer' in sys.argv; dry = '--dry-run' in sys.argv
CT = {'.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4'}
ok = 0
for path in [l.strip() for l in open(files) if l.strip()]:
    data = open(os.path.join(src, path), 'rb').read()
    if dry: print('would upload', path, len(data)); continue
    h = {'apikey': key, 'x-upsert': 'true', 'Content-Type': CT.get(os.path.splitext(path)[1], 'application/octet-stream')}
    if bearer: h['Authorization'] = 'Bearer ' + key
    req = urllib.request.Request(base.rstrip('/') + '/storage/v1/object/media/' + urllib.parse.quote(path), data=data, headers=h, method='POST')
    with urllib.request.urlopen(req) as r: ok += r.status == 200
print(f'uploaded {ok} files')
