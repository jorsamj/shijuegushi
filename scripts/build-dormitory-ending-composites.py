from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "assets" / "stories" / "dormitory-rollcall"
OUT = ASSET_ROOT / "endings-v2"
SIZE = (1080, 1920)


def background(name, tint):
    image = Image.open(ASSET_ROOT / "backgrounds-v2" / name).convert("RGB").resize(SIZE)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(0.72)
    wash = Image.new("RGB", SIZE, tint)
    return Image.blend(image, wash, 0.12).convert("RGBA")


def character(name, scale=0.9, mirror=False, opacity=255):
    image = Image.open(ASSET_ROOT / "characters-v2" / name).convert("RGBA")
    if mirror:
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    target = (round(SIZE[0] * scale), round(SIZE[1] * scale))
    image = image.resize(target, Image.Resampling.LANCZOS)
    if opacity != 255:
        image.putalpha(image.getchannel("A").point(lambda value: value * opacity // 255))
    return image


def place(canvas, image, x, y):
    canvas.alpha_composite(image, (x, y))


def grade(canvas, vignette=145):
    mask = Image.new("L", SIZE, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-260, -180, 1340, 2100), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(150))
    shade = Image.new("RGBA", SIZE, (0, 0, 0, vignette))
    shade.putalpha(mask.point(lambda value: max(0, vignette - value * vignette // 255)))
    canvas.alpha_composite(shade)
    return canvas.convert("RGB")


def linsui_door():
    canvas = background("bg_dorm_west_stairs.png", (24, 30, 38))
    place(canvas, character("char_xutang_exhausted.png", 0.86, mirror=True), -210, 210)
    place(canvas, character("char_linsui_exhausted.png", 0.9), 315, 150)
    door = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(door)
    draw.polygon([(455, 0), (1080, 0), (1080, 1920), (650, 1920)], fill=(8, 10, 14, 214))
    draw.line([(455, 0), (650, 1920)], fill=(164, 43, 42, 150), width=16)
    door = door.filter(ImageFilter.GaussianBlur(3))
    canvas.alpha_composite(door)
    grade(canvas).save(OUT / "ending_linsui_door.png")


def left_behind():
    canvas = background("bg_dorm_exit_gate.png", (20, 25, 30))
    place(canvas, character("char_zhaoqing_injured.png", 0.78), 130, 210)
    foreground = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(foreground)
    for x in (155, 305, 455, 605, 755, 905):
        draw.rectangle((x, 0, x + 24, 1920), fill=(5, 7, 10, 224))
    draw.rectangle((0, 1280, 1080, 1920), fill=(3, 5, 8, 118))
    canvas.alpha_composite(foreground)
    grade(canvas, 165).save(OUT / "ending_left_behind.png")


def legal_count():
    canvas = background("bg_dorm_exit_gate.png", (15, 24, 31))
    members = [
        ("char_xutang_exhausted.png", -250, 315, False),
        ("char_linsui_exhausted.png", 20, 300, False),
        ("char_chenlu_fear.png", 290, 335, False),
        ("char_shenyan_distressed.png", 545, 325, False),
    ]
    for name, x, y, mirror in members:
        silhouette = character(name, 0.62, mirror, 165)
        silhouette = ImageEnhance.Brightness(silhouette).enhance(0.42)
        place(canvas, silhouette, x, y)
    shadow = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((780, 530, 1020, 910), fill=(4, 5, 8, 168))
    draw.polygon([(835, 820), (960, 820), (1060, 1590), (710, 1590)], fill=(4, 5, 8, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    canvas.alpha_composite(shadow)
    grade(canvas, 176).save(OUT / "ending_legal_count.png")


def second_xutang():
    canvas = background("bg_dorm_exit_gate.png", (18, 22, 31))
    place(canvas, character("char_xutang_determined.png", 0.84), -90, 190)
    duplicate = character("char_xutang_fear.png", 0.84, mirror=True, opacity=224)
    red = Image.new("RGBA", duplicate.size, (0, 0, 0, 0))
    red.putalpha(duplicate.getchannel("A"))
    red.paste((108, 20, 28, 100), (0, 0, *duplicate.size), duplicate.getchannel("A"))
    place(canvas, duplicate, 305, 190)
    place(canvas, red.filter(ImageFilter.GaussianBlur(4)), 319, 190)
    scan = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(scan)
    for y in range(120, 1320, 32):
        draw.rectangle((540, y, 1030, y + 4), fill=(121, 176, 184, 42))
    draw.rectangle((523, 60, 535, 1540), fill=(212, 228, 220, 132))
    canvas.alpha_composite(scan)
    grade(canvas, 160).save(OUT / "ending_second_xutang.png")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    linsui_door()
    left_behind()
    legal_count()
    second_xutang()
    for path in sorted(OUT.glob("*.png")):
        with Image.open(path) as image:
            if image.size != SIZE:
                raise RuntimeError(f"Unexpected ending size for {path}: {image.size}")
    print("Built four portrait ending composites at 1080x1920.")


if __name__ == "__main__":
    main()
