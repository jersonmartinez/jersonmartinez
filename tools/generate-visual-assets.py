#!/usr/bin/env python3
"""Genera assets visuales derivados de la foto y la identidad del portfolio."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/images/profile.jpg'
IMAGES = ROOT / 'public/images'
SOCIAL = ROOT / 'public/social'
BRAND = ROOT / 'public/brand'
FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_REGULAR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

PAGES = {
    'home': ('Jerson Martínez', 'DevOps · SRE · DevSecOps · Cloud'),
    'projects': ('Proyectos', 'Producto · Open source · Automatización'),
    'courses': ('Cursos', 'Go · DevOps · Formación técnica'),
    'certifications': ('Certificaciones', 'AWS · Microsoft Azure · GitHub'),
    'experience': ('Trayectoria', '+10 años creando plataformas confiables'),
    'about': ('Sobre mí', 'Ingeniería que conecta personas y resultados'),
    '404': ('Ruta no encontrada', 'El recorrido continúa'),
}


def font(path, size):
    return ImageFont.truetype(path, size=size)


def profile_assets(source):
    square = ImageOps.fit(source.convert('RGB'), (1568, 1568), method=Image.Resampling.LANCZOS, centering=(0.5, 0.42))
    for size in (320, 640, 960):
        image = square.resize((size, size), Image.Resampling.LANCZOS)
        image.save(IMAGES / f'profile-v2-{size}.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
        image.save(IMAGES / f'profile-v2-{size}.webp', 'WEBP', quality=80, method=6)
        image.save(IMAGES / f'profile-v2-{size}.avif', 'AVIF', quality=55)


def brand_icon(size, output):
    image = Image.new('RGB', (size, size), '#07111f')
    draw = ImageDraw.Draw(image)
    pad = int(size * .08)
    draw.rounded_rectangle((pad, pad, size - pad, size - pad), radius=int(size * .2), fill='#112943', outline='#67e8f9', width=max(2, size // 64))
    label_font = font(FONT_BOLD, int(size * .38))
    draw.text((size // 2, size // 2), 'J.', font=label_font, fill='#f4f8fb', anchor='mm')
    image.save(output, 'PNG', optimize=True)


def social_card(source, slug, title, subtitle):
    canvas = Image.new('RGB', (1200, 630), '#07111f')
    draw = ImageDraw.Draw(canvas)
    for x in range(0, 1200, 64):
        draw.line((x, 0, x, 630), fill='#0d1d30', width=1)
    for y in range(0, 630, 64):
        draw.line((0, y, 1200, y), fill='#0d1d30', width=1)
    draw.ellipse((810, -210, 1320, 300), fill='#0b3446')
    draw.ellipse((-180, 410, 330, 920), fill='#183322')
    draw.rounded_rectangle((58, 55, 1142, 575), radius=38, fill='#0d1d30', outline='#31526a', width=2)
    portrait = ImageOps.fit(source.convert('RGB'), (365, 455), method=Image.Resampling.LANCZOS, centering=(0.5, 0.38))
    mask = Image.new('L', portrait.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 365, 455), radius=28, fill=255)
    canvas.paste(portrait, (735, 92), mask)
    draw.text((105, 110), 'Jerson.', font=font(FONT_BOLD, 34), fill='#67e8f9')
    title_size = 62 if slug == 'home' else (72 if len(title) < 18 else 60)
    title_font = font(FONT_BOLD, title_size)
    draw.text((105, 225), title, font=title_font, fill='#f4f8fb')
    draw.multiline_text((108, 325), subtitle, font=font(FONT_REGULAR, 29), fill='#a8bbcc', spacing=10)
    draw.rounded_rectangle((105, 470, 350, 515), radius=18, fill='#67e8f9')
    draw.text((227, 493), 'jersonmartinez.com', font=font(FONT_BOLD, 18), fill='#07111f', anchor='mm')
    canvas.save(SOCIAL / f'{slug}.png', 'PNG', optimize=True)


def main():
    IMAGES.mkdir(parents=True, exist_ok=True)
    SOCIAL.mkdir(parents=True, exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE)
    profile_assets(source)
    brand_icon(192, BRAND / 'favicon-192.png')
    brand_icon(512, BRAND / 'favicon-512.png')
    brand_icon(180, BRAND / 'apple-touch-icon.png')
    for slug, (title, subtitle) in PAGES.items():
        social_card(source, slug, title, subtitle)
    print(f'Assets generados: 9 imágenes responsive, 3 iconos y {len(PAGES)} tarjetas sociales.')


if __name__ == '__main__':
    main()
