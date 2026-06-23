"""
Image optimization pipeline.

Converts uploaded images to compressed WebP and generates a fixed ladder of
responsive variants beside the master file. Hooked via a ``pre_save`` signal
(see ``signals.py``) so BOTH admin uploads and the seed command produce
optimized assets automatically — no manual step, no code change to swap a photo.

A photographic hero that arrives as a multi-MB PNG becomes a ~150-300KB WebP.

Naming convention (relied on by the frontend to build ``srcset`` without an API
change): a master at ``pages/home.webp`` always has siblings
``pages/home-480.webp``, ``pages/home-960.webp``, ``pages/home-1600.webp``.
Variants are clamped to the source width (never upscaled), so the three sibling
files always exist and the frontend can reference them unconditionally.
"""

from io import BytesIO

from PIL import Image, ImageOps
from django.core.files.base import ContentFile

WEBP_QUALITY = 80
MAX_WIDTH = 2000  # cap for the master rendition
SRCSET_WIDTHS = (480, 960, 1600)  # responsive ladder — always generated

# Vector / already-optimal formats Pillow can't (or shouldn't) re-encode.
SKIP_EXTENSIONS = (".svg", ".webp")


def _load(fileobj):
    """Open an image, honour EXIF rotation, and normalise the colour mode."""
    img = Image.open(fileobj)
    img = ImageOps.exif_transpose(img)
    if img.mode == "P":  # palette PNG — promote so transparency survives
        img = img.convert("RGBA")
    has_alpha = "A" in img.getbands()
    return img.convert("RGBA" if has_alpha else "RGB")


def _encode(img, width):
    """Encode ``img`` as WebP, downscaling to ``width`` if it is larger."""
    im = img
    if im.width > width:
        height = max(1, round(im.height * width / im.width))
        im = im.resize((width, height), Image.LANCZOS)
    buf = BytesIO()
    im.save(buf, format="WEBP", quality=WEBP_QUALITY, method=6)
    return ContentFile(buf.getvalue())


def _variant_name(master_name, width):
    base = master_name.rsplit(".", 1)[0]
    return f"{base}-{width}.webp"


def optimize(fieldfile):
    """
    Replace ``fieldfile``'s image with an optimized WebP master and write the
    responsive variants beside it. Idempotent: files already ending in ``.webp``
    are skipped. Returns the new master name, or ``None`` if nothing was done.
    """
    name = fieldfile.name
    if not name or name.lower().endswith(SKIP_EXTENSIONS):
        return None

    # Reading works for both committed files and not-yet-saved admin uploads.
    # A stale DB row pointing at a deleted file raises FileNotFoundError — skip.
    try:
        with fieldfile.open("rb") as fh:
            img = _load(fh)
    except FileNotFoundError:
        return None

    storage = fieldfile.storage

    master_name = name.rsplit(".", 1)[0] + ".webp"

    for width in SRCSET_WIDTHS:
        vname = _variant_name(master_name, width)
        if storage.exists(vname):
            storage.delete(vname)
        storage.save(vname, _encode(img, width))

    # Drop the unoptimized original (and any stale master) before writing.
    for stale in (name, master_name):
        if storage.exists(stale):
            storage.delete(stale)

    return storage.save(master_name, _encode(img, MAX_WIDTH))
