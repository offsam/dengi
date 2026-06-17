from PIL import Image
from collections import deque
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_DIR = os.path.join(ROOT, "lib", "car-icons")
OUT_LIB = os.path.join(ROOT, "lib", "car-icons", "progress")
OUT_PUBLIC = os.path.join(ROOT, "public", "car-icons", "progress")


def process_for_progress(path, out_path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()

    outside = [[False] * w for _ in range(h)]
    queue = deque()

    def push_if_outside(x, y):
        if 0 <= x < w and 0 <= y < h and not outside[y][x] and px[x, y][3] <= 20:
            outside[y][x] = True
            queue.append((x, y))

    for x in range(w):
        push_if_outside(x, 0)
        push_if_outside(x, h - 1)
    for y in range(h):
        push_if_outside(0, y)
        push_if_outside(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            push_if_outside(nx, ny)

    opaque = [px[x, y][:3] for y in range(h) for x in range(w) if px[x, y][3] > 20]
    body = (
        (
            sum(channel[0] for channel in opaque) // len(opaque),
            sum(channel[1] for channel in opaque) // len(opaque),
            sum(channel[2] for channel in opaque) // len(opaque),
        )
        if opaque
        else (245, 245, 242)
    )

    for y in range(h):
        for x in range(w):
            alpha = px[x, y][3]
            if alpha <= 20 and not outside[y][x]:
                px[x, y] = (*body, 255)
            elif alpha > 20:
                red, green, blue, _ = px[x, y]
                px[x, y] = (red, green, blue, 255)
            else:
                px[x, y] = (0, 0, 0, 0)

    im.save(out_path, optimize=True)


def main():
    os.makedirs(OUT_LIB, exist_ok=True)
    os.makedirs(OUT_PUBLIC, exist_ok=True)

    icons = sorted(
        file_name
        for file_name in os.listdir(SOURCE_DIR)
        if file_name.endswith(".png")
        and os.path.isfile(os.path.join(SOURCE_DIR, file_name))
        and file_name != "progress"
    )

    for name in icons:
        source = os.path.join(SOURCE_DIR, name)
        if not os.path.isfile(source):
            continue

        target = os.path.join(OUT_LIB, name)
        process_for_progress(source, target)
        shutil.copy2(target, os.path.join(OUT_PUBLIC, name))
        print(name)


if __name__ == "__main__":
    main()
