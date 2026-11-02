"""
One-off migration of the 19 legacy WordPress posts into repo-held JSON.

The old site is Elementor, so the rendered HTML is mostly layout scaffolding.
We keep the semantic content and throw away the wrappers, icons and styling.
Output feeds lib/blog/posts.json, which the blog reads when Sanity is unset.
"""
import json, re, html, os, sys, urllib.parse
from html.parser import HTMLParser

SRC = sys.argv[1]
IMG_MANIFEST = sys.argv[2]
OUT = sys.argv[3]

# Tags worth keeping. Everything else is either unwrapped or dropped outright.
KEEP = {'p','h2','h3','h4','h5','h6','ul','ol','li','strong','b','em','i','a',
        'img','br','blockquote','figure','figcaption','table','thead','tbody',
        'tr','th','td'}
DROP_TREE = {'script','style','svg','path','noscript','form','button','iframe','input','select'}
UNWRAP = {'div','span','section','article','header','footer','main','aside','picture','source'}
VOID = {'img','br'}

posts = json.load(open(SRC))
SLUGS = {p['slug'] for p in posts}

# Legacy paths that already have a home in the new site.
PAGE_MAP = {
    '/coat-x-protective-coating': '/coat-x',
    '/aeos-discovery-45-horsebox': '/models/aeos-discovery-45',
    '/aeos-discovery-72-horsebox': '/models/aeos-discovery-72',
    '/helios-7-5-tonne-horseboxes': '/models',
    '/aeos-4-5-tonne-horseboxes': '/models',
    '/aeos-3-5-tonne-horseboxes': '/models',
    '/picking-the-right-horsebox': '/models',
    '/aluminium-in-horseboxes': '/blog/horsebox-aluminium',
}
OWN_HOSTS = {'jthltd.co.uk', 'www.jthltd.co.uk', 'kphltd.co.uk', 'www.kphltd.co.uk'}

images = {}  # original url -> local filename


def local_image(url):
    """Register an image for download and return its site-relative path."""
    if url in images:
        return '/images/blog/' + images[url]
    name = os.path.basename(urllib.parse.urlparse(url).path)
    stem = re.sub(r'[^a-z0-9]+', '-', os.path.splitext(name)[0].lower()).strip('-')[:70]
    candidate = stem or 'image'
    taken = set(images.values())
    n = 2
    while candidate + '.webp' in taken:
        candidate = f'{stem}-{n}'
        n += 1
    images[url] = candidate + '.webp'
    return '/images/blog/' + images[url]


def rewrite_link(href):
    """Point old-site links at their new home; leave external links alone."""
    href = html.unescape(href)
    parsed = urllib.parse.urlparse(href)
    if parsed.scheme and parsed.netloc.lower() not in OWN_HOSTS:
        return href, True  # external
    path = (parsed.path or '/').rstrip('/') or '/'
    slug = path.lstrip('/')
    if slug in SLUGS:
        return f'/blog/{slug}', False
    if path.startswith('/category/'):
        return '/blog', False
    if path in PAGE_MAP:
        return PAGE_MAP[path], False
    return '/models' if 'horsebox' in slug else '/', False


class Cleaner(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.drop_depth = 0

    def handle_starttag(self, tag, attrs):
        if self.drop_depth:
            if tag in DROP_TREE:
                self.drop_depth += 1
            return
        if tag in DROP_TREE:
            self.drop_depth = 1
            return
        if tag in UNWRAP or tag not in KEEP:
            return
        a = dict(attrs)
        if tag == 'a':
            href = a.get('href')
            if not href:
                return
            new, external = rewrite_link(href)
            extra = ' target="_blank" rel="noopener noreferrer"' if external else ''
            self.out.append(f'<a href="{html.escape(new, quote=True)}"{extra}>')
            return
        if tag == 'img':
            src = a.get('data-src') or a.get('src')
            if not src or src.startswith('data:'):
                return
            alt = html.escape(a.get('alt', '').strip(), quote=True)
            self.out.append(f'<img src="{local_image(html.unescape(src))}" alt="{alt}" loading="lazy" />')
            return
        self.out.append(f'<{tag}>')

    def handle_endtag(self, tag):
        if self.drop_depth:
            if tag in DROP_TREE:
                self.drop_depth -= 1
            return
        if tag in UNWRAP or tag not in KEEP or tag in VOID:
            return
        self.out.append(f'</{tag}>')

    def handle_data(self, data):
        if self.drop_depth:
            return
        self.out.append(html.escape(data, quote=False))


def clean(raw):
    c = Cleaner()
    c.feed(raw)
    s = ''.join(c.out)
    s = re.sub(r'[ \t]+', ' ', s)
    s = re.sub(r'\s*\n\s*', '\n', s)
    # Elementor leaves a lot of empty containers behind.
    for _ in range(4):
        s = re.sub(r'<(p|li|h[2-6]|strong|em|ul|ol)>\s*</\1>', '', s)
    s = re.sub(r'\n{2,}', '\n', s)
    return s.strip()


def text_of(raw):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', raw)).split())


# The old theme opened every post with an Elementor header block: the post title
# repeated as an <h2>, the featured image again, the JTH logo strip, and an empty
# "Table of Contents" widget whose list was generated client-side. None of it
# survives usefully here — the new template already renders a title and hero.
LOGO_RE = re.compile(r'<img src="/images/blog/photo-2025-01-26[^"]*"[^>]*/>')
TOC_RE = re.compile(r'<h[2-6]>\s*Table of Contents\s*</h[2-6]>', re.I)


def variant_of(a, b):
    """True when two image paths are WordPress size variants of one original."""
    strip = lambda u: re.sub(r'-\d+x\d+(?=\.webp$)', '', u or '')
    return bool(a and b and strip(a) == strip(b))


def strip_lead(content, featured_local):
    content = LOGO_RE.sub('', content)

    toc = TOC_RE.search(content)
    if toc:
        content = content[toc.end():]
    else:
        # No table of contents: drop just the repeated title heading, and the
        # featured image if it opens the post a second time.
        content = re.sub(r'^\s*<h[2-6]>[^<]*</h[2-6]>', '', content, count=1)
        first_img = re.match(r'\s*<img src="([^"]+)"[^>]*/>', content)
        if first_img and variant_of(first_img.group(1), featured_local):
            content = content[first_img.end():]

    return content.strip()


# One post leaked the theme's sidebar widgets (Categories / Recent Posts) into
# the body. They are navigation, not content, and the new blog has its own.
SIDEBAR_RE = re.compile(
    r'<h[2-6]>\s*(?:Categories|Recent Posts)\s*</h[2-6]>\s*(?:<ul>.*?</ul>)?',
    re.I | re.S)

# The byline sat in a heading, which put a second H2 above the article's real
# first heading. Same words, sane outline.
BYLINE_RE = re.compile(r'<h2>\s*(Written by [^<]*?)\s*</h2>', re.I)


def tidy_structure(content):
    content = SIDEBAR_RE.sub('', content)
    content = BYLINE_RE.sub(lambda m: f'<p><strong>{m.group(1)}</strong></p>', content)
    return content.strip()


# 16 inline images were hot-linked from the old KPH site and now 404 there —
# they are already broken on the live legacy pages, and the Wayback Machine has
# no copy. Carrying a dead <img> over would only move the breakage.
UNAVAILABLE = set(json.load(open(os.environ['UNAVAILABLE_IMAGES']))
                  if os.environ.get('UNAVAILABLE_IMAGES') else [])


def drop_dead_images(content):
    for name in UNAVAILABLE:
        content = re.sub(r'<img src="/images/blog/' + re.escape(name) + r'"[^>]*/>', '', content)
    return content


def fill_alts(content, title):
    """Inline photos illustrate the subject; an empty alt tells a reader nothing."""
    return re.sub(r'<img src="([^"]+)" alt=""',
                  lambda m: f'<img src="{m.group(1)}" alt="{html.escape(title, quote=True)}"',
                  content)


out = []
for p in posts:
    emb = p.get('_embedded', {})
    terms = emb.get('wp:term') or []
    category = html.unescape(terms[0][0]['name']) if terms and terms[0] else None
    tags = [html.unescape(t['name']) for t in (terms[1] if len(terms) > 1 else [])]
    yoast = p.get('yoast_head_json') or {}

    featured_url = None
    media = emb.get('wp:featuredmedia') or []
    if media and isinstance(media[0], dict):
        featured_url = media[0].get('source_url')
    if not featured_url and yoast.get('og_image'):
        featured_url = yoast['og_image'][0].get('url')

    featured_local = local_image(featured_url) if featured_url else None
    content = fill_alts(
        drop_dead_images(
            tidy_structure(strip_lead(clean(p['content']['rendered']), featured_local))),
        html.unescape(p['title']['rendered']))
    excerpt = text_of(p['excerpt']['rendered'])
    if len(excerpt) > 300:
        excerpt = excerpt[:297].rsplit(' ', 1)[0] + '…'

    meta_desc = yoast.get('description') or yoast.get('og_description') or excerpt

    out.append({
        '_id': f"wp-{p['id']}",
        'title': html.unescape(p['title']['rendered']),
        'slug': {'current': p['slug']},
        'excerpt': excerpt,
        'category': category,
        'tags': tags,
        'featuredImage': ({'asset': {'url': featured_local},
                           'alt': html.unescape(p['title']['rendered'])}
                          if featured_local else None),
        'content': content,
        'publishedAt': p['date_gmt'] + 'Z',
        'updatedAt': p['modified_gmt'] + 'Z',
        'featured': False,
        # The layout already appends the brand, so carrying the legacy site's
        # own suffix through would double it up in the tab title.
        'metaTitle': None,
        'metaDescription': meta_desc,
        'keywords': [],
    })

out.sort(key=lambda x: x['publishedAt'], reverse=True)
out[0]['featured'] = True

json.dump(out, open(OUT, 'w'), indent=2, ensure_ascii=False)
json.dump(images, open(IMG_MANIFEST, 'w'), indent=2)

print(f'posts: {len(out)}  images: {len(images)}')
print('shortest content:', min((len(p["content"]), p["slug"]["current"]) for p in out))
missing_img = [p['slug']['current'] for p in out if not p['featuredImage']]
print('without featured image:', missing_img or 'none')
