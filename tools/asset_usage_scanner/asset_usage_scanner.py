#!/usr/bin/env python3
"""Scan project HTML files for references to .js and .css assets and report usage.
Generates JSON output at tools/asset-usage.json and prints a short summary.

Run: python tools/asset_usage_scanner.py
"""
import os
import re
import json
from pathlib import Path

# project root: two levels up from tools/asset_usage_scanner/asset_usage_scanner.py
ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / 'asset-usage.json'

HTML_PATTERN = re.compile(r"<script[^>]+src=[\"']([^\"']+\.js)[\"'][^>]*>|<link[^>]+href=[\"']([^\"']+\.css)[\"'][^>]*>", re.IGNORECASE)


def find_files():
    html_files = []
    js_files = set()
    css_files = set()

    skip_dirs = {'.venv', 'venv', 'node_modules', '.git', 'tools'}
    for p in ROOT.rglob('*'):
        if p.is_dir():
            continue
        rel = p.relative_to(ROOT).as_posix()
        # skip files under known non-site folders
        if any(part in skip_dirs for part in Path(rel).parts):
            continue
        if rel.endswith('.html'):
            html_files.append(p)
        elif rel.endswith('.js'):
            js_files.add(rel)
        elif rel.endswith('.css'):
            css_files.add(rel)

    return html_files, js_files, css_files


def scan():
    html_files, js_files, css_files = find_files()

    asset_to_pages = {}

    for html in html_files:
        try:
            text = html.read_text(encoding='utf-8')
        except Exception:
            text = html.read_text(encoding='latin-1')

        for m in HTML_PATTERN.finditer(text):
            src = m.group(1) or m.group(2)
            if not src:
                continue
            # normalize path (strip query/hash)
            src = src.split('?')[0].split('#')[0]
            # resolve relative to the html file
            src_path = (html.parent / src).resolve()
            try:
                rel = src_path.relative_to(ROOT).as_posix()
            except Exception:
                rel = src
            asset_to_pages.setdefault(rel, []).append(str(html.relative_to(ROOT).as_posix()))

    used_js = {a for a in asset_to_pages.keys() if a.endswith('.js')}
    used_css = {a for a in asset_to_pages.keys() if a.endswith('.css')}

    unused_js = sorted(list(js_files - used_js))
    unused_css = sorted(list(css_files - used_css))

    data = {
        'assets_found': {
            'js_count': len(js_files),
            'css_count': len(css_files),
        },
        'used_assets': asset_to_pages,
        'unused_js': unused_js,
        'unused_css': unused_css,
    }

    OUT.write_text(json.dumps(data, indent=2), encoding='utf-8')

    print('Scanned', len(html_files), 'HTML files')
    print('JS files found:', len(js_files), 'CSS files found:', len(css_files))
    print('Used assets entries:', len(asset_to_pages))
    print('Unused JS:', len(unused_js), 'Unused CSS:', len(unused_css))
    print('Results written to', OUT)


if __name__ == '__main__':
    scan()
