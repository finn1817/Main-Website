#!/usr/bin/env python3
"""
Tools Dashboard (GUI)
- Central launcher for project tools
- Buttons to run and view reports for each tool
- Uses standard library only (tkinter + subprocess)

Run: python tools/tools_dashboard.py
"""
import os
import sys
import json
import subprocess
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

# -----------------------------------------------------------------------------
# CONFIG & PATHS
# This section sets up paths to tool scripts and report files.
# -----------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parents[1]
TOOLS_DIR = ROOT / 'tools'

TOOLS = {
    'asset_usage_scanner': {
        'script': TOOLS_DIR / 'asset_usage_scanner' / 'asset_usage_scanner.py',
        'report': TOOLS_DIR / 'asset_usage_scanner' / 'asset-usage.json',
        'description': 'Scan HTML for referenced JS/CSS assets and list unused assets.'
    },
    'link_checker': {
        'script': TOOLS_DIR / 'link_checker' / 'link_checker.py',
        'report': TOOLS_DIR / 'link_checker' / 'link-report.json',
        'description': 'Validate local links and assets in all HTML pages.'
    },
    'site_manager': {
        'script': TOOLS_DIR / 'site_manager' / 'site_manager.py',
        'report': None,
        'description': 'Backend + Frontend management app (tabs: Content, Search, Preview, Deploy).'
    },
}

# -----------------------------------------------------------------------------
# UTILITIES
# This section includes helpers to run scripts and open/view reports.
# -----------------------------------------------------------------------------

def run_script(path: Path, cwd: Path = None) -> subprocess.CompletedProcess:
    if not path.exists():
        raise FileNotFoundError(f'Script not found: {path}')
    cmd = [sys.executable, str(path)]
    return subprocess.run(cmd, cwd=str(cwd or path.parent), capture_output=True, text=True)


def read_json(path: Path):
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return None

# -----------------------------------------------------------------------------
# GUI APP
# This section builds the Tkinter GUI with distinct sections and actions.
# -----------------------------------------------------------------------------
class ToolsDashboard(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Project Tools Dashboard')
        self.geometry('900x600')
        self.minsize(800, 520)

        self.create_widgets()

    def create_widgets(self):
        # Header
        header = ttk.Frame(self)
        header.pack(fill='x', padx=10, pady=(10, 5))
        ttk.Label(header, text='Tools Dashboard', font=('Segoe UI', 16, 'bold')).pack(side='left')
        ttk.Button(header, text='Open tools folder', command=self.open_tools_folder).pack(side='right')

        # Main content frame: left panel (tools) + right panel (log/output)
        main = ttk.Frame(self)
        main.pack(fill='both', expand=True, padx=10, pady=10)

        # Left panel: tools list and actions
        left = ttk.LabelFrame(main, text='Available Tools')
        left.pack(side='left', fill='y', padx=(0, 10), pady=0)

        # Tool entries
        for key, cfg in TOOLS.items():
            frame = ttk.Frame(left)
            frame.pack(fill='x', padx=10, pady=8)
            ttk.Label(frame, text=key.replace('_', ' ').title(), font=('Segoe UI', 11, 'bold')).pack(anchor='w')
            ttk.Label(frame, text=cfg['description'], wraplength=280).pack(anchor='w')

            btns = ttk.Frame(frame)
            btns.pack(fill='x', pady=4)
            ttk.Button(btns, text='Run', command=lambda k=key: self.run_tool(k)).pack(side='left')
            ttk.Button(btns, text='View Report', command=lambda k=key: self.view_report(k)).pack(side='left', padx=6)

        # Right panel: log/output
        right = ttk.LabelFrame(main, text='Output / Logs')
        right.pack(side='left', fill='both', expand=True)

        self.text = tk.Text(right, wrap='word', font=('Consolas', 10))
        self.text.pack(fill='both', expand=True)
        self.text.insert('end', 'Welcome to the Tools Dashboard.\nUse the buttons on the left to run tools and view their reports.\n')

        # Footer
        footer = ttk.Frame(self)
        footer.pack(fill='x', padx=10, pady=(0, 10))
        ttk.Button(footer, text='Refresh', command=self.refresh).pack(side='left')
        ttk.Button(footer, text='Exit', command=self.destroy).pack(side='right')

    # ------------------------------------------------------------------
    # Actions
    # ------------------------------------------------------------------
    def append_log(self, msg: str):
        self.text.insert('end', msg + '\n')
        self.text.see('end')

    def open_tools_folder(self):
        # Open tools directory in system file explorer
        os.startfile(str(TOOLS_DIR)) if os.name == 'nt' else subprocess.run(['open', str(TOOLS_DIR)])

    def run_tool(self, key: str):
        cfg = TOOLS.get(key)
        if not cfg:
            messagebox.showerror('Error', f'Tool not found: {key}')
            return
        self.append_log(f'Running {key} ...')
        try:
            proc = run_script(cfg['script'])
            if proc.returncode == 0:
                self.append_log(proc.stdout.strip() or '[no output]')
            else:
                self.append_log(proc.stdout.strip())
                self.append_log(proc.stderr.strip())
                messagebox.showerror('Error', f'{key} failed (exit {proc.returncode})')
        except Exception as e:
            messagebox.showerror('Error', str(e))
            self.append_log(f'Error: {e}')

    def view_report(self, key: str):
        cfg = TOOLS.get(key)
        if not cfg:
            messagebox.showerror('Error', f'Tool not found: {key}')
            return
        data = read_json(cfg['report'])
        if data is None:
            messagebox.showinfo('Report', 'Report missing or invalid JSON. Try running the tool first.')
            return
        self.text.insert('end', f'\n--- {key} report ---\n')
        try:
            pretty = json.dumps(data, indent=2)
            self.text.insert('end', pretty + '\n')
        except Exception:
            self.text.insert('end', '[Unable to render JSON]\n')
        self.text.see('end')

    def refresh(self):
        self.text.insert('end', '\nRefreshed.\n')
        self.text.see('end')

# -----------------------------------------------------------------------------
# ENTRY POINT
# -----------------------------------------------------------------------------
if __name__ == '__main__':
    app = ToolsDashboard()
    app.mainloop()
