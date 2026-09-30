#!/usr/bin/env python3
"""Check local links, page metadata and the sitemap without third-party packages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree as ET
import re
ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://chatzidisglobal.com/'
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path=path; self.tags=[]; self.ids=[]
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs); self.tags.append((tag,attrs))
        if 'id' in attrs: self.ids.append(attrs['id'])
pages = {p.name:Page(p) for p in ROOT.glob('*.html')}
errors=[]; resources=set(); link_count=0
for name,page in pages.items():
    if len(page.ids)!=len(set(page.ids)): errors.append(f'{name}: duplicate IDs')
    if sum(t=='h1' for t,a in page.tags)!=1: errors.append(f'{name}: expected one H1')
    canon=[a['href'] for t,a in page.tags if t=='link' and a.get('rel')=='canonical']
    if name!='404.html' and canon!=[BASE+('' if name=='index.html' else name)]: errors.append(f'{name}: canonical mismatch')
    for key in ['description','og:title','og:description','og:image','twitter:card']:
        if not any(t=='meta' and a.get('name',a.get('property'))==key and a.get('content') for t,a in page.tags): errors.append(f'{name}: missing {key}')
    for tag,attrs in page.tags:
        if tag=='img' and 'alt' not in attrs: errors.append(f'{name}: image missing alt')
        urls=[attrs[k] for k in ('href','src') if k in attrs]
        if attrs.get('srcset'): urls += [part.strip().split()[0] for part in attrs['srcset'].split(',')]
        for url in urls:
            parsed=urlsplit(url)
            if parsed.scheme or parsed.netloc: continue
            rel=unquote(parsed.path)
            rel=rel.lstrip('/')
            target=(ROOT/rel).resolve() if rel else page.path
            if target.is_dir(): target=target/'index.html'
            link_count+=1
            if not target.is_file(): errors.append(f'{name}: missing {url}'); continue
            resources.add(target.relative_to(ROOT).as_posix())
            if parsed.fragment and target.suffix=='.html':
                other=pages.get(target.name)
                if other and unquote(parsed.fragment) not in other.ids: errors.append(f'{name}: missing anchor {url}')
    if any(t=='form' and a.get('method')!='dialog' for t,a in page.tags): errors.append(f'{name}: unexpected form endpoint')
for css in ['styles.css','fonts.css']:
    for url in re.findall(r'url\([\'\"]?([^\)\'\"]+)',(ROOT/css).read_text()):
        if url.startswith(('data:','https:')): continue
        if not (ROOT/url).is_file(): errors.append(f'{css}: missing {url}')
        else: resources.add(url)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
locations=[el.text for el in ET.parse(ROOT/'sitemap.xml').findall('s:url/s:loc',ns)]
expected={BASE+('' if name=='index.html' else name) for name in pages if name!='404.html'}
if set(locations)!=expected: errors.append('Sitemap does not match indexable pages')
if BASE+'sitemap.xml' not in (ROOT/'robots.txt').read_text(): errors.append('robots.txt sitemap URL missing')
if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages, {link_count} local references, {len(resources)} distinct resources, sitemap and metadata.')
