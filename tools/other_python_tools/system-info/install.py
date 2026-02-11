#!/usr/bin/env python3
"""
Per-project installer for System-Info
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


def install_requirements(req):
    env = os.environ.copy()
    env['PYTHONIOENCODING'] = 'utf-8'
    env['PYTHONUTF8'] = '1'
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(req)], check=True, env=env)
        print('✅ Installed')
    except subprocess.CalledProcessError as e:
        print('❌ pip install failed:', e)


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
        'GPUtil': 'GPUtil',
        'wmi': 'wmi',
        'cpuinfo': 'py-cpuinfo',
        'requests': 'requests',
        'PIL': 'Pillow',
        'cv2': 'opencv-python',
        'win32api': 'pywin32',
        'win32process': 'pywin32',
        'win32con': 'pywin32'
    }
    
    try:
        content = script_path.read_text(encoding='utf-8')
        packages_to_install = set()
        
        # Find import statements
        import re
        import_pattern = r'(?:^|\n)\s*(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_]*)'
        matches = re.findall(import_pattern, content)
        
        for module in matches:
            if module in import_to_pip:
                packages_to_install.add(import_to_pip[module])
        
        if packages_to_install:
            print(f'📦 Auto-detected dependencies: {", ".join(packages_to_install)}')
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
            print('ℹ️ No known dependencies detected')
    except Exception as e:
        print(f'⚠️ Could not auto-detect dependencies: {e}')


def create_launcher(script):
    if os.name != 'nt':
        return
    desktop = Path.home() / 'Desktop'
    bat = desktop / f'Run_{Path(script).stem}.bat'
    python_exe = sys.executable
    content = ["@echo off", f'start "" "{python_exe}" "{str(Path(script).resolve())}"', 'pause']
    bat.write_text('\r\n'.join(content), encoding='utf-8')


def main():
    print('📦 System-Info installer')
    if not pip_ok():
        print('❌ pip missing')
        sys.exit(1)
    
    base = Path(__file__).parent
    req = base / 'requirements.txt'
    if req.exists():
        install_requirements(req)
    else:
        print('ℹ️ No requirements.txt found; auto-detecting dependencies')
        script = base / 'dans_system_info.py'
        auto_detect_and_install_deps(script)
    
    script = base / 'dans_system_info.py'
    if script.exists():
        create_launcher(script)
    print('✅ System-Info installer done')

if __name__ == '__main__':
    main()
