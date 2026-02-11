#!/usr/bin/env python3
"""
Per-project installer for network-analyzer
Installs local requirements and creates a Desktop launcher for network_diagnostic_tool.py
"""
import subprocess
import sys
import os
from pathlib import Path

def pip_ok():
    try:
        subprocess.run([sys.executable, '-m', 'pip', '--version'], check=True, capture_output=True)
        return True
    except Exception:
        return False


def install_reqs(req_file):
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'
    env['PYTHONUTF8'] = '1'
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(req_file)], check=True, env=env)
        print(f'----- Installed {req_file}')
        return True
    except subprocess.CalledProcessError as e:
        print(f'----- pip install failed: {e}')
        return False


def auto_detect_and_install_deps(script_path):
    """Parse script imports and install corresponding packages"""
    if not script_path.exists():
        return
    
    # Common import -> pip package mappings
    import_to_pip = {
        'psutil': 'psutil',
        'customtkinter': 'customtkinter', 
        'matplotlib': 'matplotlib',
        'numpy': 'numpy',
        'scapy': 'scapy',
        'requests': 'requests',
        'speedtest': 'speedtest-cli',
        'dns': 'dnspython',
        'ping3': 'ping3',
        'PIL': 'Pillow',
        'win32api': 'pywin32',
        'win32con': 'pywin32',
        'win32service': 'pywin32',
        'win32serviceutil': 'pywin32',
        'wmi': 'WMI',
        'pysnmp': 'pysnmp-lextudio',
        'tkinter': None,  # usually built-in
        'threading': None,  # built-in
        'collections': None,  # built-in
        'datetime': None,  # built-in
    }
    
    try:
        content = script_path.read_text(encoding='utf-8')
        packages_to_install = set()
        
        # Find import statements
        import re
        import_pattern = r'(?:^|\n)\s*(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_]*)'
        matches = re.findall(import_pattern, content)
        
        for module in matches:
            if module in import_to_pip and import_to_pip[module]:
                packages_to_install.add(import_to_pip[module])
        
        if packages_to_install:
            print(f'Auto-detected dependencies: {", ".join(packages_to_install)}')
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'
            env['PYTHONUTF8'] = '1'
            
            for package in packages_to_install:
                try:
                    subprocess.run([sys.executable, '-m', 'pip', 'install', package], check=True, env=env)
                    print(f'✅ Installed {package}')
                except subprocess.CalledProcessError as e:
                    print(f'⚠️ Failed to install {package}: {e}')
        else:
            print('No known dependencies detected')
    except Exception as e:
        print(f'⚠️ Could not auto-detect dependencies: {e}')


def create_desktop_launcher(script_path):
    if os.name != 'nt':
        print('Launcher only for Windows')
        return
    desktop = Path.home() / 'Desktop'
    bat = desktop / f'Run_{Path(script_path).stem}.bat'
    script_dir = Path(script_path).parent
    
    # Create launcher that calls run.bat (which handles admin elevation and error display)
    content = [
        "@echo off",
        "title Network Analyzer Launcher",
        f'cd /d "{str(script_dir.resolve())}"',
        'call run.bat',
        'if errorlevel 1 (',
        '    echo.',
        '    echo [ERROR] Failed to launch Network Analyzer',
        '    pause',
        ')'
    ]
    with open(bat, 'w', encoding='utf-8') as f:
        f.write('\r\n'.join(content))
    print(f'Created launcher {bat}')


def main():
    print('network-analyzer installer')
    
    # Ensure we're in the script directory
    base = Path(__file__).parent
    os.chdir(base)
    
    # Check/create local venv
    venv_python = base / '.venv' / 'Scripts' / 'python.exe'
    if not venv_python.exists():
        print('ℹ️ Creating local virtual environment...')
        try:
            subprocess.run([sys.executable, '-m', 'venv', '.venv'], check=True)
            print('✅ Virtual environment created')
        except subprocess.CalledProcessError as e:
            print(f'❌ Failed to create venv: {e}')
            sys.exit(1)
    else:
        print('✅ Local virtual environment found')
    
    # Use venv python for everything below
    python_exe = str(venv_python)
    
    if not pip_ok():
        print('❌ pip missing')
        sys.exit(1)
    
    req = base / 'requirements.txt'
    if req.exists():
        print(f'📦 Installing from {req.name}...')
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        env['PYTHONUTF8'] = '1'
        try:
            subprocess.run([python_exe, '-m', 'pip', 'install', '-r', str(req)], check=True, env=env)
            print(f'✅ Installed all requirements')
        except subprocess.CalledProcessError as e:
            print(f'❌ pip install failed: {e}')
            sys.exit(1)
    else:
        print('ℹ️ No requirements.txt found; auto-detecting dependencies')
        script = base / 'network_diagnostic_tool.py'
        auto_detect_and_install_deps(script)
    
    script = base / 'network_diagnostic_tool.py'
    if script.exists():
        create_desktop_launcher(script)
    else:
        print('⚠️ Main script not found')
    print('✅ Done')

if __name__ == '__main__':
    main()
