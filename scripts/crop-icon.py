"""
앱 아이콘 만들기: 사용자가 준비한 1024×1024 그림(어두운 남색 바탕 위에 둥근 네모 아이콘)에서
가운데 둥근 네모만 잘라 바깥을 투명하게 하고, 여러 크기의 PNG로 저장합니다.

실행 (프로젝트 폴더에서):
    python -I scripts/crop-icon.py design/icon-source.png

만드는 파일:
    design/icon-cropped.png      잘라낸 원본 크기, 정사각형 (APK 아이콘을 만들 때 이 파일을 씁니다)
    public/icon-512.png, icon-192.png, icon-64.png, icon-32.png, apple-touch-icon.png (180)
"""

import sys
from pathlib import Path

from PIL import Image, ImageFilter

SIZES = {"icon-512.png": 512, "icon-192.png": 192, "apple-touch-icon.png": 180, "icon-64.png": 64, "icon-32.png": 32}
# 바탕(어두운 남색, 밝기 60~135)과 아이콘(밝기 150 이상)을 가르는 밝기 기준. 밝기 = R, G, B 중 가장 큰 값
BRIGHTNESS_THRESHOLD = 140
# 줄이나 칸에 아이콘 픽셀이 이만큼 이상 있어야 아이콘 영역으로 봅니다. (오른쪽 아래 작은 별 모양은 걸러짐)
MIN_PIXELS = 60


def main(source: Path) -> None:
    project = Path(__file__).resolve().parent.parent
    image = Image.open(source).convert("RGB")
    width, height = image.size
    pixels = image.load()

    def is_icon(x: int, y: int) -> bool:
        return max(pixels[x, y]) >= BRIGHTNESS_THRESHOLD

    # 1) 아이콘 픽셀이 충분히 있는 줄과 칸으로 테두리 상자를 잡습니다.
    rows = [y for y in range(height) if sum(is_icon(x, y) for x in range(width)) >= MIN_PIXELS]
    cols = [x for x in range(width) if sum(is_icon(x, y) for y in range(height)) >= MIN_PIXELS]
    top, bottom, left, right = rows[0], rows[-1], cols[0], cols[-1]
    box_w, box_h = right - left + 1, bottom - top + 1
    print(f"아이콘 영역: x {left}~{right}, y {top}~{bottom} ({box_w}×{box_h})")

    # 2) 줄마다 양 끝 아이콘 픽셀 사이를 채워 둥근 네모 모양의 마스크를 만듭니다. (안쪽의 어두운 글자는 구멍이 나지 않음)
    mask = Image.new("L", (box_w, box_h), 0)
    mask_pixels = mask.load()
    for y in range(box_h):
        xs = [x for x in range(box_w) if is_icon(left + x, top + y)]
        if len(xs) < 2:
            continue
        for x in range(xs[0], xs[-1] + 1):
            mask_pixels[x, y] = 255
    # 가장자리를 살짝 부드럽게
    mask = mask.filter(ImageFilter.GaussianBlur(0.7))

    cropped = image.crop((left, top, right + 1, bottom + 1)).convert("RGBA")
    cropped.putalpha(mask)

    # 3) 그림이 정사각형이 아니면(예: 672×655) 늘리지 않고 투명한 여백을 더해 정사각형으로 맞춥니다.
    side = max(box_w, box_h)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(cropped, ((side - box_w) // 2, (side - box_h) // 2))

    design_dir = project / "design"
    design_dir.mkdir(exist_ok=True)
    square.save(design_dir / "icon-cropped.png")
    print(f"저장: {design_dir / 'icon-cropped.png'} ({side}×{side})")

    public_dir = project / "public"
    for name, size in SIZES.items():
        resized = square.resize((size, size), Image.LANCZOS)
        resized.save(public_dir / name)
        print(f"저장: {public_dir / name} ({size}×{size})")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("사용법: python -I scripts/crop-icon.py <원본 그림 경로>")
    main(Path(sys.argv[1]))
