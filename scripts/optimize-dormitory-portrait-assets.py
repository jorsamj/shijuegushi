from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "assets" / "stories" / "dormitory-rollcall"
PROFILES = {
    "backgrounds-v2": {"quality": 88, "lossless": False},
    "characters-v2": {"quality": 90, "lossless": False},
    "phone-v2": {"quality": 90, "lossless": False},
    "effects-v2": {"quality": 100, "lossless": True},
    "endings-v2": {"quality": 88, "lossless": False},
}
EXPECTED_SIZE = (1080, 1920)


def convert_asset(source: Path, profile: dict[str, int | bool]) -> tuple[int, int]:
    target = source.with_suffix(".webp")
    with Image.open(source) as image:
        if image.size != EXPECTED_SIZE:
            raise ValueError(f"Unexpected dimensions for {source}: {image.size}")
        image.load()
        image.save(
            target,
            "WEBP",
            quality=int(profile["quality"]),
            lossless=bool(profile["lossless"]),
            method=6,
        )
    with Image.open(target) as converted:
        if converted.size != EXPECTED_SIZE:
            raise ValueError(f"Converted dimensions changed for {target}: {converted.size}")
        converted.verify()
    return source.stat().st_size, target.stat().st_size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--remove-source", action="store_true")
    args = parser.parse_args()

    converted: list[tuple[Path, int, int]] = []
    for directory, profile in PROFILES.items():
        for source in sorted((ASSET_ROOT / directory).glob("*.png")):
            before, after = convert_asset(source, profile)
            converted.append((source, before, after))

    if not converted:
        raise SystemExit("No PNG assets found to optimize.")

    if args.remove_source:
        for source, _, _ in converted:
            source.unlink()

    before_total = sum(item[1] for item in converted)
    after_total = sum(item[2] for item in converted)
    reduction = 100 - (after_total / before_total * 100)
    print(
        f"Optimized {len(converted)} portrait assets: "
        f"{before_total / 1024 / 1024:.2f} MB -> "
        f"{after_total / 1024 / 1024:.2f} MB ({reduction:.1f}% smaller)."
    )


if __name__ == "__main__":
    main()
