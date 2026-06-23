#!/usr/bin/env bash
#
# Deploy the image-optimization pipeline to the production backend (3.111.60.193).
#
# What it does, in order:
#   1. Backs up the current media/ folder and db.sqlite3 (so this is reversible).
#   2. Pulls the latest code (the WebP pipeline: imaging.py, signals.py,
#      apps.py hook, optimize_media command). No DB migrations are involved.
#   3. Ensures Pillow is installed.
#   4. Runs `optimize_media` — converts every existing image on disk to a WebP
#      master + -480/-960/-1600 variants and rewrites the DB paths to .webp.
#   5. Restarts the app so future admin uploads auto-optimize via the pre_save
#      signal. nginx then serves the new .webp files with no config change.
#
# Run it ON THE SERVER, from the Django project dir (where manage.py lives).
# Edit the three vars below to match the server, then: bash deploy_image_optimization.sh
set -euo pipefail

# --- EDIT THESE to match the server ---------------------------------------
VENV_PY="${VENV_PY:-./venv/bin/python}"          # path to the venv's python
APP_SERVICE="${APP_SERVICE:-gunicorn}"            # systemd service that runs Django
USE_GIT="${USE_GIT:-true}"                        # false if code is uploaded manually
# --------------------------------------------------------------------------

ts="$(date +%Y%m%d-%H%M%S)"
echo "==> 1/5 Backing up media + db (suffix: $ts)"
cp -r media "media.backup-$ts"
cp db.sqlite3 "db.sqlite3.backup-$ts"

if [ "$USE_GIT" = "true" ]; then
  echo "==> 2/5 Pulling latest code"
  git pull --ff-only
else
  echo "==> 2/5 Skipping git pull (USE_GIT=false) — ensure the 4 files are in place:"
  echo "        content/imaging.py, content/signals.py, content/apps.py,"
  echo "        content/management/commands/optimize_media.py"
fi

echo "==> 3/5 Ensuring Pillow is installed"
"$VENV_PY" -m pip install --quiet 'pillow>=10'

echo "==> 4/5 Converting existing media to WebP (idempotent, safe to re-run)"
"$VENV_PY" manage.py optimize_media

echo "==> 5/5 Restarting $APP_SERVICE"
sudo systemctl restart "$APP_SERVICE"

echo ""
echo "Done. Spot-check that a WebP now serves:"
echo "  curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1/media/gallery/matsuri-team.webp"
echo "Rollback if needed:"
echo "  rm -rf media && mv media.backup-$ts media && mv db.sqlite3.backup-$ts db.sqlite3 && sudo systemctl restart $APP_SERVICE"
