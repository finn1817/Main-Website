import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import customtkinter as ctk
import psutil
import subprocess
import threading
import time
import json
import os
import platform
import socket
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np
import csv
import webbrowser
from collections import deque
import winsound
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import queue
import ctypes
import gc
import math
import hashlib
import random

try:
    import GPUtil
    gpu_available = True
except ImportError:
    gpu_available = False

try:
    import wmi
    wmi_available = True
except ImportError:
    wmi_available = False

# CPU stress worker function (runs in separate process)
def cpu_stress_worker(core_id, intensity, stop_event, duration):
    """Heavy CPU stress test worker - based on Prime95 algorithms"""
    start_time = time.time()
    
    # Set CPU affinity to specific core
    if platform.system() == 'Windows':
        try:
            import win32api, win32process, win32con
            handle = win32api.GetCurrentProcess()
            win32process.SetProcessAffinityMask(handle, 1 << core_id)
        except:
            pass
    
    # Prime number generation (CPU intensive)
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                return False
        return True
    
    # Lucas-Lehmer test (very CPU intensive)
    def lucas_lehmer_test(p):
        s = 4
        M = (1 << p) - 1
        for _ in range(p - 2):
            s = ((s * s) - 2) % M
        return s == 0
    
    # Floating point intensive calculations
    def float_stress():
        result = 0.0
        for i in range(1000):
            result += math.sin(i) * math.cos(i) * math.tan(i/100 + 0.1)
            result += math.sqrt(abs(result)) + math.log(abs(result) + 1)
        return result
    
    # Integer stress calculations
    def int_stress():
        result = 1
        for i in range(1, 1000):
            result = (result * i) % 982451653  # Large prime
        return result
    
    iteration = 0
    while time.time() - start_time < duration and not stop_event.is_set():
        try:
            # Mix of different CPU-intensive operations
            if iteration % 4 == 0:
                # Prime testing
                primes = [n for n in range(2, 1000 + (intensity * 10)) if is_prime(n)]
            elif iteration % 4 == 1:
                # Lucas-Lehmer test for smaller Mersenne numbers
                for p in range(2, min(20, 5 + intensity//10)):
                    lucas_lehmer_test(p)
            elif iteration % 4 == 2:
                # Floating point stress
                for _ in range(intensity * 10):
                    float_stress()
            else:
                # Integer arithmetic stress
                for _ in range(intensity * 10):
                    int_stress()
            
            iteration += 1
            
            # Small sleep based on intensity (100% = no sleep)
            if intensity < 100:
                time.sleep((100 - intensity) * 0.0001)
                
        except Exception as e:
            print(f"CPU worker {core_id} error: {e}")
            break

# RAM stress worker function
def ram_stress_worker(worker_id, intensity, stop_event, duration):
    """Aggressive RAM stress test - based on MemTest86 patterns"""
    start_time = time.time()
    
    # Calculate how much RAM to use
    total_ram = psutil.virtual_memory().total
    available_ram = psutil.virtual_memory().available
    
    # Use percentage of available RAM based on intensity
    ram_to_use = int((available_ram * intensity / 100) * 0.8)  # 80% safety margin
    chunk_size = min(ram_to_use // 10, 100 * 1024 * 1024)  # Max 100MB chunks
    
    if chunk_size < 1024 * 1024:  # Minimum 1MB
        return
    
    memory_blocks = []
    
    # MemTest86-style test patterns
    test_patterns = [
        0x00000000, 0xFFFFFFFF, 0x55555555, 0xAAAAAAAA,
        0x33333333, 0xCCCCCCCC, 0x66666666, 0x99999999,
        0x00FF00FF, 0xFF00FF00, 0x0F0F0F0F, 0xF0F0F0F0
    ]
    
    try:
        print(f"RAM worker {worker_id}: Allocating {ram_to_use // (1024*1024)} MB")
        
        while time.time() - start_time < duration and not stop_event.is_set():
            try:
                # Allocate memory chunk
                memory_block = bytearray(chunk_size)
                
                # Fill with test pattern
                pattern = test_patterns[len(memory_blocks) % len(test_patterns)]
                pattern_bytes = pattern.to_bytes(4, byteorder='little')
                
                # Fill memory with pattern
                for i in range(0, len(memory_block), 4):
                    if stop_event.is_set():
                        break
                    end_idx = min(i + 4, len(memory_block))
                    memory_block[i:end_idx] = pattern_bytes[:end_idx-i]
                
                # Verify pattern (read back and check)
                for i in range(0, len(memory_block), 4096):  # Check every 4KB
                    if stop_event.is_set():
                        break
                    end_idx = min(i + 4, len(memory_block))
                    expected = pattern_bytes[:end_idx-i]
                    actual = memory_block[i:end_idx]
                    if actual != expected:
                        print(f"RAM test error at offset {i}: expected {expected}, got {actual}")
                
                memory_blocks.append(memory_block)
                
                # Keep memory usage under control
                if len(memory_blocks) * chunk_size > ram_to_use:
                    # Remove oldest blocks
                    while len(memory_blocks) > ram_to_use // chunk_size:
                        memory_blocks.pop(0)
                
                # Random access pattern
                if memory_blocks:
                    random_block = random.choice(memory_blocks)
                    for _ in range(1000):
                        if stop_event.is_set():
                            break
                        idx = random.randint(0, len(random_block) - 1)
                        random_block[idx] = random.randint(0, 255)
                
                time.sleep(0.001)  # Very short sleep
                
            except MemoryError:
                print(f"RAM worker {worker_id}: Memory allocation failed, reducing load")
                # Remove half the blocks and continue
                memory_blocks = memory_blocks[len(memory_blocks)//2:]
                time.sleep(0.1)
                
    except Exception as e:
        print(f"RAM worker {worker_id} error: {e}")
    finally:
        # Clean up
        del memory_blocks
        gc.collect()

# GPU stress worker
def gpu_stress_worker(intensity, stop_event, duration):
    """GPU stress test using heavy mathematical operations"""
    start_time = time.time()
    
    try:
        while time.time() - start_time < duration and not stop_event.is_set():
            # Heavy matrix operations
            size = 500 + (intensity * 10)
            
            # Create large random matrices
            matrix_a = np.random.rand(size, size).astype(np.float64)
            matrix_b = np.random.rand(size, size).astype(np.float64)
            
            # Heavy computations
            result = np.dot(matrix_a, matrix_b)  # Matrix multiplication
            result = np.linalg.inv(result + np.eye(size) * 0.01)  # Matrix inversion
            result = np.fft.fft2(result)  # 2D FFT
            result = np.abs(result)  # Absolute values
            
            # Memory access patterns
            for _ in range(intensity):
                if stop_event.is_set():
                    break
                idx = np.random.randint(0, size, size=(100, 2))
                values = result[idx[:, 0], idx[:, 1]]
                result[idx[:, 0], idx[:, 1]] = values * 1.01
            
            # Clean up to prevent memory buildup
            del matrix_a, matrix_b, result
            
            time.sleep(0.001)
            
    except Exception as e:
        print(f"GPU worker error: {e}")

class RealStressTester:
    def __init__(self):
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        self.root = ctk.CTk()
        self.root.title("🔥 Dan's REAL PC Stress Tester v2.0 - MAXIMUM POWER!")
        self.root.geometry("1400x900")
        self.root.minsize(1200, 800)
        
        # Test state variables
        self.testing_active = False
        self.test_start_time = None
        self.current_test_profile = None
        self.cpu_processes = []
        self.ram_processes = []
        self.gpu_processes = []
        self.stop_event = multiprocessing.Event()
        self.god_mode = False
        
        # Process management
        self.process_manager = multiprocessing.Manager()
        self.data_queue = queue.Queue()
        self.status_queue = queue.Queue()
        
        # Data storage
        self.test_data = {
            'cpu_temps': deque(maxlen=1000),
            'gpu_temps': deque(maxlen=1000),
            'cpu_usage': deque(maxlen=1000),
            'gpu_usage': deque(maxlen=1000),
            'ram_usage': deque(maxlen=1000),
            'timestamps': deque(maxlen=1000),
            'errors': [],
            'crashes': []
        }
        
        # Hardware detection
        self.cpu_cores = psutil.cpu_count(logical=True)
        self.physical_cores = psutil.cpu_count(logical=False)
        self.total_ram = psutil.virtual_memory().total // (1024**3)  # GB
        
        # Hardware limits
        self.thermal_limits = {
            'cpu_max': 85,
            'gpu_max': 83,
            'ram_max': 95
        }
        # Grace period (seconds) at start of test before emergency auto-stop engages
        self.thermal_grace_seconds = 30
        
        # REAL stress test profiles
        self.test_profiles = {
            'Light Stress (50%)': {
                'duration': 300,
                'cpu_intensity': 50,
                'gpu_intensity': 40,
                'ram_intensity': 30,
                'cpu_workers': max(1, self.physical_cores // 2),
                'ram_workers': 2
            },
            'Medium Stress (75%)': {
                'duration': 600,
                'cpu_intensity': 75,
                'gpu_intensity': 70,
                'ram_intensity': 60,
                'cpu_workers': self.physical_cores,
                'ram_workers': 4
            },
            'Heavy Stress (90%)': {
                'duration': 900,
                'cpu_intensity': 90,
                'gpu_intensity': 85,
                'ram_intensity': 80,
                'cpu_workers': self.cpu_cores,
                'ram_workers': 6
            },
            'Maximum Stress (95%)': {
                'duration': 1800,
                'cpu_intensity': 95,
                'gpu_intensity': 95,
                'ram_intensity': 90,
                'cpu_workers': self.cpu_cores,
                'ram_workers': 8
            },
            'CPU Only (100%)': {
                'duration': 1200,
                'cpu_intensity': 100,
                'gpu_intensity': 0,
                'ram_intensity': 10,
                'cpu_workers': self.cpu_cores * 2,  # Hyperthreading
                'ram_workers': 1
            },
            'RAM Only (90%)': {
                'duration': 600,
                'cpu_intensity': 5,
                'gpu_intensity': 0,
                'ram_intensity': 90,
                'cpu_workers': 1,
                'ram_workers': 12
            },
            '💀 NUCLEAR MODE 💀': {
                'duration': 3600,
                'cpu_intensity': 100,
                'gpu_intensity': 100,
                'ram_intensity': 95,
                'cpu_workers': self.cpu_cores * 2,
                'ram_workers': 16
            }
        }
        
        self.setup_ui()
        self.detect_hardware_limits()
        self.load_test_history()
        self.update_ui()
    
    def setup_ui(self):
        # Main container
        main_frame = ctk.CTkFrame(self.root)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Title with warning
        title_frame = ctk.CTkFrame(main_frame)
        title_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        title_label = ctk.CTkLabel(title_frame, text="💀 Dan's REAL PC Stress Tester v2.0", 
                                 font=ctk.CTkFont(size=26, weight="bold"))
        title_label.pack(pady=10)
        
        warning_label = ctk.CTkLabel(title_frame, 
                                   text="⚠️ DANGER: This WILL push your hardware to the ABSOLUTE LIMIT! ⚠️",
                                   font=ctk.CTkFont(size=14, weight="bold"),
                                   text_color="red")
        warning_label.pack(pady=(0, 5))
        
        specs_label = ctk.CTkLabel(title_frame, 
                                 text=f"Detected: {self.cpu_cores} CPU threads, {self.total_ram}GB RAM",
                                 font=ctk.CTkFont(size=12),
                                 text_color="cyan")
        specs_label.pack(pady=(0, 10))
        
        # Control panel
        control_frame = ctk.CTkFrame(main_frame)
        control_frame.pack(fill="x", padx=10, pady=5)
        
        # Test profile selection
        profile_frame = ctk.CTkFrame(control_frame)
        profile_frame.pack(side="left", padx=10, pady=10)
        
        ctk.CTkLabel(profile_frame, text="Stress Level:", font=ctk.CTkFont(weight="bold")).pack(anchor="w", padx=5)
        
        self.profile_var = ctk.StringVar(value="Light Stress (50%)")
        self.profile_dropdown = ctk.CTkOptionMenu(profile_frame, 
                                                variable=self.profile_var,
                                                values=list(self.test_profiles.keys()),
                                                command=self.on_profile_change,
                                                width=250)
        self.profile_dropdown.pack(padx=5, pady=5)
        
        # Custom duration
        duration_frame = ctk.CTkFrame(control_frame)
        duration_frame.pack(side="left", padx=10, pady=10)
        
        ctk.CTkLabel(duration_frame, text="Duration (minutes):", font=ctk.CTkFont(weight="bold")).pack(anchor="w", padx=5)
        
        self.duration_var = ctk.StringVar(value="5")
        self.duration_entry = ctk.CTkEntry(duration_frame, textvariable=self.duration_var, width=100)
        self.duration_entry.pack(padx=5, pady=5)
        
        # Control buttons
        button_frame = ctk.CTkFrame(control_frame)
        button_frame.pack(side="right", padx=10, pady=10)
        
        self.start_btn = ctk.CTkButton(button_frame, text="🚀 UNLEASH HELL", 
                                     command=self.start_stress_test, 
                                     font=ctk.CTkFont(size=16, weight="bold"),
                                     fg_color="#ff4444", hover_color="#ff6666", width=150, height=50)
        self.start_btn.pack(side="left", padx=5)
        
        self.stop_btn = ctk.CTkButton(button_frame, text="🛑 EMERGENCY STOP", 
                                    command=self.emergency_stop_test,
                                    font=ctk.CTkFont(size=16, weight="bold"),
                                    fg_color="red", hover_color="#cc0000", width=160, height=50)
        self.stop_btn.pack(side="left", padx=5)
        
        self.export_btn = ctk.CTkButton(button_frame, text="📊 Export Report", 
                                      command=self.export_report, width=120, height=30)
        self.export_btn.pack(side="left", padx=5)
        
        # Status display
        status_frame = ctk.CTkFrame(main_frame)
        status_frame.pack(fill="x", padx=10, pady=5)
        
        self.status_label = ctk.CTkLabel(status_frame, text="Ready to destroy your hardware", 
                                       font=ctk.CTkFont(size=16, weight="bold"))
        self.status_label.pack(side="left", padx=10, pady=5)
        
        self.progress_bar = ctk.CTkProgressBar(status_frame, width=400, height=20)
        self.progress_bar.pack(side="left", padx=10, pady=5)
        self.progress_bar.set(0)
        
        self.time_label = ctk.CTkLabel(status_frame, text="00:00 / 00:00", font=ctk.CTkFont(size=14))
        self.time_label.pack(side="right", padx=10, pady=5)
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.create_realtime_tab()
        self.create_results_tab()
        self.create_settings_tab()
    
    def create_realtime_tab(self):
        # Real-time monitoring tab
        realtime_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(realtime_frame, text="📊 Live Destruction")
        
        # Create matplotlib figure
        self.fig, ((self.ax1, self.ax2), (self.ax3, self.ax4)) = plt.subplots(2, 2, figsize=(14, 10))
        self.fig.patch.set_facecolor('#2b2b2b')
        
        for ax in [self.ax1, self.ax2, self.ax3, self.ax4]:
            ax.set_facecolor('#2b2b2b')
            ax.tick_params(colors='white')
            ax.xaxis.label.set_color('white')
            ax.yaxis.label.set_color('white')
            ax.title.set_color('white')
        
        self.ax1.set_title('CPU Temperature & Usage', fontsize=14, weight='bold')
        self.ax1.set_ylabel('Temperature (°C) / Usage (%)')
        
        self.ax2.set_title('GPU Temperature & Usage', fontsize=14, weight='bold')
        self.ax2.set_ylabel('Temperature (°C) / Usage (%)')
        
        self.ax3.set_title('RAM Usage', fontsize=14, weight='bold')
        self.ax3.set_ylabel('Usage (%)')
        
        self.ax4.set_title('System Load Overview', fontsize=14, weight='bold')
        self.ax4.set_ylabel('Load (%)')
        
        self.canvas = FigureCanvasTkAgg(self.fig, realtime_frame)
        self.canvas.draw()
        self.canvas.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
        
        # Current stats display
        stats_frame = ctk.CTkFrame(realtime_frame)
        stats_frame.pack(fill="x", padx=10, pady=(0, 10))
        
        self.cpu_temp_label = ctk.CTkLabel(stats_frame, text="CPU: --°C", font=ctk.CTkFont(size=16, weight="bold"))
        self.cpu_temp_label.pack(side="left", padx=15, pady=8)
        
        self.gpu_temp_label = ctk.CTkLabel(stats_frame, text="GPU: --°C", font=ctk.CTkFont(size=16, weight="bold"))
        self.gpu_temp_label.pack(side="left", padx=15, pady=8)
        
        self.ram_label = ctk.CTkLabel(stats_frame, text="RAM: --%", font=ctk.CTkFont(size=16, weight="bold"))
        self.ram_label.pack(side="left", padx=15, pady=8)
        
        self.load_label = ctk.CTkLabel(stats_frame, text="System Load: --%", font=ctk.CTkFont(size=16, weight="bold"))
        self.load_label.pack(side="left", padx=15, pady=8)
        
        self.errors_label = ctk.CTkLabel(stats_frame, text="Errors: 0", font=ctk.CTkFont(size=16, weight="bold"))
        self.errors_label.pack(side="right", padx=15, pady=8)
    
    def create_results_tab(self):
        # Test results tab
        results_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(results_frame, text="📈 Results")
        
        self.results_text = ctk.CTkTextbox(results_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.results_text.pack(fill="both", expand=True, padx=10, pady=10)
    
    def create_settings_tab(self):
        # Settings tab
        settings_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(settings_frame, text="⚙️ Settings")
        
        scroll_frame = ctk.CTkScrollableFrame(settings_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Safety settings
        safety_frame = ctk.CTkFrame(scroll_frame)
        safety_frame.pack(fill="x", padx=5, pady=5)
        
        ctk.CTkLabel(safety_frame, text="🛡️ Safety Limits", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(anchor="w", padx=10, pady=5)
        
        # Temperature limits
        temp_frame = ctk.CTkFrame(safety_frame)
        temp_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(temp_frame, text="CPU Max Temperature (°C):").pack(side="left", padx=5)
        self.cpu_temp_var = ctk.StringVar(value=str(self.thermal_limits['cpu_max']))
        ctk.CTkEntry(temp_frame, textvariable=self.cpu_temp_var, width=80).pack(side="right", padx=5)
        
        gpu_temp_frame = ctk.CTkFrame(safety_frame)
        gpu_temp_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(gpu_temp_frame, text="GPU Max Temperature (°C):").pack(side="left", padx=5)
        self.gpu_temp_var = ctk.StringVar(value=str(self.thermal_limits['gpu_max']))
        ctk.CTkEntry(gpu_temp_frame, textvariable=self.gpu_temp_var, width=80).pack(side="right", padx=5)
        
        # Hardware info
        hardware_frame = ctk.CTkFrame(scroll_frame)
        hardware_frame.pack(fill="x", padx=5, pady=5)
        
        ctk.CTkLabel(hardware_frame, text="💻 Hardware Configuration", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(anchor="w", padx=10, pady=5)
        
        self.hardware_info = ctk.CTkTextbox(hardware_frame, height=300, font=ctk.CTkFont(family="Consolas", size=11))
        self.hardware_info.pack(fill="both", expand=True, padx=10, pady=5)
        
        self.detect_hardware()
    
    def detect_hardware_limits(self):
        """Auto-detect hardware limits"""
        try:
            cpu_info = platform.processor().lower()
            if 'intel' in cpu_info:
                self.thermal_limits['cpu_max'] = 85
            elif 'amd' in cpu_info:
                self.thermal_limits['cpu_max'] = 90
            else:
                self.thermal_limits['cpu_max'] = 80
                
            if gpu_available:
                try:
                    gpus = GPUtil.getGPUs()
                    if gpus:
                        self.thermal_limits['gpu_max'] = 83
                except:
                    self.thermal_limits['gpu_max'] = 80
        except:
            pass
    
    def detect_hardware(self):
        """Detect hardware and display detailed info"""
        try:
            info = []
            info.append("=== HARDWARE CONFIGURATION ===\n")
            
            # CPU details
            info.append(f"CPU: {platform.processor()}")
            info.append(f"Physical Cores: {self.physical_cores}")
            info.append(f"Logical Cores: {self.cpu_cores}")
            info.append(f"CPU Frequency: {psutil.cpu_freq().current:.0f} MHz")
            
            # Memory details
            ram = psutil.virtual_memory()
            info.append(f"\nRAM: {self.total_ram} GB total")
            info.append(f"Available: {ram.available // (1024**3)} GB")
            info.append(f"Used: {ram.used // (1024**3)} GB ({ram.percent:.1f}%)")
            
            # GPU details
            if gpu_available:
                try:
                    gpus = GPUtil.getGPUs()
                    for i, gpu in enumerate(gpus):
                        info.append(f"\nGPU {i}: {gpu.name}")
                        info.append(f"VRAM: {gpu.memoryTotal} MB")
                        info.append(f"Driver: {gpu.driver}")
                except:
                    info.append("\nGPU: Detection failed")
            
            # Storage
            info.append(f"\nStorage:")
            for partition in psutil.disk_partitions():
                try:
                    usage = psutil.disk_usage(partition.mountpoint)
                    info.append(f"{partition.device}: {usage.total // (1024**3)} GB ({partition.fstype})")
                except:
                    pass
            
            info.append(f"\nStress Test Configuration:")
            info.append(f"Max CPU Workers: {self.cpu_cores * 2}")
            info.append(f"Max RAM Workers: 16")
            info.append(f"Thermal Limits: CPU {self.thermal_limits['cpu_max']}°C, GPU {self.thermal_limits['gpu_max']}°C")
            
            self.hardware_info.insert("1.0", "\n".join(info))
            
        except Exception as e:
            self.hardware_info.insert("1.0", f"Hardware detection error: {str(e)}")
    
    def on_profile_change(self, profile_name):
        """Handle profile change"""
        if profile_name in self.test_profiles:
            profile = self.test_profiles[profile_name]
            self.duration_var.set(str(profile['duration'] // 60))
            
            if profile_name == '💀 NUCLEAR MODE 💀':
                result = messagebox.askyesno("💀 NUCLEAR MODE WARNING 💀", 
                                           "💀 NUCLEAR MODE WILL ABSOLUTELY DESTROY YOUR SYSTEM! 💀\n\n"
                                           "This mode will:\n"
                                           "• Use 100% of ALL CPU cores simultaneously\n"
                                           "• Allocate 95% of your RAM with intensive patterns\n"
                                           "• Push GPU to absolute maximum\n"
                                           "• Generate EXTREME heat and power consumption\n"
                                           "• Run for 1+ HOUR continuously\n\n"
                                           "⚠️ ONLY USE WITH INDUSTRIAL COOLING! ⚠️\n\n"
                                           "Your system WILL throttle, crash, or shut down!\n"
                                           "Continue with NUCLEAR MODE?")
                if result:
                    self.god_mode = True
                    messagebox.showwarning("💀 NUCLEAR MODE ACTIVATED 💀", 
                                         "💀 MAY GOD HAVE MERCY ON YOUR CPU 💀\n\n"
                                         "Emergency stop will remain active.\n"
                                         "Monitor temps CONSTANTLY!")
                else:
                    self.profile_var.set("Light Stress (50%)")
                    self.god_mode = False
            else:
                self.god_mode = False
    
    def start_stress_test(self):
        """Start the REAL stress test"""
        if self.testing_active:
            messagebox.showwarning("Test Running", "A stress test is already running!")
            return
        
        try:
            duration_minutes = int(self.duration_var.get())
            if duration_minutes <= 0:
                messagebox.showerror("Invalid Duration", "Duration must be greater than 0!")
                return
        except ValueError:
            messagebox.showerror("Invalid Duration", "Please enter a valid number!")
            return
        
        profile_name = self.profile_var.get()
        profile = self.test_profiles[profile_name].copy()
        profile['duration'] = duration_minutes * 60
        
        # Final warning for high intensity tests
        if profile['cpu_intensity'] > 80 or profile['ram_intensity'] > 70:
            result = messagebox.askyesno("HIGH INTENSITY WARNING", 
                                       f"You selected: {profile_name}\n\n"
                                       f"This will use:\n"
                                       f"• {profile['cpu_workers']} CPU workers at {profile['cpu_intensity']}%\n"
                                       f"• {profile['ram_workers']} RAM workers using {profile['ram_intensity']}% memory\n"
                                       f"• GPU at {profile['gpu_intensity']}%\n\n"
                                       f"Your system will be pushed HARD!\n"
                                       f"Continue?")
            if not result:
                return
        
        # Clear data
        for key in self.test_data:
            if isinstance(self.test_data[key], deque):
                self.test_data[key].clear()
            elif isinstance(self.test_data[key], list):
                self.test_data[key].clear()
        
        # Setup test
        self.testing_active = True
        self.current_test_profile = profile
        self.test_start_time = datetime.now()
        self.stop_event.clear()
        
        # Update UI
        self.start_btn.configure(state="disabled", text="🔥 UNLEASHING HELL...")
        self.status_label.configure(text=f"🔥 {profile_name} - MAXIMUM CARNAGE MODE!")
        
        # Start the real stress test
        threading.Thread(target=self.run_real_stress_test, daemon=True).start()
        threading.Thread(target=self.monitor_system, daemon=True).start()
        
        print(f"🔥 STARTING REAL STRESS TEST: {profile_name}")
        print(f"CPU Workers: {profile['cpu_workers']}")
        print(f"RAM Workers: {profile['ram_workers']}")
        print(f"Duration: {duration_minutes} minutes")
    
    def run_real_stress_test(self):
        """Run the ACTUAL stress test with separate processes"""
        try:
            profile = self.current_test_profile
            duration = profile['duration']
            
            print(f"🔥 Launching stress workers...")
            
            # Start CPU stress processes
            for core_id in range(profile['cpu_workers']):
                if self.stop_event.is_set():
                    break
                    
                process = multiprocessing.Process(
                    target=cpu_stress_worker,
                    args=(core_id % self.cpu_cores, profile['cpu_intensity'], self.stop_event, duration)
                )
                process.start()
                self.cpu_processes.append(process)
                print(f"Started CPU worker {core_id}")
            
            # Start RAM stress processes
            for worker_id in range(profile['ram_workers']):
                if self.stop_event.is_set():
                    break
                    
                process = multiprocessing.Process(
                    target=ram_stress_worker,
                    args=(worker_id, profile['ram_intensity'], self.stop_event, duration)
                )
                process.start()
                self.ram_processes.append(process)
                print(f"Started RAM worker {worker_id}")
            
            # Start GPU stress
            if profile['gpu_intensity'] > 0:
                for gpu_id in range(2):  # Multiple GPU workers
                    process = multiprocessing.Process(
                        target=gpu_stress_worker,
                        args=(profile['gpu_intensity'], self.stop_event, duration)
                    )
                    process.start()
                    self.gpu_processes.append(process)
                    print(f"Started GPU worker {gpu_id}")
            
            # Brief liveness check: wait a moment and ensure workers stayed alive
            time.sleep(3)
            all_processes = self.cpu_processes + self.ram_processes + self.gpu_processes
            alive_count = sum(1 for p in all_processes if p.is_alive())
            expected = len(all_processes)
            if expected > 0 and alive_count < max(1, expected // 2):
                err = f"❌ Many stress workers died immediately ({alive_count}/{expected} alive). Aborting test."
                print(err)
                self.data_queue.put(('error', err))
                self.trigger_stop(err)
                return

            self.status_queue.put("🔥 ALL WORKERS DEPLOYED - SYSTEM UNDER MAXIMUM LOAD!")
            
            # Wait for duration or stop signal
            start_time = time.time()
            while time.time() - start_time < duration and not self.stop_event.is_set():
                time.sleep(1)
            
            # Stop all processes
            print("🛑 Stopping all stress workers...")
            self.stop_event.set()
            
            # Wait for processes to finish
            all_processes = self.cpu_processes + self.ram_processes + self.gpu_processes
            for process in all_processes:
                process.join(timeout=5)
                if process.is_alive():
                    process.terminate()
                    process.join(timeout=2)
                    if process.is_alive():
                        process.kill()
            
            print("✅ All stress workers stopped")
            
        except Exception as e:
            print(f"Stress test error: {e}")
            self.status_queue.put(f"Error: {str(e)}")
        finally:
            self.testing_active = False
            self.status_queue.put("test_completed")
    
    def monitor_system(self):
        """Monitor system performance during stress test"""
        while self.testing_active and not self.stop_event.is_set():
            try:
                timestamp = time.time()
                
                # Get system stats
                cpu_percent = psutil.cpu_percent(interval=0.5)
                
                # Memory usage
                ram = psutil.virtual_memory()
                
                # CPU temperature
                cpu_temp = self.get_cpu_temperature()
                
                # GPU stats
                gpu_usage = 0
                gpu_temp = 0
                if gpu_available:
                    try:
                        gpus = GPUtil.getGPUs()
                        if gpus:
                            gpu = gpus[0]
                            gpu_usage = gpu.load * 100
                            gpu_temp = gpu.temperature
                    except:
                        pass
                
                # Update data
                self.data_queue.put(('data', {
                    'timestamp': timestamp,
                    'cpu_temp': cpu_temp,
                    'gpu_temp': gpu_temp,
                    'cpu_usage': cpu_percent,
                    'gpu_usage': gpu_usage,
                    'ram_usage': ram.percent
                }))
                
                # Check for thermal emergencies
                self.check_thermal_limits(cpu_temp, gpu_temp)
                
                # Log high usage
                if cpu_percent > 95:
                    print(f"🔥 CPU at {cpu_percent:.1f}% - MAXIMUM LOAD!")
                if ram.percent > 90:
                    print(f"🔥 RAM at {ram.percent:.1f}% - DANGER ZONE!")
                
                time.sleep(0.5)  # Monitor every 500ms
                
            except Exception as e:
                self.data_queue.put(('error', f"Monitoring error: {str(e)}"))
                time.sleep(1)
    
    def get_cpu_temperature(self):
        """Get CPU temperature"""
        try:
            if hasattr(psutil, "sensors_temperatures"):
                temps = psutil.sensors_temperatures()
                if temps:
                    for name, entries in temps.items():
                        if entries and ('cpu' in name.lower() or 'core' in name.lower()):
                            return max(entry.current for entry in entries)
        except:
            pass

        # Estimate based on load (conservative multiplier to avoid false thermal stops)
        cpu_usage = psutil.cpu_percent()
        return 30 + (cpu_usage * 0.35)

    def trigger_stop(self, reason: str):
        """Centralize stop_event setting and log the reason to queues and console"""
        try:
            msg = f"EMERGENCY STOP TRIGGERED: {reason}"
            print(msg)
            # push reason to UI queues so it is visible
            try:
                self.status_queue.put(msg)
            except Exception:
                pass
            try:
                self.data_queue.put(('error', msg))
            except Exception:
                pass
            self.stop_event.set()
        except Exception as e:
            print(f"Failed to trigger stop: {e}")
    
    def check_thermal_limits(self, cpu_temp, gpu_temp):
        """Check thermal limits and emergency stop if needed"""
        try:
            cpu_limit = int(self.cpu_temp_var.get())
            gpu_limit = int(self.gpu_temp_var.get())

            # If we're within the initial grace period, only warn and don't auto-stop yet
            elapsed = 0
            if self.test_start_time:
                elapsed = (datetime.now() - self.test_start_time).total_seconds()

            if elapsed < self.thermal_grace_seconds:
                # Log warnings but don't stop immediately
                if cpu_temp > cpu_limit:
                    warn = f"⚠️ CPU temp high (within {self.thermal_grace_seconds}s grace): {cpu_temp:.1f}°C > {cpu_limit}°C"
                    self.data_queue.put(('error', warn))
                    print(warn)
                if gpu_temp > gpu_limit:
                    warn = f"⚠️ GPU temp high (within {self.thermal_grace_seconds}s grace): {gpu_temp:.1f}°C > {gpu_limit}°C"
                    self.data_queue.put(('error', warn))
                    print(warn)
                return

            if cpu_temp > cpu_limit:
                error_msg = f"🚨 CPU THERMAL EMERGENCY: {cpu_temp:.1f}°C > {cpu_limit}°C"
                self.data_queue.put(('error', error_msg))
                print(error_msg)
                if not self.god_mode:
                    # Notify UI and stop
                    self.status_queue.put("EMERGENCY STOP: CPU overheating")
                    self.stop_event.set()
                    self.data_queue.put(('error', "EMERGENCY STOP: CPU overheating"))

            if gpu_temp > gpu_limit:
                error_msg = f"🚨 GPU THERMAL EMERGENCY: {gpu_temp:.1f}°C > {gpu_limit}°C"
                self.data_queue.put(('error', error_msg))
                print(error_msg)
                if not self.god_mode:
                    self.status_queue.put("EMERGENCY STOP: GPU overheating")
                    self.stop_event.set()
                    self.data_queue.put(('error', "EMERGENCY STOP: GPU overheating"))
        except:
            pass
    
    def update_ui(self):
        """Update UI with real-time data"""
        try:
            # Process data queue
            while not self.data_queue.empty():
                try:
                    msg_type, data = self.data_queue.get_nowait()
                    
                    if msg_type == 'data':
                        self.test_data['timestamps'].append(data['timestamp'])
                        self.test_data['cpu_temps'].append(data['cpu_temp'])
                        self.test_data['gpu_temps'].append(data['gpu_temp'])
                        self.test_data['cpu_usage'].append(data['cpu_usage'])
                        self.test_data['gpu_usage'].append(data['gpu_usage'])
                        self.test_data['ram_usage'].append(data['ram_usage'])
                        
                        self.update_realtime_display()
                        
                    elif msg_type == 'error':
                        self.test_data['errors'].append(data)
                        
                except queue.Empty:
                    break
            
            # Process status queue
            while not self.status_queue.empty():
                try:
                    status = self.status_queue.get_nowait()
                    if status == "test_completed":
                        self.test_completed()
                    else:
                        self.status_label.configure(text=status)
                except queue.Empty:
                    break
            
            # Update progress
            if self.testing_active and self.test_start_time and self.current_test_profile:
                elapsed = (datetime.now() - self.test_start_time).total_seconds()
                total_duration = self.current_test_profile['duration']
                progress = min(elapsed / total_duration, 1.0)
                self.progress_bar.set(progress)
                
                elapsed_str = f"{int(elapsed // 60):02d}:{int(elapsed % 60):02d}"
                total_str = f"{int(total_duration // 60):02d}:{int(total_duration % 60):02d}"
                self.time_label.configure(text=f"{elapsed_str} / {total_str}")
        
        except Exception as e:
            print(f"UI update error: {e}")
        
        # Schedule next update
        self.root.after(250, self.update_ui)  # Update every 250ms for responsiveness
    
    def update_realtime_display(self):
        """Update real-time stats display"""
        if not self.test_data['timestamps']:
            return
        
        try:
            # Update current stats
            if self.test_data['cpu_temps']:
                cpu_temp = self.test_data['cpu_temps'][-1]
                self.cpu_temp_label.configure(text=f"CPU: {cpu_temp:.1f}°C")
                
                if cpu_temp > 85:
                    self.cpu_temp_label.configure(text_color="red")
                elif cpu_temp > 75:
                    self.cpu_temp_label.configure(text_color="orange")
                else:
                    self.cpu_temp_label.configure(text_color="green")
            
            if self.test_data['gpu_temps']:
                gpu_temp = self.test_data['gpu_temps'][-1]
                self.gpu_temp_label.configure(text=f"GPU: {gpu_temp:.1f}°C")
                
                if gpu_temp > 83:
                    self.gpu_temp_label.configure(text_color="red")
                elif gpu_temp > 75:
                    self.gpu_temp_label.configure(text_color="orange")
                else:
                    self.gpu_temp_label.configure(text_color="green")
            
            if self.test_data['ram_usage']:
                ram_usage = self.test_data['ram_usage'][-1]
                self.ram_label.configure(text=f"RAM: {ram_usage:.1f}%")
                
                if ram_usage > 90:
                    self.ram_label.configure(text_color="red")
                elif ram_usage > 80:
                    self.ram_label.configure(text_color="orange")
                else:
                    self.ram_label.configure(text_color="green")
            
            if self.test_data['cpu_usage']:
                cpu_usage = self.test_data['cpu_usage'][-1]
                self.load_label.configure(text=f"CPU Load: {cpu_usage:.1f}%")
                
                if cpu_usage > 95:
                    self.load_label.configure(text_color="red")
                elif cpu_usage > 85:
                    self.load_label.configure(text_color="orange")
                else:
                    self.load_label.configure(text_color="green")
            
            self.errors_label.configure(text=f"Errors: {len(self.test_data['errors'])}")
            
            # Update graphs every 10 data points
            if len(self.test_data['timestamps']) % 10 == 0:
                self.update_graphs()
            
        except Exception as e:
            print(f"Display update error: {e}")
    
    def update_graphs(self):
        """Update real-time graphs"""
        if len(self.test_data['timestamps']) < 2:
            return
        
        try:
            # Get recent data
            max_points = 200
            if len(self.test_data['timestamps']) > max_points:
                start_idx = len(self.test_data['timestamps']) - max_points
                times = [(t - self.test_data['timestamps'][start_idx]) / 60 for t in list(self.test_data['timestamps'])[start_idx:]]
                cpu_temps = list(self.test_data['cpu_temps'])[start_idx:]
                gpu_temps = list(self.test_data['gpu_temps'])[start_idx:]
                cpu_usage = list(self.test_data['cpu_usage'])[start_idx:]
                gpu_usage = list(self.test_data['gpu_usage'])[start_idx:]
                ram_usage = list(self.test_data['ram_usage'])[start_idx:]
            else:
                times = [(t - self.test_data['timestamps'][0]) / 60 for t in self.test_data['timestamps']]
                cpu_temps = list(self.test_data['cpu_temps'])
                gpu_temps = list(self.test_data['gpu_temps'])
                cpu_usage = list(self.test_data['cpu_usage'])
                gpu_usage = list(self.test_data['gpu_usage'])
                ram_usage = list(self.test_data['ram_usage'])
            
            # Clear axes
            for ax in [self.ax1, self.ax2, self.ax3, self.ax4]:
                ax.clear()
                ax.set_facecolor('#2b2b2b')
                ax.tick_params(colors='white')
            
            # CPU graph
            if cpu_temps and cpu_usage:
                self.ax1.plot(times, cpu_temps, 'r-', label='Temperature (°C)', linewidth=3)
                self.ax1.plot(times, cpu_usage, 'cyan', label='Usage (%)', linewidth=3)
                self.ax1.axhline(y=85, color='red', linestyle='--', alpha=0.7, label='Danger Zone')
                self.ax1.set_title('CPU Temperature & Usage', color='white', fontweight='bold')
                self.ax1.set_ylabel('Temperature (°C) / Usage (%)', color='white')
                self.ax1.legend()
                self.ax1.grid(True, alpha=0.3)
            
            # GPU graph
            if gpu_temps and gpu_usage:
                if any(t > 0 for t in gpu_temps):
                    self.ax2.plot(times, gpu_temps, 'orange', label='Temperature (°C)', linewidth=3)
                if any(u > 0 for u in gpu_usage):
                    self.ax2.plot(times, gpu_usage, 'lime', label='Usage (%)', linewidth=3)
                self.ax2.axhline(y=83, color='red', linestyle='--', alpha=0.7, label='Danger Zone')
                self.ax2.set_title('GPU Temperature & Usage', color='white', fontweight='bold')
                self.ax2.set_ylabel('Temperature (°C) / Usage (%)', color='white')
                self.ax2.legend()
                self.ax2.grid(True, alpha=0.3)
            
            # RAM graph
            if ram_usage:
                self.ax3.plot(times, ram_usage, 'yellow', label='RAM Usage (%)', linewidth=3)
                self.ax3.axhline(y=90, color='red', linestyle='--', alpha=0.7, label='Danger Zone')
                self.ax3.set_title('RAM Usage', color='white', fontweight='bold')
                self.ax3.set_ylabel('Usage (%)', color='white')
                self.ax3.legend()
                self.ax3.grid(True, alpha=0.3)
            
            # Combined overview
            if cpu_usage and ram_usage:
                self.ax4.plot(times, cpu_usage, 'cyan', label='CPU %', linewidth=3)
                if any(u > 0 for u in gpu_usage):
                    self.ax4.plot(times, gpu_usage, 'lime', label='GPU %', linewidth=3)
                self.ax4.plot(times, ram_usage, 'yellow', label='RAM %', linewidth=3)
                self.ax4.set_title('System Load Overview', color='white', fontweight='bold')
                self.ax4.set_ylabel('Usage (%)', color='white')
                self.ax4.set_xlabel('Time (minutes)', color='white')
                self.ax4.legend()
                self.ax4.grid(True, alpha=0.3)
            
            self.canvas.draw_idle()
            
        except Exception as e:
            print(f"Graph update error: {e}")
    
    def emergency_stop_test(self):
        """Emergency stop all stress testing"""
        if self.testing_active:
            print("🚨 EMERGENCY STOP ACTIVATED!")
            self.stop_event.set()
            self.testing_active = False
            
            # Force kill all processes
            all_processes = self.cpu_processes + self.ram_processes + self.gpu_processes
            for process in all_processes:
                try:
                    if process.is_alive():
                        process.terminate()
                        time.sleep(0.1)
                        if process.is_alive():
                            process.kill()
                except:
                    pass
            
            self.cpu_processes.clear()
            self.ram_processes.clear()
            self.gpu_processes.clear()
            
            self.status_label.configure(text="🚨 EMERGENCY STOP - ALL PROCESSES TERMINATED")
            self.start_btn.configure(state="normal", text="🚀 UNLEASH HELL")
            self.test_data['errors'].append("Emergency stop activated by user")
            
            try:
                winsound.Beep(1000, 1000)  # Long beep
            except:
                pass
        else:
            messagebox.showinfo("No Test Running", "No stress test is currently running.")
    
    def test_completed(self):
        """Handle test completion"""
        self.testing_active = False
        self.start_btn.configure(state="normal", text="🚀 UNLEASH HELL")
        self.progress_bar.set(1.0)
        
        if self.stop_event.is_set():
            self.status_label.configure(text="🛑 Test stopped")
        else:
            self.status_label.configure(text="✅ STRESS TEST SURVIVED!")
        
        # Clean up processes
        self.cpu_processes.clear()
        self.ram_processes.clear()
        self.gpu_processes.clear()
        
        # Generate report
        self.generate_test_report()
        self.save_test_history()
        
        # Completion sound
        try:
            for i in range(3):
                winsound.Beep(800 + i*200, 200)
                time.sleep(0.1)
        except:
            pass
        
        print("✅ STRESS TEST COMPLETED - YOUR HARDWARE SURVIVED!")
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        if not self.test_data['timestamps']:
            return
        
        report = []
        report.append("=" * 80)
        report.append("🔥 REAL STRESS TEST REPORT 🔥")
        report.append("=" * 80)
        
        if self.current_test_profile:
            report.append(f"Profile: {self.profile_var.get()}")
            report.append(f"CPU Workers: {self.current_test_profile.get('cpu_workers', 'N/A')}")
            report.append(f"RAM Workers: {self.current_test_profile.get('ram_workers', 'N/A')}")
            report.append(f"CPU Intensity: {self.current_test_profile.get('cpu_intensity', 'N/A')}%")
            report.append(f"RAM Intensity: {self.current_test_profile.get('ram_intensity', 'N/A')}%")
            report.append(f"GPU Intensity: {self.current_test_profile.get('gpu_intensity', 'N/A')}%")
        
        report.append(f"Test Date: {self.test_start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Duration: {len(self.test_data['timestamps'])} seconds")
        report.append("")
        
        # System specs
        report.append("SYSTEM CONFIGURATION")
        report.append("-" * 40)
        report.append(f"CPU: {platform.processor()}")
        report.append(f"CPU Cores: {self.physical_cores} physical, {self.cpu_cores} logical")
        report.append(f"RAM: {self.total_ram} GB")
        report.append("")
        
        # Performance results
        report.append("PERFORMANCE RESULTS")
        report.append("-" * 40)
        
        if self.test_data['cpu_temps']:
            cpu_temps = list(self.test_data['cpu_temps'])
            report.append(f"CPU Temperature - Max: {max(cpu_temps):.1f}°C, Avg: {sum(cpu_temps)/len(cpu_temps):.1f}°C")
        
        if self.test_data['cpu_usage']:
            cpu_usage = list(self.test_data['cpu_usage'])
            report.append(f"CPU Usage - Max: {max(cpu_usage):.1f}%, Avg: {sum(cpu_usage)/len(cpu_usage):.1f}%")
        
        if self.test_data['ram_usage']:
            ram_usage = list(self.test_data['ram_usage'])
            report.append(f"RAM Usage - Max: {max(ram_usage):.1f}%, Avg: {sum(ram_usage)/len(ram_usage):.1f}%")
        
        if self.test_data['gpu_temps'] and any(t > 0 for t in self.test_data['gpu_temps']):
            gpu_temps = list(self.test_data['gpu_temps'])
            report.append(f"GPU Temperature - Max: {max(gpu_temps):.1f}°C, Avg: {sum(gpu_temps)/len(gpu_temps):.1f}°C")
        
        report.append("")
        
        # Stress test verdict
        report.append("STRESS TEST VERDICT")
        report.append("-" * 40)
        
        max_cpu_temp = max(self.test_data['cpu_temps']) if self.test_data['cpu_temps'] else 0
        max_cpu_usage = max(self.test_data['cpu_usage']) if self.test_data['cpu_usage'] else 0
        max_ram_usage = max(self.test_data['ram_usage']) if self.test_data['ram_usage'] else 0
        
        if max_cpu_usage > 95 and max_ram_usage > 80:
            report.append("🔥 EXCELLENT: System successfully handled MAXIMUM load!")
        elif max_cpu_usage > 85 and max_ram_usage > 60:
            report.append("✅ GOOD: System performed well under heavy stress")
        elif max_cpu_usage > 70:
            report.append("⚠️ MODERATE: System handled moderate stress")
        else:
            report.append("❌ POOR: System did not reach expected stress levels")
        
        # Errors
        report.append("")
        report.append("ERRORS AND ISSUES")
        report.append("-" * 40)
        if self.test_data['errors']:
            for i, error in enumerate(self.test_data['errors'], 1):
                report.append(f"{i}. {error}")
        else:
            report.append("No errors detected - Hardware is solid!")
        
        report.append("")
        report.append("End of Report")
        report.append("=" * 80)
        
        self.results_text.delete("1.0", "end")
        self.results_text.insert("1.0", "\n".join(report))
    
    def export_report(self):
        """Export test report"""
        if not self.test_data['timestamps']:
            messagebox.showwarning("No Data", "No test data to export!")
            return
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"real_stress_test_report_{timestamp}.txt"
            
            report_text = self.results_text.get("1.0", "end")
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(report_text)
            
            messagebox.showinfo("Export Complete", f"Report exported to {filename}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export report: {str(e)}")
    
    def save_test_history(self):
        """Save test results to history"""
        try:
            history_file = "real_stress_test_history.json"
            
            history = []
            if os.path.exists(history_file):
                try:
                    with open(history_file, 'r') as f:
                        history = json.load(f)
                except:
                    history = []
            
            test_record = {
                'timestamp': self.test_start_time.isoformat(),
                'profile': self.profile_var.get(),
                'duration': len(self.test_data['timestamps']),
                'cpu_workers': self.current_test_profile.get('cpu_workers', 0) if self.current_test_profile else 0,
                'ram_workers': self.current_test_profile.get('ram_workers', 0) if self.current_test_profile else 0,
                'errors': len(self.test_data['errors']),
                'emergency_stop': self.stop_event.is_set(),
                'max_cpu_temp': max(self.test_data['cpu_temps']) if self.test_data['cpu_temps'] else 0,
                'max_cpu_usage': max(self.test_data['cpu_usage']) if self.test_data['cpu_usage'] else 0,
                'max_ram_usage': max(self.test_data['ram_usage']) if self.test_data['ram_usage'] else 0,
                'avg_cpu_usage': sum(self.test_data['cpu_usage'])/len(self.test_data['cpu_usage']) if self.test_data['cpu_usage'] else 0
            }
            
            history.append(test_record)
            history = history[-50:]  # Keep last 50
            
            with open(history_file, 'w') as f:
                json.dump(history, f, indent=2)
                
        except Exception as e:
            print(f"History save error: {e}")
    
    def load_test_history(self):
        """Load test history"""
        # Placeholder for history loading
        pass
    
    def run(self):
        """Start the application"""
        self.root.mainloop()

if __name__ == "__main__":
    # Enable multiprocessing on Windows
    if platform.system() == 'Windows':
        multiprocessing.freeze_support()
    
    app = RealStressTester()
    app.run()