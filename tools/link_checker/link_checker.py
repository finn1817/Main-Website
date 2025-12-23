#!/usr/bin/env python3
"""
Link Checker
- Scans all HTML files in the workspace
- Validates local links (href) and local assets (img/src, script/src, link/href)
- Reports missing files and missing same-page anchors
Output: tools/link_checker/link-report.json + concise console summary

Run: python tools/link_checker/link_checker.py
"""
import os
import re
import json
from pathlib import Path
from html.parser import HTMLParser

# project root: go two levels up from tools/<tool_name>/script.py
ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / 'link-report.json'
SKIP_DIRS = {'.venv', 'venv', 'node_modules', '.git', 'tools'}

ABS_URL_SCHEMES = (
    'http://', 'https://', 'mailto:', 'tel:', 'data:', 'javascript:'
)

class LinkAssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []  # (href, tag)
        self.assets = [] # (src_or_href, tag)
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        # collect element ids for anchor checks
        if 'id' in attrs:
            self.ids.add(attrs['id'])

        # links
        if tag == 'a':
            href = attrs.get('href')
            if href:
                self.links.append((href, tag))

        # assets: img/src, script/src, link/href (CSS)
        if tag in ('img', 'script'):
            src = attrs.get('src')
            if src:
                self.assets.append((src, tag))
        elif tag == 'link':
            href = attrs.get('href')
            if href:
                self.assets.append((href, tag))


def is_abs_url(url: str) -> bool:
    return url.startswith(ABS_URL_SCHEMES)


def resolve_path(base_file: Path, url: str) -> Path:
    # strip query/hash
    clean = url.split('#')[0].split('?')[0]
    if clean.startswith('/'):
        return (ROOT / clean.lstrip('/')).resolve()
    return (base_file.parent / clean).resolve()


def collect_html_files():
    files = []
    for p in ROOT.rglob('*.html'):
        rel_parts = p.relative_to(ROOT).parts
        if any(part in SKIP_DIRS for part in rel_parts):
            continue
        files.append(p)
    return files


def check_file(html_path: Path):
    text = html_path.read_text(encoding='utf-8', errors='ignore')
    parser = LinkAssetParser()
    parser.feed(text)

    broken_links = []
    missing_anchors = []
    broken_assets = []

    # links
    for href, tag in parser.links:
        if not href or href.strip() == '':
            broken_links.append({'href': href, 'reason': 'empty'})
            continue
        if is_abs_url(href):
            # skip external
            continue
        if href.startswith('#'):
            anchor = href[1:]
            if anchor and anchor not in parser.ids:
                missing_anchors.append({'anchor': anchor, 'reason': 'same-page id not found'})
            continue
        # cross-page + optional anchor
        target_file = href.split('#', 1)[0]
        tp = resolve_path(html_path, target_file)
        if not tp.exists():
            broken_links.append({'href': href, 'reason': 'target file missing'})

    # assets
    for ref, tag in parser.assets:
        if not ref or ref.strip() == '':
            broken_assets.append({'ref': ref, 'tag': tag, 'reason': 'empty'})
            continue
        if is_abs_url(ref):
            # external asset — skip
            continue
        tp = resolve_path(html_path, ref)
        if not tp.exists():
            broken_assets.append({'ref': ref, 'tag': tag, 'reason': 'target asset missing'})

    return {
        'file': str(html_path.relative_to(ROOT).as_posix()),
        'broken_links': broken_links,
        'missing_anchors': missing_anchors,
        'broken_assets': broken_assets,
    }


def main():
    html_files = collect_html_files()
    results = []
    total_links = total_assets = 0
    broken_links_count = missing_anchors_count = broken_assets_count = 0

    for f in html_files:
        res = check_file(f)
        results.append(res)
        total_links += len(res['broken_links']) + len(res['missing_anchors'])  # links + anchors for context
        total_assets += len(res['broken_assets'])
        broken_links_count += len(res['broken_links'])
        missing_anchors_count += len(res['missing_anchors'])
        broken_assets_count += len(res['broken_assets'])

    report = {
        'summary': {
            'html_files_scanned': len(html_files),
            'broken_links': broken_links_count,
            'missing_anchors': missing_anchors_count,
            'broken_assets': broken_assets_count,
        },
        'details': results,
    }

    OUT.write_text(json.dumps(report, indent=2), encoding='utf-8')

    print('Scanned', len(html_files), 'HTML files')
    print('Broken links:', broken_links_count,
          '| Missing anchors:', missing_anchors_count,
          '| Broken assets:', broken_assets_count)
    print('Report written to', OUT)


if __name__ == '__main__':
    main()
