from PIL import Image
from collections import deque
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS_DIR = os.path.join(ROOT, "lib", "car-icons")
PUBLIC_DIR = os.path.join(ROOT, "public", "car-icons")
PADDING = 4


def is_background_pixel(red, green, blue, alpha):
    if alpha <= 20:
        return True

    # Белая / кремовая плитка фона у иконок
    return red >= 235 and green >= 235 and blue >= 228


def remove_edge_background(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    remove = [[False] * width for _ in range(height)]
    queue = deque()

    def push_if_background(x, y):
        if 0 <= x < width and 0 <= y < height and not remove[y][x]:
            red, green, blue, alpha = pixels[x, y]
            if is_background_pixel(red, green, blue, alpha):
                remove[y][x] = True
                queue.append((x, y))

    for x in range(width):
        push_if_background(x, 0)
        push_if_background(x, height - 1)
    for y in range(height):
        push_if_background(0, y)
        push_if_background(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            push_if_background(nx, ny)

    for y in range(height):
        for x in range(width):
            if remove[y][x]:
                pixels[x, y] = (0, 0, 0, 0)

    return rgba


def content_bbox(im: Image.Image):
    width, height = im.size
    pixels = im.load()
    xs, ys = [], []

    for y in range(height):
        for x in range(width):
            if pixels[x, y][3] > 20:
                xs.append(x)
                ys.append(y)

    if not xs:
        return 0, 0, width - 1, height - 1

    return min(xs), min(ys), max(xs), max(ys)


def trim_and_pad(im: Image.Image) -> Image.Image:
    left, top, right, bottom = content_bbox(im)
    cropped = im.crop((left, top, right + 1, bottom + 1))
    padded = Image.new("RGBA", (cropped.width + PADDING * 2, cropped.height + PADDING * 2), (0, 0, 0, 0))
    padded.paste(cropped, (PADDING, PADDING))
    return padded


def normalize_icon(path: str) -> None:
    source = Image.open(path)
    cleaned = remove_edge_background(source)
    normalized = trim_and_pad(cleaned)
    normalized.save(path, optimize=True)


def main():
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    icons = sorted(
        name
        for name in os.listdir(ICONS_DIR)
        if name.endswith(".png")
        and os.path.isfile(os.path.join(ICONS_DIR, name))
    )

    for name in icons:
        path = os.path.join(ICONS_DIR, name)
        before = Image.open(path).size
        normalize_icon(path)
        after = Image.open(path).size
        shutil.copy2(path, os.path.join(PUBLIC_DIR, name))
        print(f"{name}: {before[0]}x{before[1]} -> {after[0]}x{after[1]}")


if __name__ == "__main__":
    main()
