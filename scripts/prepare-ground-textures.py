"""Downsample existing numeric material maps for the web; originals stay untouched."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'src/assets/rock_wall_04_4k.gltf/textures'
target = root / 'src/assets/ground'
target.mkdir(exist_ok=True)
size = (1024, 1024)
normal = Image.open(source / 'rock_wall_04_nor_gl_4k.jpg')
normal.resize(size, Image.Resampling.LANCZOS).save(target / 'stone-normal.webp', quality=88, method=6)
size = (512, 512)
height = Image.open(source / 'rock_wall_04_disp_4k.png').convert('F')
height = height.resize(size, Image.Resampling.BILINEAR).point(lambda x: x / 256).convert('L')
roughness = Image.open(source / 'rock_wall_04_rough_4k.jpg').getchannel('G')
roughness = roughness.resize(size, Image.Resampling.LANCZOS)
# R: height, G: roughness. A shared data texture serves displacement and roughness.
Image.merge('RGB', (height, roughness, Image.new('L', size))).save(target / 'stone-surface.webp', lossless=True, method=6)
for path in target.glob('*.webp'):
    print(f'{path.name}: {path.stat().st_size / 1024:.0f} KiB')
