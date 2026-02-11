import tkinter as tk
from tkinter import ttk, scrolledtext
import customtkinter as ctk
import psutil
import platform
import socket
import subprocess
import json
import os
import time
from datetime import datetime, timedelta
import threading
try:
    import GPUtil
    gpu_available = True
except ImportError:
    gpu_available = False
try:
    from cpuinfo import get_cpu_info
    cpuinfo_available = True
except ImportError:
    cpuinfo_available = False

class DansSystemInfo:
    def __init__(self):
        # Set theme and color
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Create main window
        self.root = ctk.CTk()
        self.root.title("Dan's System Information v1.0")
        self.root.geometry("1200x800")
        self.root.minsize(800, 600)
        
        # Variables for real-time updates
        self.updating = False
        self.update_thread = None
        
        self.setup_ui()
        self.load_system_info()
        
    def setup_ui(self):
        # Main container with padding
        main_frame = ctk.CTkFrame(self.root)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Title
        title_label = ctk.CTkLabel(main_frame, text="🖥️ Dan's System Information", 
                                 font=ctk.CTkFont(size=24, weight="bold"))
        title_label.pack(pady=(10, 20))
        
        # Control buttons
        button_frame = ctk.CTkFrame(main_frame)
        button_frame.pack(fill="x", padx=10, pady=(0, 10))
        
        refresh_btn = ctk.CTkButton(button_frame, text="🔄 Refresh All", 
                                  command=self.refresh_all, width=120)
        refresh_btn.pack(side="left", padx=5, pady=5)
        
        self.auto_update_btn = ctk.CTkButton(button_frame, text="▶️ Start Auto-Update", 
                                           command=self.toggle_auto_update, width=150)
        self.auto_update_btn.pack(side="left", padx=5, pady=5)
        
        export_btn = ctk.CTkButton(button_frame, text="💾 Export Report", 
                                 command=self.export_report, width=120)
        export_btn.pack(side="left", padx=5, pady=5)
        
        # Status label
        self.status_label = ctk.CTkLabel(button_frame, text="Ready")
        self.status_label.pack(side="right", padx=10, pady=5)
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Create tabs
        self.create_overview_tab()
        self.create_cpu_tab()
        self.create_memory_tab()
        self.create_storage_tab()
        self.create_network_tab()
        self.create_gpu_tab()
        self.create_processes_tab()
        self.create_system_tab()
        
    def create_overview_tab(self):
        # Overview tab
        overview_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(overview_frame, text="📊 Overview")
        
        # Create scrollable frame
        scroll_frame = ctk.CTkScrollableFrame(overview_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.overview_text = ctk.CTkTextbox(scroll_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.overview_text.pack(fill="both", expand=True)
        
    def create_cpu_tab(self):
        cpu_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(cpu_frame, text="🔥 CPU")
        
        scroll_frame = ctk.CTkScrollableFrame(cpu_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.cpu_text = ctk.CTkTextbox(scroll_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.cpu_text.pack(fill="both", expand=True)
        
    def create_memory_tab(self):
        memory_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(memory_frame, text="🧠 Memory")
        
        scroll_frame = ctk.CTkScrollableFrame(memory_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.memory_text = ctk.CTkTextbox(scroll_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.memory_text.pack(fill="both", expand=True)
        
    def create_storage_tab(self):
        storage_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(storage_frame, text="💾 Storage")
        
        scroll_frame = ctk.CTkScrollableFrame(storage_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.storage_text = ctk.CTkTextbox(scroll_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.storage_text.pack(fill="both", expand=True)
        
    def create_network_tab(self):
        network_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(network_frame, text="🌐 Network")
        
        scroll_frame = ctk.CTkScrollableFrame(network_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.network_text = ctk.CTkTextbox(scroll_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.network_text.pack(fill="both", expand=True)
        
    def create_gpu_tab(self):
        gpu_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(gpu_frame, text="🎮 GPU")
        
        scroll_frame = ctk.CTkScrollableFrame(gpu_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.gpu_text = ctk.CTkTextbox(scroll_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.gpu_text.pack(fill="both", expand=True)
        
    def create_processes_tab(self):
        processes_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(processes_frame, text="⚙️ Processes")
        
        scroll_frame = ctk.CTkScrollableFrame(processes_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.processes_text = ctk.CTkTextbox(scroll_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.processes_text.pack(fill="both", expand=True)
        
    def create_system_tab(self):
        system_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(system_frame, text="🖥️ System")
        
        scroll_frame = ctk.CTkScrollableFrame(system_frame)
        scroll_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        self.system_text = ctk.CTkTextbox(scroll_frame, height=600, font=ctk.CTkFont(family="Consolas", size=12))
        self.system_text.pack(fill="both", expand=True)
    
    def bytes_to_human(self, bytes_value):
        """Convert bytes to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.2f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.2f} PB"
    
    def get_overview_info(self):
        info = []
        info.append("=" * 60)
        info.append("SYSTEM OVERVIEW")
        info.append("=" * 60)
        info.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        info.append("")
        
        # Basic system info
        uname = platform.uname()
        info.append(f"🖥️  Computer Name: {uname.node}")
        info.append(f"🏷️  System: {uname.system} {uname.release}")
        info.append(f"📐 Architecture: {uname.machine}")
        info.append(f"⚡ Processor: {uname.processor}")
        info.append("")
        
        # Boot time and uptime
        boot_time = psutil.boot_time()
        boot_datetime = datetime.fromtimestamp(boot_time)
        uptime = datetime.now() - boot_datetime
        info.append(f"🚀 Boot Time: {boot_datetime.strftime('%Y-%m-%d %H:%M:%S')}")
        info.append(f"⏰ Uptime: {str(uptime).split('.')[0]}")
        info.append("")
        
        # Quick stats
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        # Get first available disk
        disk_usage = None
        for partition in psutil.disk_partitions():
            try:
                disk_usage = psutil.disk_usage(partition.mountpoint)
                break
            except (PermissionError, FileNotFoundError):
                continue
        
        info.append("QUICK STATS")
        info.append("-" * 30)
        info.append(f"💻 CPU Usage: {cpu_percent}%")
        info.append(f"🧠 Memory Usage: {memory.percent}% ({self.bytes_to_human(memory.used)}/{self.bytes_to_human(memory.total)})")
        
        if disk_usage:
            info.append(f"💾 Disk Usage: {disk_usage.percent}% ({self.bytes_to_human(disk_usage.used)}/{self.bytes_to_human(disk_usage.total)})")
        
        info.append("")
        
        # Network interfaces summary
        network_info = psutil.net_if_addrs()
        info.append(f"🌐 Network Interfaces: {len(network_info)}")
        for interface_name, interface_addresses in network_info.items():
            for address in interface_addresses:
                if address.family == socket.AF_INET:
                    info.append(f"   {interface_name}: {address.address}")
        
        return "\n".join(info)
    
    def get_cpu_info(self):
        info = []
        info.append("=" * 60)
        info.append("CPU INFORMATION")
        info.append("=" * 60)
        
        # Basic CPU info
        if cpuinfo_available:
            try:
                cpu_info = get_cpu_info()
                info.append(f"🔥 Processor: {cpu_info.get('brand_raw', 'Unknown')}")
                info.append(f"🏗️  Architecture: {cpu_info.get('arch', 'Unknown')}")
                info.append(f"📏 Bits: {cpu_info.get('bits', 'Unknown')}")
                info.append(f"🏷️  Vendor: {cpu_info.get('vendor_id_raw', 'Unknown')}")
            except:
                info.append(f"🔥 Processor: {platform.processor()}")
        else:
            info.append(f"🔥 Processor: {platform.processor()}")
        
        info.append(f"🔢 Physical Cores: {psutil.cpu_count(logical=False)}")
        info.append(f"🧵 Logical Cores: {psutil.cpu_count(logical=True)}")
        
        # CPU frequencies
        try:
            cpu_freq = psutil.cpu_freq()
            if cpu_freq:
                info.append(f"⚡ Current Frequency: {cpu_freq.current:.2f} MHz")
                info.append(f"📈 Max Frequency: {cpu_freq.max:.2f} MHz")
                info.append(f"📉 Min Frequency: {cpu_freq.min:.2f} MHz")
        except:
            info.append("⚡ Frequency information not available")
        
        info.append("")
        
        # CPU usage per core
        cpu_percentages = psutil.cpu_percent(percpu=True, interval=1)
        info.append("CPU USAGE PER CORE")
        info.append("-" * 30)
        for i, percentage in enumerate(cpu_percentages):
            bar = "█" * int(percentage // 5) + "░" * (20 - int(percentage // 5))
            info.append(f"Core {i:2d}: {percentage:5.1f}% [{bar}]")
        
        info.append("")
        
        # CPU times
        cpu_times = psutil.cpu_times()
        info.append("CPU TIMES")
        info.append("-" * 30)
        info.append(f"👤 User: {cpu_times.user:.2f} seconds")
        info.append(f"🖥️  System: {cpu_times.system:.2f} seconds")
        info.append(f"😴 Idle: {cpu_times.idle:.2f} seconds")
        
        return "\n".join(info)
    
    def get_memory_info(self):
        info = []
        info.append("=" * 60)
        info.append("MEMORY INFORMATION")
        info.append("=" * 60)
        
        # Virtual memory
        vmem = psutil.virtual_memory()
        info.append("VIRTUAL MEMORY")
        info.append("-" * 30)
        info.append(f"📊 Total: {self.bytes_to_human(vmem.total)}")
        info.append(f"✅ Available: {self.bytes_to_human(vmem.available)}")
        info.append(f"🔴 Used: {self.bytes_to_human(vmem.used)} ({vmem.percent}%)")
        info.append(f"🟡 Free: {self.bytes_to_human(vmem.free)}")
        
        # Memory usage bar
        used_blocks = int(vmem.percent // 5)
        free_blocks = 20 - used_blocks
        bar = "█" * used_blocks + "░" * free_blocks
        info.append(f"📈 Usage: [{bar}] {vmem.percent}%")
        info.append("")
        
        # Swap memory
        swap = psutil.swap_memory()
        info.append("SWAP MEMORY")
        info.append("-" * 30)
        info.append(f"📊 Total: {self.bytes_to_human(swap.total)}")
        info.append(f"🔴 Used: {self.bytes_to_human(swap.used)} ({swap.percent}%)")
        info.append(f"🟡 Free: {self.bytes_to_human(swap.free)}")
        
        if swap.total > 0:
            swap_blocks = int(swap.percent // 5)
            swap_free_blocks = 20 - swap_blocks
            swap_bar = "█" * swap_blocks + "░" * swap_free_blocks
            info.append(f"📈 Usage: [{swap_bar}] {swap.percent}%")
        
        return "\n".join(info)
    
    def get_storage_info(self):
        info = []
        info.append("=" * 60)
        info.append("STORAGE INFORMATION")
        info.append("=" * 60)
        
        # Disk partitions
        partitions = psutil.disk_partitions()
        
        for partition in partitions:
            info.append(f"💾 Device: {partition.device}")
            info.append(f"📁 Mountpoint: {partition.mountpoint}")
            info.append(f"📂 File System: {partition.fstype}")
            
            try:
                partition_usage = psutil.disk_usage(partition.mountpoint)
                info.append(f"📊 Total Size: {self.bytes_to_human(partition_usage.total)}")
                info.append(f"🔴 Used: {self.bytes_to_human(partition_usage.used)}")
                info.append(f"🟡 Free: {self.bytes_to_human(partition_usage.free)}")
                info.append(f"📈 Percentage: {partition_usage.percent}%")
                
                # Usage bar
                used_blocks = int(partition_usage.percent // 5)
                free_blocks = 20 - used_blocks
                bar = "█" * used_blocks + "░" * free_blocks
                info.append(f"📊 Usage: [{bar}] {partition_usage.percent}%")
                
            except PermissionError:
                info.append("❌ Permission denied")
            
            info.append("")
        
        # Disk I/O statistics
        try:
            disk_io = psutil.disk_io_counters()
            if disk_io:
                info.append("DISK I/O STATISTICS")
                info.append("-" * 30)
                info.append(f"📖 Read Count: {disk_io.read_count:,}")
                info.append(f"✏️  Write Count: {disk_io.write_count:,}")
                info.append(f"📥 Bytes Read: {self.bytes_to_human(disk_io.read_bytes)}")
                info.append(f"📤 Bytes Written: {self.bytes_to_human(disk_io.write_bytes)}")
                info.append(f"⏱️  Read Time: {disk_io.read_time:,} ms")
                info.append(f"⏱️  Write Time: {disk_io.write_time:,} ms")
        except:
            info.append("Disk I/O statistics not available")
        
        return "\n".join(info)
    
    def get_network_info(self):
        info = []
        info.append("=" * 60)
        info.append("NETWORK INFORMATION")
        info.append("=" * 60)
        
        # Network interfaces
        network_interfaces = psutil.net_if_addrs()
        
        for interface_name, interface_addresses in network_interfaces.items():
            info.append(f"🌐 Interface: {interface_name}")
            info.append("-" * (len(interface_name) + 12))
            
            for address in interface_addresses:
                if address.family == socket.AF_INET:
                    info.append(f"  📍 IPv4: {address.address}")
                    if hasattr(address, 'netmask') and address.netmask:
                        info.append(f"  🎭 Netmask: {address.netmask}")
                elif address.family == socket.AF_INET6:
                    info.append(f"  📍 IPv6: {address.address}")
                # Skip MAC address check for Windows compatibility
            
            # Interface statistics
            try:
                if interface_name in psutil.net_if_stats():
                    stats = psutil.net_if_stats()[interface_name]
                    info.append(f"  📊 Speed: {stats.speed} Mbps")
                    info.append(f"  🔌 Status: {'Up' if stats.isup else 'Down'}")
            except:
                pass
            
            info.append("")
        
        # Network I/O statistics
        try:
            net_io = psutil.net_io_counters()
            if net_io:
                info.append("NETWORK I/O STATISTICS")
                info.append("-" * 30)
                info.append(f"📥 Bytes Sent: {self.bytes_to_human(net_io.bytes_sent)}")
                info.append(f"📤 Bytes Received: {self.bytes_to_human(net_io.bytes_recv)}")
                info.append(f"📦 Packets Sent: {net_io.packets_sent:,}")
                info.append(f"📦 Packets Received: {net_io.packets_recv:,}")
                info.append(f"❌ Errors In: {net_io.errin:,}")
                info.append(f"❌ Errors Out: {net_io.errout:,}")
                info.append(f"🗑️  Drops In: {net_io.dropin:,}")
                info.append(f"🗑️  Drops Out: {net_io.dropout:,}")
        except:
            info.append("Network I/O statistics not available")
        
        # Active connections
        info.append("")
        info.append("ACTIVE CONNECTIONS (Sample)")
        info.append("-" * 30)
        try:
            connections = psutil.net_connections(kind='inet')[:10]  # Limit to first 10
            for conn in connections:
                local = f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A"
                remote = f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A"
                info.append(f"🔗 {conn.type.name} {local} -> {remote} ({conn.status})")
        except (psutil.AccessDenied, OSError):
            info.append("❌ Permission denied for connection details")
        
        return "\n".join(info)
    
    def get_gpu_info(self):
        info = []
        info.append("=" * 60)
        info.append("GPU INFORMATION")
        info.append("=" * 60)
        
        if gpu_available:
            try:
                gpus = GPUtil.getGPUs()
                if gpus:
                    for i, gpu in enumerate(gpus):
                        info.append(f"🎮 GPU {i}: {gpu.name}")
                        info.append(f"🆔 ID: {gpu.id}")
                        info.append(f"🔥 Temperature: {gpu.temperature}°C")
                        info.append(f"⚡ GPU Load: {gpu.load * 100:.1f}%")
                        info.append(f"🧠 Memory Usage: {gpu.memoryUtil * 100:.1f}%")
                        info.append(f"📊 Total Memory: {gpu.memoryTotal} MB")
                        info.append(f"🔴 Used Memory: {gpu.memoryUsed} MB")
                        info.append(f"🟡 Free Memory: {gpu.memoryFree} MB")
                        
                        # GPU usage bar
                        gpu_blocks = int(gpu.load * 20)
                        gpu_free_blocks = 20 - gpu_blocks
                        gpu_bar = "█" * gpu_blocks + "░" * gpu_free_blocks
                        info.append(f"📈 Load: [{gpu_bar}] {gpu.load * 100:.1f}%")
                        
                        # Memory usage bar
                        mem_blocks = int(gpu.memoryUtil * 20)
                        mem_free_blocks = 20 - mem_blocks
                        mem_bar = "█" * mem_blocks + "░" * mem_free_blocks
                        info.append(f"🧠 Memory: [{mem_bar}] {gpu.memoryUtil * 100:.1f}%")
                        info.append("")
                else:
                    info.append("❌ No NVIDIA GPUs detected")
            except Exception as e:
                info.append(f"❌ Error accessing GPU information: {str(e)}")
        else:
            info.append("❌ GPU monitoring not available (GPUtil not installed)")
            info.append("")
            info.append("To enable GPU monitoring, install GPUtil:")
            info.append("pip install GPUtil")
        
        return "\n".join(info)
    
    def get_processes_info(self):
        info = []
        info.append("=" * 80)
        info.append("RUNNING PROCESSES (Top 20 by CPU)")
        info.append("=" * 80)
        
        # Get all processes
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'memory_info']):
            try:
                processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Sort by CPU usage
        processes.sort(key=lambda x: x['cpu_percent'] if x['cpu_percent'] else 0, reverse=True)
        
        # Header
        info.append(f"{'PID':<8} {'Name':<25} {'CPU%':<8} {'Memory%':<10} {'Memory':<12}")
        info.append("-" * 80)
        
        # Top 20 processes
        for proc in processes[:20]:
            pid = proc['pid']
            name = proc['name'][:24] if proc['name'] else 'Unknown'
            cpu_percent = f"{proc['cpu_percent']:.1f}" if proc['cpu_percent'] else "0.0"
            memory_percent = f"{proc['memory_percent']:.1f}" if proc['memory_percent'] else "0.0"
            
            memory_mb = "Unknown"
            if proc['memory_info']:
                memory_mb = f"{proc['memory_info'].rss / 1024 / 1024:.1f} MB"
            
            info.append(f"{pid:<8} {name:<25} {cpu_percent:<8} {memory_percent:<10} {memory_mb:<12}")
        
        info.append("")
        info.append(f"📊 Total Processes: {len(processes)}")
        
        return "\n".join(info)
    
    def get_system_info(self):
        info = []
        info.append("=" * 60)
        info.append("DETAILED SYSTEM INFORMATION")
        info.append("=" * 60)
        
        # Platform information
        uname = platform.uname()
        info.append("PLATFORM INFORMATION")
        info.append("-" * 30)
        info.append(f"🖥️  System: {uname.system}")
        info.append(f"🏷️  Node Name: {uname.node}")
        info.append(f"🔢 Release: {uname.release}")
        info.append(f"📐 Version: {uname.version}")
        info.append(f"🏗️  Machine: {uname.machine}")
        info.append(f"⚡ Processor: {uname.processor}")
        info.append("")
        
        # Python information
        info.append("PYTHON INFORMATION")
        info.append("-" * 30)
        info.append(f"🐍 Python Version: {platform.python_version()}")
        info.append(f"🏗️  Python Implementation: {platform.python_implementation()}")
        info.append(f"🏢 Python Compiler: {platform.python_compiler()}")
        info.append("")
        
        # Boot time and uptime
        boot_time = psutil.boot_time()
        boot_datetime = datetime.fromtimestamp(boot_time)
        uptime = datetime.now() - boot_datetime
        
        info.append("SYSTEM UPTIME")
        info.append("-" * 30)
        info.append(f"🚀 Boot Time: {boot_datetime.strftime('%Y-%m-%d %H:%M:%S')}")
        info.append(f"⏰ Current Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        info.append(f"⏱️  Total Uptime: {str(uptime).split('.')[0]}")
        info.append("")
        
        # Users
        try:
            users = psutil.users()
            info.append("LOGGED IN USERS")
            info.append("-" * 30)
            for user in users:
                login_time = datetime.fromtimestamp(user.started).strftime('%Y-%m-%d %H:%M:%S')
                info.append(f"👤 {user.name} on {user.terminal} since {login_time}")
            if not users:
                info.append("👤 No users currently logged in")
        except Exception as e:
            info.append(f"❌ Error getting user information: {str(e)}")
        
        info.append("")
        
        # Environment variables (selected)
        info.append("ENVIRONMENT VARIABLES (Selected)")
        info.append("-" * 30)
        env_vars = ['PATH', 'USERPROFILE', 'USERNAME', 'COMPUTERNAME', 'OS', 'PROCESSOR_ARCHITECTURE']
        for var in env_vars:
            value = os.environ.get(var, 'Not Set')
            if var == 'PATH':
                value = f"{len(value.split(';'))} paths defined"
            info.append(f"🔧 {var}: {value}")
        
        return "\n".join(info)
    
    def load_system_info(self):
        """Load all system information into tabs"""
        self.status_label.configure(text="Loading system information...")
        self.root.update()
        
        # Load each tab
        self.overview_text.delete("1.0", "end")
        self.overview_text.insert("1.0", self.get_overview_info())
        
        self.cpu_text.delete("1.0", "end")
        self.cpu_text.insert("1.0", self.get_cpu_info())
        
        self.memory_text.delete("1.0", "end")
        self.memory_text.insert("1.0", self.get_memory_info())
        
        self.storage_text.delete("1.0", "end")
        self.storage_text.insert("1.0", self.get_storage_info())
        
        self.network_text.delete("1.0", "end")
        self.network_text.insert("1.0", self.get_network_info())
        
        self.gpu_text.delete("1.0", "end")
        self.gpu_text.insert("1.0", self.get_gpu_info())
        
        self.processes_text.delete("1.0", "end")
        self.processes_text.insert("1.0", self.get_processes_info())
        
        self.system_text.delete("1.0", "end")
        self.system_text.insert("1.0", self.get_system_info())
        
        self.status_label.configure(text="Ready")
    
    def refresh_all(self):
        """Refresh all information"""
        self.load_system_info()
    
    def toggle_auto_update(self):
        """Toggle auto-update mode"""
        if not self.updating:
            self.updating = True
            self.auto_update_btn.configure(text="⏸️ Stop Auto-Update")
            self.start_auto_update()
        else:
            self.updating = False
            self.auto_update_btn.configure(text="▶️ Start Auto-Update")
    
    def start_auto_update(self):
        """Start auto-update in a separate thread"""
        def update_loop():
            while self.updating:
                time.sleep(5)  # Update every 5 seconds
                if self.updating:
                    self.root.after(0, self.load_system_info)
        
        self.update_thread = threading.Thread(target=update_loop, daemon=True)
        self.update_thread.start()
    
    def export_report(self):
        """Export all information to a text file"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"dans_system_report_{timestamp}.txt"
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("DANS SYSTEM INFORMATION REPORT\n")
                f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 80 + "\n\n")
                
                f.write(self.get_overview_info() + "\n\n")
                f.write(self.get_cpu_info() + "\n\n")
                f.write(self.get_memory_info() + "\n\n")
                f.write(self.get_storage_info() + "\n\n")
                f.write(self.get_network_info() + "\n\n")
                f.write(self.get_gpu_info() + "\n\n")
                f.write(self.get_processes_info() + "\n\n")
                f.write(self.get_system_info() + "\n\n")
            
            self.status_label.configure(text=f"Report exported: {filename}")
        except Exception as e:
            self.status_label.configure(text=f"Export failed: {str(e)}")
    
    def run(self):
        """Start the application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = DansSystemInfo()
    app.run()