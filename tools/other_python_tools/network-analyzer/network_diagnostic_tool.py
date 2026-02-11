"""
Dan's Network Diagnostic & Speed Tester v1.0
Complete network analysis and optimization tool
Author: Dan
Features: Speed tests, WiFi analysis, DNS benchmarks, router info, and MORE!
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import customtkinter as ctk
import threading
import time
import json
import os
import subprocess
import platform
import socket
import struct
import requests
import speedtest
import psutil
import ping3
from datetime import datetime, timedelta
import time
import sys
import traceback
import ctypes
import xml.etree.ElementTree as ET
from urllib.parse import urlparse


def _ensure_admin_and_imports():
    """Ensure we run elevated on Windows (offer relaunch) and import heavy deps (numpy/matplotlib).
    If matplotlib/numpy are corrupted, offer to reinstall them via pip and exit.
    Returns (plt, FigureCanvasTkAgg, np) on success or exits the process with an error dialog.
    """
    # Relaunch as admin on Windows if needed
    if platform.system() == 'Windows':
        try:
            is_admin = bool(ctypes.windll.shell32.IsUserAnAdmin())
        except Exception:
            is_admin = False
        if not is_admin:
            try:
                if messagebox.askyesno('Elevation required', 'This app needs administrator rights for some checks and tweaks. Relaunch as admin?'):
                    params = ' '.join([f'"{a}"' for a in sys.argv])
                    ctypes.windll.shell32.ShellExecuteW(None, 'runas', sys.executable, params, None, 1)
                    sys.exit(0)
            except Exception:
                # fall through and try imports without elevation
                pass

    # Try to import matplotlib and numpy, handle corrupted installs with a helpful prompt
    try:
        import matplotlib.pyplot as plt
        from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
        import numpy as np
        return plt, FigureCanvasTkAgg, np
    except Exception as e:
        tb = traceback.format_exc()
        msg = (
            "Required packages (numpy/matplotlib) failed to import or are corrupted.\n\n"
            f"Error: {e}\n\nTraceback:\n{tb}\n\n"
            "Recommended fix:\npython -m pip install --upgrade --force-reinstall numpy matplotlib\n\n"
            "Attempt automatic reinstall now?"
        )
        try:
            if messagebox.askyesno('Dependency error', msg):
                try:
                    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--upgrade', '--force-reinstall', 'numpy', 'matplotlib'])
                    messagebox.showinfo('Reinstall attempted', 'Reinstall completed (or attempted). Please restart the app.')
                except Exception as e2:
                    messagebox.showerror('Reinstall failed', f'Reinstall failed: {e2}\nPlease run the recommended command manually.')
            else:
                messagebox.showerror('Cannot continue', 'Please reinstall numpy and matplotlib and restart the application.')
        except Exception:
            # If showing message boxes fails (no GUI), print to stderr
            print(msg, file=sys.stderr)
        sys.exit(1)


# Perform admin check and guarded imports before continuing
plt, FigureCanvasTkAgg, np = _ensure_admin_and_imports()
import csv
from collections import deque, defaultdict, Counter
import re
import ipaddress
import dns.resolver
import dns.query
import dns.rdatatype
from scapy.all import *
from scapy.layers.dot11 import Dot11, Dot11Beacon, Dot11Elt
import winreg
import ctypes
from ctypes import wintypes
import win32api
import win32con
import win32service
import win32serviceutil
import wmi

# Suppress scapy warnings
import logging
logging.getLogger("scapy.runtime").setLevel(logging.ERROR)

class NetworkDiagnosticTool:
    def __init__(self):
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        self.root = ctk.CTk()
        self.root.title("Dan's Network Diagnostic & Speed Tester v1.0")
        self.root.geometry("1600x1000")
        self.root.minsize(1400, 900)
        
        # Data storage
        self.speed_history = deque(maxlen=1000)
        self.ping_history = defaultdict(lambda: deque(maxlen=500))
        self.bandwidth_data = defaultdict(lambda: deque(maxlen=200))
        self.wifi_networks = []
        self.network_adapters = []
        self.dns_results = {}
        
        # Monitoring state
        self.monitoring_active = False
        self.speed_test_running = False
        self.ping_monitoring = False
        self.wifi_scanning = False
        
        # Network info
        self.current_network = {}
        self.router_info = {}
        self.connection_quality = {}
        
        # Setup UI and start detection
        self.setup_ui()
        self.detect_network_info()
        self.update_ui_loop()
     
        # REAL Bandwidth Data Storage
        self.pid_traffic = defaultdict(lambda: {'down': 0, 'up': 0})
        self.port_pid_map = {} # Cache to map Ports -> PIDs
        self.last_map_update = 0
        
        # Advanced Network Analysis Data (Professor Requirements)
        self.protocol_stats = defaultdict(int)
        self.dns_queries = Counter()
        self.detected_devices = []
        self.security_alerts = deque(maxlen=50)  # Store last 50 alerts
        self.syn_tracker = defaultdict(set)  # For Port Scan detection {IP: {ports}}
        self.packet_times = deque(maxlen=1000)  # For Jitter calc
        self.network_profiles = {}  # For multi-network comparison
        self.last_packet_time = time.time()  # Initialize for QoS
        
        # starting sniffer immediately in background
        self.sniff_thread = threading.Thread(target=self._start_background_sniffer, daemon=True)
        self.sniff_thread.start()
        
    def setup_ui(self):
        """Create the complete UI"""
        # main container
        main_frame = ctk.CTkFrame(self.root)
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # title
        title_frame = ctk.CTkFrame(main_frame)
        title_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        title_label = ctk.CTkLabel(title_frame, text="Dan's Network Diagnostic & Speed Tester", 
                                 font=ctk.CTkFont(size=24, weight="bold"))
        title_label.pack(pady=10)
        
        # Control panel
        control_frame = ctk.CTkFrame(main_frame)
        control_frame.pack(fill="x", padx=10, pady=5)
        
        # speed test controls
        speed_frame = ctk.CTkFrame(control_frame)
        speed_frame.pack(side="left", padx=10, pady=10)
        

        ctk.CTkLabel(speed_frame, text="Speed Testing", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)

        self.speed_test_btn = ctk.CTkButton(speed_frame, text="Run Speed Test",
                                            command=self.run_speed_test, width=150, height=40)
        self.speed_test_btn.pack(pady=5)

        self.continuous_btn = ctk.CTkButton(speed_frame, text="Start Monitoring",
                                           command=self.toggle_monitoring, width=150, height=40)
        self.continuous_btn.pack(pady=5)

        # detailed multi-run speed test (3 runs) - logs server details and full results to UI log
        self.detailed_speed_btn = ctk.CTkButton(speed_frame, text="Run Detailed Speed Test",
                                               command=self.run_detailed_speed_test, width=200, height=40)
        self.detailed_speed_btn.pack(pady=5)

        # network analysis controls
        analysis_frame = ctk.CTkFrame(control_frame)
        analysis_frame.pack(side="left", padx=10, pady=10)

        ctk.CTkLabel(analysis_frame, text="Network Analysis", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)

        self.wifi_scan_btn = ctk.CTkButton(analysis_frame, text="Scan WiFi",
                                         command=self.scan_wifi_networks, width=150, height=40)
        self.wifi_scan_btn.pack(pady=5)

        self.dns_test_btn = ctk.CTkButton(analysis_frame, text="DNS Benchmark",
                                        command=self.benchmark_dns, width=150, height=40)
        self.dns_test_btn.pack(pady=5)

        # optimization controls
        optimize_frame = ctk.CTkFrame(control_frame)
        optimize_frame.pack(side="right", padx=10, pady=10)

        ctk.CTkLabel(optimize_frame, text="Optimization", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)

        self.optimize_btn = ctk.CTkButton(optimize_frame, text="Optimize Network",
                                        command=self.optimize_network, width=150, height=40)
        self.optimize_btn.pack(pady=5)

        self.export_btn = ctk.CTkButton(optimize_frame, text="Export Report",
                                      command=self.export_report, width=150, height=40)
        self.export_btn.pack(pady=5)

        # status bar
        status_frame = ctk.CTkFrame(main_frame)
        status_frame.pack(fill="x", padx=10, pady=5)

        self.status_label = ctk.CTkLabel(status_frame, text="Ready for network analysis",
                                       font=ctk.CTkFont(size=14))
        self.status_label.pack(side="left", padx=10, pady=5)

        self.connection_status = ctk.CTkLabel(status_frame, text="Detecting network...",
                                            font=ctk.CTkFont(size=14))
        self.connection_status.pack(side="right", padx=10, pady=5)

        # create notebook for tabs
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=10)

        self.create_overview_tab()
        self.create_speed_test_tab()
        self.create_wifi_analysis_tab()
        self.create_dns_benchmark_tab()
        self.create_bandwidth_monitor_tab()
        self.create_protocol_tab()
        self.create_troubleshooting_tab()
        self.ip_address_label.pack(anchor="w", padx=10, pady=2)

        # details frame for overview tab (network info columns)
        details_frame = ctk.CTkFrame(main_frame)
        details_frame.pack(fill="x", padx=10, pady=5)

        # left column - network info
        left_frame = ctk.CTkFrame(details_frame)
        left_frame.pack(side="left", fill="both", expand=True, padx=5)

        self.gateway_label = ctk.CTkLabel(left_frame, text="Gateway: Detecting...", 
                                        font=ctk.CTkFont(size=14))
        self.gateway_label.pack(anchor="w", padx=10, pady=2)

        # right column - more advanced info
        right_frame = ctk.CTkFrame(details_frame)
        right_frame.pack(side="right", fill="both", expand=True, padx=5)

        self.signal_strength_label = ctk.CTkLabel(right_frame, text="Signal: Detecting...", 
                                                font=ctk.CTkFont(size=14))
        self.signal_strength_label.pack(anchor="w", padx=10, pady=5)

        self.channel_label = ctk.CTkLabel(right_frame, text="Channel: Detecting...", 
                                        font=ctk.CTkFont(size=14))
        self.channel_label.pack(anchor="w", padx=10, pady=2)

        self.frequency_label = ctk.CTkLabel(right_frame, text="Frequency: Detecting...", 
                                          font=ctk.CTkFont(size=14))
        self.frequency_label.pack(anchor="w", padx=10, pady=2)

        self.security_label = ctk.CTkLabel(right_frame, text="Security: Detecting...", 
                                         font=ctk.CTkFont(size=14))
        self.security_label.pack(anchor="w", padx=10, pady=2)

        self.dns_servers_label = ctk.CTkLabel(right_frame, text="DNS: Detecting...", 
                                            font=ctk.CTkFont(size=14))
        self.dns_servers_label.pack(anchor="w", padx=10, pady=2)

        # network adapters list
        adapters_frame = ctk.CTkFrame(main_frame)
        adapters_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        ctk.CTkLabel(adapters_frame, text="🔌 Network Adapters", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        # Create scrollable frame for adapters
        self.adapters_scroll = ctk.CTkScrollableFrame(adapters_frame, height=200)
        self.adapters_scroll.pack(fill="both", expand=True, padx=10, pady=10)
        
    def create_speed_test_tab(self):
        """Speed test results and history"""
        speed_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(speed_frame, text="Speed Tests")
        
        # Current speed display
        current_frame = ctk.CTkFrame(speed_frame)
        current_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(current_frame, text="Latest Speed Test Results", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        # Speed gauges
        gauges_frame = ctk.CTkFrame(current_frame)
        gauges_frame.pack(fill="x", padx=10, pady=10)
        
        # Download speed
        download_frame = ctk.CTkFrame(gauges_frame)
        download_frame.pack(side="left", fill="both", expand=True, padx=5)
        
        ctk.CTkLabel(download_frame, text="⬇️ Download", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)
        self.download_speed_label = ctk.CTkLabel(download_frame, text="-- Mbps", 
                                               font=ctk.CTkFont(size=24, weight="bold"))
        self.download_speed_label.pack(pady=5)
        
        # Upload speed
        upload_frame = ctk.CTkFrame(gauges_frame)
        upload_frame.pack(side="left", fill="both", expand=True, padx=5)
        
        ctk.CTkLabel(upload_frame, text="⬆️ Upload", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)
        self.upload_speed_label = ctk.CTkLabel(upload_frame, text="-- Mbps", 
                                             font=ctk.CTkFont(size=24, weight="bold"))
        self.upload_speed_label.pack(pady=5)
        
        # Ping
        ping_frame = ctk.CTkFrame(gauges_frame)
        ping_frame.pack(side="left", fill="both", expand=True, padx=5)
        
        ctk.CTkLabel(ping_frame, text="Ping", font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)
        self.ping_label = ctk.CTkLabel(ping_frame, text="-- ms", 
                                     font=ctk.CTkFont(size=24, weight="bold"))
        self.ping_label.pack(pady=5)
        
        # Speed test progress
        progress_frame = ctk.CTkFrame(current_frame)
        progress_frame.pack(fill="x", padx=10, pady=10)
        
        self.speed_progress = ctk.CTkProgressBar(progress_frame, width=400)
        self.speed_progress.pack(pady=10)
        self.speed_progress.set(0)
        
        self.speed_status = ctk.CTkLabel(progress_frame, text="Ready to test", 
                                       font=ctk.CTkFont(size=14))
        self.speed_status.pack(pady=5)
        
        # Speed history graph
        history_frame = ctk.CTkFrame(speed_frame)
        history_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        ctk.CTkLabel(history_frame, text="Speed Test History", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        # Create matplotlib figure for speed history
        self.speed_fig, self.speed_ax = plt.subplots(figsize=(12, 6))
        self.speed_fig.patch.set_facecolor('#2b2b2b')
        self.speed_ax.set_facecolor('#2b2b2b')
        self.speed_ax.tick_params(colors='white')
        self.speed_ax.set_title('Speed Test History', color='white', fontsize=14, weight='bold')
        self.speed_ax.set_ylabel('Speed (Mbps)', color='white')
        self.speed_ax.set_xlabel('Time', color='white')
        
        self.speed_canvas = FigureCanvasTkAgg(self.speed_fig, history_frame)
        self.speed_canvas.draw()
        self.speed_canvas.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)

    def create_overview_tab(self):
        """Minimal Overview tab so UI initializes cleanly. Populates a placeholder IP label used elsewhere."""
        overview_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(overview_frame, text="📄 Overview")

        # Basic network summary area (minimal so rest of UI can reference labels)
        info_frame = ctk.CTkFrame(overview_frame)
        info_frame.pack(fill="x", padx=10, pady=10)

        self.ip_address_label = ctk.CTkLabel(info_frame, text="IP: Detecting...", 
                                             font=ctk.CTkFont(size=14))
        self.ip_address_label.pack(anchor="w", padx=10, pady=2)

        
    def create_wifi_analysis_tab(self):
        """WiFi network analysis and scanner"""
        wifi_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(wifi_frame, text="WiFi Analysis")
        
        # WiFi scanner controls
        scanner_frame = ctk.CTkFrame(wifi_frame)
        scanner_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(scanner_frame, text="WiFi Network Scanner", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        scanner_controls = ctk.CTkFrame(scanner_frame)
        scanner_controls.pack(fill="x", padx=10, pady=5)
        
        self.scan_status = ctk.CTkLabel(scanner_controls, text="Ready to scan", 
                                      font=ctk.CTkFont(size=14))
        self.scan_status.pack(side="left", padx=10, pady=5)
        
        self.refresh_scan_btn = ctk.CTkButton(scanner_controls, text="🔄 Refresh Scan", 
                                            command=self.scan_wifi_networks, width=120)
        self.refresh_scan_btn.pack(side="right", padx=10, pady=5)
        
        # WiFi networks table
        networks_frame = ctk.CTkFrame(wifi_frame)
        networks_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Create treeview for WiFi networks
        columns = ("SSID", "BSSID", "Signal", "Channel", "Frequency", "Security", "Vendor")
        self.wifi_tree = ttk.Treeview(networks_frame, columns=columns, show="headings", height=15)
        
        # Configure columns
        for col in columns:
            self.wifi_tree.heading(col, text=col)
            self.wifi_tree.column(col, width=120, anchor="center")
        
        # Scrollbar for treeview
        wifi_scrollbar = ttk.Scrollbar(networks_frame, orient="vertical", command=self.wifi_tree.yview)
        self.wifi_tree.configure(yscrollcommand=wifi_scrollbar.set)
        
        self.wifi_tree.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        wifi_scrollbar.pack(side="right", fill="y", pady=10)
        
        # WiFi signal strength visualization
        signal_frame = ctk.CTkFrame(wifi_frame)
        signal_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(signal_frame, text="📶 Signal Strength Map", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        # Create matplotlib figure for signal strength
        self.wifi_fig, self.wifi_ax = plt.subplots(figsize=(12, 4))
        self.wifi_fig.patch.set_facecolor('#2b2b2b')
        self.wifi_ax.set_facecolor('#2b2b2b')
        self.wifi_ax.tick_params(colors='white')
        self.wifi_ax.set_title('WiFi Signal Strength by Channel', color='white', fontsize=14, weight='bold')
        self.wifi_ax.set_ylabel('Signal Strength (dBm)', color='white')
        self.wifi_ax.set_xlabel('Channel', color='white')
        
        self.wifi_canvas = FigureCanvasTkAgg(self.wifi_fig, signal_frame)
        self.wifi_canvas.draw()
        self.wifi_canvas.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
        
    def create_dns_benchmark_tab(self):
        """DNS server benchmarking"""
        dns_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(dns_frame, text="DNS Benchmark")
        
        # DNS benchmark controls
        benchmark_frame = ctk.CTkFrame(dns_frame)
        benchmark_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(benchmark_frame, text="DNS Server Benchmark", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        benchmark_controls = ctk.CTkFrame(benchmark_frame)
        benchmark_controls.pack(fill="x", padx=10, pady=5)
        
        self.dns_status = ctk.CTkLabel(benchmark_controls, text="Ready to benchmark DNS servers", 
                                     font=ctk.CTkFont(size=14))
        self.dns_status.pack(side="left", padx=10, pady=5)
        
        self.start_dns_btn = ctk.CTkButton(benchmark_controls, text="Start Benchmark", 
                                         command=self.benchmark_dns, width=140)
        self.start_dns_btn.pack(side="right", padx=10, pady=5)
        
        # DNS results table
        results_frame = ctk.CTkFrame(dns_frame)
        results_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Create treeview for DNS results
        dns_columns = ("DNS Server", "Provider", "Avg Response (ms)", "Success Rate", "Status")
        self.dns_tree = ttk.Treeview(results_frame, columns=dns_columns, show="headings", height=15)
        
        # Configure columns
        for col in dns_columns:
            self.dns_tree.heading(col, text=col)
            self.dns_tree.column(col, width=150, anchor="center")
        
        # Scrollbar for DNS treeview
        dns_scrollbar = ttk.Scrollbar(results_frame, orient="vertical", command=self.dns_tree.yview)
        self.dns_tree.configure(yscrollcommand=dns_scrollbar.set)
        
        self.dns_tree.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        dns_scrollbar.pack(side="right", fill="y", pady=10)
        
        # DNS response time graph
        dns_graph_frame = ctk.CTkFrame(dns_frame)
        dns_graph_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(dns_graph_frame, text="📊 DNS Response Times", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        # Create matplotlib figure for DNS performance
        self.dns_fig, self.dns_ax = plt.subplots(figsize=(12, 4))
        self.dns_fig.patch.set_facecolor('#2b2b2b')
        self.dns_ax.set_facecolor('#2b2b2b')
        self.dns_ax.tick_params(colors='white')
        self.dns_ax.set_title('DNS Server Response Times', color='white', fontsize=14, weight='bold')
        self.dns_ax.set_ylabel('Response Time (ms)', color='white')
        self.dns_ax.set_xlabel('DNS Server', color='white')
        
        self.dns_canvas = FigureCanvasTkAgg(self.dns_fig, dns_graph_frame)
        self.dns_canvas.draw()
        self.dns_canvas.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
        
    def create_bandwidth_monitor_tab(self):
        """Real-time bandwidth monitoring per application"""
        bandwidth_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(bandwidth_frame, text="Bandwidth Monitor")
        
        # Monitoring controls
        monitor_frame = ctk.CTkFrame(bandwidth_frame)
        monitor_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(monitor_frame, text="Real-time Bandwidth Monitor", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        monitor_controls = ctk.CTkFrame(monitor_frame)
        monitor_controls.pack(fill="x", padx=10, pady=5)
        
        self.bandwidth_status = ctk.CTkLabel(monitor_controls, text="Monitoring stopped", 
                                           font=ctk.CTkFont(size=14))
        self.bandwidth_status.pack(side="left", padx=10, pady=5)
        
        self.toggle_bandwidth_btn = ctk.CTkButton(monitor_controls, text="Start Monitoring", 
                                                command=self.toggle_bandwidth_monitoring, width=140)
        self.toggle_bandwidth_btn.pack(side="right", padx=10, pady=5)
        
        # Current usage display
        usage_frame = ctk.CTkFrame(bandwidth_frame)
        usage_frame.pack(fill="x", padx=10, pady=10)
        
        # Total usage
        total_frame = ctk.CTkFrame(usage_frame)
        total_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(total_frame, text="Total Network Usage", 
                    font=ctk.CTkFont(size=16, weight="bold")).pack(pady=5)
        
        usage_stats = ctk.CTkFrame(total_frame)
        usage_stats.pack(fill="x", padx=10, pady=5)
        
        self.total_download_label = ctk.CTkLabel(usage_stats, text="Download: 0.0 KB/s", 
                                               font=ctk.CTkFont(size=14))
        self.total_download_label.pack(side="left", padx=20, pady=5)
        
        self.total_upload_label = ctk.CTkLabel(usage_stats, text="Upload: 0.0 KB/s", 
                                             font=ctk.CTkFont(size=14))
        self.total_upload_label.pack(side="right", padx=20, pady=5)
        
        # Per-application usage table
        apps_frame = ctk.CTkFrame(bandwidth_frame)
        apps_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        ctk.CTkLabel(apps_frame, text="Per-Application Usage", 
                    font=ctk.CTkFont(size=16, weight="bold")).pack(pady=10)
        
        # Create treeview for application bandwidth
        app_columns = ("Application", "PID", "Download (KB/s)", "Upload (KB/s)", "Total (MB)")
        self.bandwidth_tree = ttk.Treeview(apps_frame, columns=app_columns, show="headings", height=12)
        
        # Configure columns
        for col in app_columns:
            self.bandwidth_tree.heading(col, text=col)
            self.bandwidth_tree.column(col, width=120, anchor="center")
        
        # Scrollbar for bandwidth treeview
        bandwidth_scrollbar = ttk.Scrollbar(apps_frame, orient="vertical", command=self.bandwidth_tree.yview)
        self.bandwidth_tree.configure(yscrollcommand=bandwidth_scrollbar.set)
        
        self.bandwidth_tree.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        bandwidth_scrollbar.pack(side="right", fill="y", pady=10)
        
        # Real-time bandwidth graph
        bandwidth_graph_frame = ctk.CTkFrame(bandwidth_frame)
        bandwidth_graph_frame.pack(fill="x", padx=10, pady=10)
        
        # Create matplotlib figure for bandwidth
        self.bandwidth_fig, self.bandwidth_ax = plt.subplots(figsize=(12, 4))
        self.bandwidth_fig.patch.set_facecolor('#2b2b2b')
        self.bandwidth_ax.set_facecolor('#2b2b2b')
        self.bandwidth_ax.tick_params(colors='white')
        self.bandwidth_ax.set_title('Real-time Bandwidth Usage', color='white', fontsize=14, weight='bold')
        self.bandwidth_ax.set_ylabel('Speed (KB/s)', color='white')
        self.bandwidth_ax.set_xlabel('Time', color='white')
        
        self.bandwidth_canvas = FigureCanvasTkAgg(self.bandwidth_fig, bandwidth_graph_frame)
        self.bandwidth_canvas.draw()
        self.bandwidth_canvas.get_tk_widget().pack(fill="both", expand=True, padx=10, pady=10)
    
    def create_protocol_tab(self):
        """
        Creates the 'Protocol Distribution' tab for Deep Packet Inspection (DPI) visualization.
        Professor Requirement #1: Protocol Distribution Analysis
        """
        protocol_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(protocol_frame, text="📊 Protocols (DPI)")
        
        # --- Top Section: Stats & Controls ---
        stats_panel = ctk.CTkFrame(protocol_frame)
        stats_panel.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(stats_panel, text="Deep Packet Inspection (DPI)", 
                     font=ctk.CTkFont(size=18, weight="bold")).pack(side="left", padx=10)
        
        self.packet_count_label = ctk.CTkLabel(stats_panel, text="Total Packets: 0", 
                                             font=ctk.CTkFont(size=14))
        self.packet_count_label.pack(side="right", padx=10)
        
        # Advanced Analysis Buttons
        button_frame = ctk.CTkFrame(protocol_frame)
        button_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkButton(button_frame, text="🗺️ Scan Network Topology", 
                     command=self.run_topology_scan, width=180).pack(side="left", padx=5)
        
        ctk.CTkButton(button_frame, text="📤 Export NetFlow Data", 
                     command=self.export_netflow_data, width=180).pack(side="left", padx=5)
        
        ctk.CTkButton(button_frame, text="📈 Predict Congestion", 
                     command=lambda: messagebox.showinfo("ML Prediction", self.predict_network_congestion()), 
                     width=180).pack(side="left", padx=5)
        
        ctk.CTkButton(button_frame, text="💾 Save Network Profile", 
                     command=self.save_network_profile, width=180).pack(side="left", padx=5)
        
        # --- Middle Section: The Chart ---
        chart_frame = ctk.CTkFrame(protocol_frame)
        chart_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Create the Figure and Axes
        self.protocol_fig, self.protocol_ax = plt.subplots(figsize=(6, 5))
        self.protocol_fig.patch.set_facecolor('#2b2b2b')  # Match dark theme
        
        # Initial empty chart
        self.protocol_ax.set_facecolor('#2b2b2b')
        self.protocol_ax.text(0.5, 0.5, "Waiting for traffic...\\n\\nPacket capture is running.", 
                             color='white', ha='center', va='center', fontsize=14)
        self.protocol_ax.axis('off')
        
        # Embed into Tkinter
        self.protocol_canvas = FigureCanvasTkAgg(self.protocol_fig, chart_frame)
        self.protocol_canvas.get_tk_widget().pack(fill="both", expand=True)
        
        # --- Bottom Section: Detailed Text Stats ---
        details_frame = ctk.CTkScrollableFrame(protocol_frame, height=150)
        details_frame.pack(fill="x", padx=10, pady=10)
        
        self.protocol_details_label = ctk.CTkLabel(details_frame, 
                                                 text="Protocol Details:\\nInitializing packet capture...", 
                                                 justify="left", 
                                                 font=ctk.CTkFont(family="Consolas", size=12))
        self.protocol_details_label.pack(anchor="w", padx=10, pady=5)
        
        # Security Alerts Section
        alerts_label = ctk.CTkLabel(details_frame, text="\\n🔒 Security Alerts:", 
                                   justify="left", font=ctk.CTkFont(size=14, weight="bold"))
        alerts_label.pack(anchor="w", padx=10, pady=5)
        
        self.security_alerts_label = ctk.CTkLabel(details_frame, text="No alerts detected", 
                                                 justify="left", 
                                                 font=ctk.CTkFont(family="Consolas", size=11))
        self.security_alerts_label.pack(anchor="w", padx=10, pady=2)
        
        # Start the update loop for this specific tab
        self.update_protocol_chart()
    
    def update_protocol_chart(self):
        """
        Refreshes the Pie Chart with data from the sniffer.
        Real-time Protocol Distribution Visualization
        """
        try:
            # 1. Get snapshot of current data
            if not hasattr(self, 'protocol_stats') or sum(self.protocol_stats.values()) == 0:
                # If no data yet, schedule next check and return
                self.root.after(1000, self.update_protocol_chart)
                return
            
            labels = []
            sizes = []
            
            # Filter out zero values to keep chart clean
            for proto, count in self.protocol_stats.items():
                if count > 0:
                    labels.append(proto)
                    sizes.append(count)
            
            # 2. Clear and Redraw
            self.protocol_ax.clear()
            
            # Custom colors for common protocols
            colors = {
                'TCP': '#3498db',   # Blue
                'UDP': '#e67e22',   # Orange
                'ICMP': '#e74c3c',  # Red
                'DNS': '#2ecc71',   # Green
                'HTTPS': '#9b59b6', # Purple
                'HTTP': '#f1c40f',  # Yellow
                'QUIC': '#1abc9c'   # Teal
            }
            
            # Map colors to labels, default to gray if unknown
            chart_colors = [colors.get(l, '#95a5a6') for l in labels]
            
            # Draw Pie Chart
            wedges, texts, autotexts = self.protocol_ax.pie(
                sizes, 
                labels=labels, 
                autopct='%1.1f%%',
                startangle=90,
                colors=chart_colors,
                textprops=dict(color="white")  # White text for dark mode
            )
            
            # Style the percentage text
            plt.setp(autotexts, size=10, weight="bold")
            plt.setp(texts, size=11)
            
            self.protocol_ax.set_title("Real-time Protocol Distribution", color='white', pad=20)
            
            # 3. Refresh Canvas
            self.protocol_canvas.draw()
            
            # 4. Update Text Stats at bottom
            total_packets = sum(sizes)
            self.packet_count_label.configure(text=f"Total Packets: {total_packets:,}")
            
            stats_text = "Protocol Breakdown:\\n" + "-"*40 + "\\n"
            sorted_stats = sorted(self.protocol_stats.items(), key=lambda x: x[1], reverse=True)
            for proto, count in sorted_stats:
                if count > 0:
                    pct = (count / total_packets) * 100
                    stats_text += f"{proto:<10}: {count:>8,} packets ({pct:>5.1f}%)\\n"
            
            # Add DNS stats
            if self.dns_queries:
                stats_text += "\\n" + "="*40 + "\\n"
                stats_text += f"Top DNS Queries ({len(self.dns_queries)} unique domains):\\n"
                for domain, count in self.dns_queries.most_common(5):
                    stats_text += f"  • {domain[:35]}: {count}\\n"
            
            # Add QoS stats (Jitter)
            if len(self.packet_times) > 1:
                jitter = np.std(list(self.packet_times)) * 1000  # Convert to ms
                avg_interval = np.mean(list(self.packet_times)) * 1000
                stats_text += "\\n" + "="*40 + "\\n"
                stats_text += f"QoS Metrics:\\n"
                stats_text += f"  • Avg Inter-arrival: {avg_interval:.2f} ms\\n"
                stats_text += f"  • Jitter (StdDev): {jitter:.2f} ms\\n"
            
            self.protocol_details_label.configure(text=stats_text)
            
            # Update security alerts
            if self.security_alerts:
                alerts_text = "\\n".join(list(self.security_alerts)[-5:])  # Last 5 alerts
            else:
                alerts_text = "✅ No security threats detected"
            self.security_alerts_label.configure(text=alerts_text)
            
        except Exception as e:
            print(f"Chart update error: {e}")
        
        # Schedule next update (every 2 seconds)
        self.root.after(2000, self.update_protocol_chart)
        
    def create_troubleshooting_tab(self):
        """Network troubleshooting and optimization"""
        trouble_frame = ctk.CTkFrame(self.notebook)
        self.notebook.add(trouble_frame, text="🔧 Troubleshooting")
        
        # Troubleshooting wizard
        wizard_frame = ctk.CTkFrame(trouble_frame)
        wizard_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(wizard_frame, text="🔧 Network Troubleshooting Wizard", 
                    font=ctk.CTkFont(size=18, weight="bold")).pack(pady=10)
        
        # Quick tests
        tests_frame = ctk.CTkFrame(wizard_frame)
        tests_frame.pack(fill="x", padx=10, pady=10)
        
        # Test buttons
        test_buttons = ctk.CTkFrame(tests_frame)
        test_buttons.pack(fill="x", padx=10, pady=5)
        
        self.ping_test_btn = ctk.CTkButton(test_buttons, text="Ping Test", 
                                         command=self.run_ping_test, width=120)
        self.ping_test_btn.pack(side="left", padx=5, pady=5)
        
        self.traceroute_btn = ctk.CTkButton(test_buttons, text="Traceroute", 
                                          command=self.run_traceroute, width=120)
        self.traceroute_btn.pack(side="left", padx=5, pady=5)
        
        self.flush_dns_btn = ctk.CTkButton(test_buttons, text="Flush DNS", 
                                         command=self.flush_dns, width=120)
        self.flush_dns_btn.pack(side="left", padx=5, pady=5)
        
        self.reset_network_btn = ctk.CTkButton(test_buttons, text="🔄 Reset Network", 
                                             command=self.reset_network, width=120)
        self.reset_network_btn.pack(side="left", padx=5, pady=5)
        
        # Diagnostic results
        results_frame = ctk.CTkFrame(trouble_frame)
        results_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        ctk.CTkLabel(results_frame, text="Diagnostic Results", 
                    font=ctk.CTkFont(size=16, weight="bold")).pack(pady=10)
        
        self.diagnostic_text = ctk.CTkTextbox(results_frame, height=300, 
                                            font=ctk.CTkFont(family="Consolas", size=11))
        self.diagnostic_text.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Optimization recommendations
        recommendations_frame = ctk.CTkFrame(trouble_frame)
        recommendations_frame.pack(fill="x", padx=10, pady=10)
        
        ctk.CTkLabel(recommendations_frame, text="Optimization Recommendations", 
                    font=ctk.CTkFont(size=16, weight="bold")).pack(pady=10)
        
        self.recommendations_text = ctk.CTkTextbox(recommendations_frame, height=150, 
                                                 font=ctk.CTkFont(size=12))
        self.recommendations_text.pack(fill="both", expand=True, padx=10, pady=10)
        
    def detect_network_info(self):
        """Detect current network information including router details"""
        try:
            # Get network adapter information
            self.get_network_adapters()
            
            # Get current connection details
            self.get_current_connection()
            
            # Get router information
            self.get_router_info()
            
            # Get WiFi details if connected via WiFi
            self.get_wifi_details()
            
        except Exception as e:
            print(f"Error detecting network info: {e}")
    
    def get_network_adapters(self):
        """Get detailed information about network adapters"""
        try:
            self.network_adapters = []
            
            # Get adapter info using psutil
            adapters = psutil.net_if_addrs()
            stats = psutil.net_if_stats()
            
            for adapter_name, addresses in adapters.items():
                adapter_info = {
                    'name': adapter_name,
                    'addresses': [],
                    'is_up': stats[adapter_name].isup if adapter_name in stats else False,
                    'speed': stats[adapter_name].speed if adapter_name in stats else 0,
                    'mtu': stats[adapter_name].mtu if adapter_name in stats else 0
                }
                
                for addr in addresses:
                    if addr.family == socket.AF_INET:  # IPv4
                        adapter_info['addresses'].append({
                            'type': 'IPv4',
                            'address': addr.address,
                            'netmask': addr.netmask,
                            'broadcast': addr.broadcast
                        })
                    elif addr.family == socket.AF_INET6:  # IPv6
                        adapter_info['addresses'].append({
                            'type': 'IPv6',
                            'address': addr.address,
                            'netmask': addr.netmask
                        })
                    elif addr.family == psutil.AF_LINK:  # MAC address
                        adapter_info['mac_address'] = addr.address
                
                self.network_adapters.append(adapter_info)
                
        except Exception as e:
            print(f"Error getting network adapters: {e}")
    
    def get_current_connection(self):
        """Get current connection details"""
        try:
            # get default gateway
            gateways = psutil.net_if_addrs()
            stats = psutil.net_io_counters(pernic=True)
            
            # finding 'active' connection
            for adapter_name in gateways:
                if adapter_name in stats and stats[adapter_name].bytes_sent > 0:
                    for addr in gateways[adapter_name]:
                        if addr.family == socket.AF_INET and not addr.address.startswith('169.254'):
                            self.current_network = {
                                'adapter': adapter_name,
                                'ip_address': addr.address,
                                'netmask': addr.netmask,
                                'gateway': self.get_default_gateway()
                            }
                            break
                    if self.current_network:
                        break
                        
        except Exception as e:
            print(f"Error getting current connection: {e}")
    
    def get_default_gateway(self):
        """Get the default gateway IP address"""
        try:
            if platform.system() == "Windows":
                result = subprocess.run(['route', 'print', '0.0.0.0'], 
                                      capture_output=True, text=True, shell=True)
                lines = result.stdout.split('\n')
                for line in lines:
                    if '0.0.0.0' in line and 'Gateway' not in line:
                        parts = line.split()
                        if len(parts) >= 3:
                            return parts[2]
            else:
                # linux / mac
                result = subprocess.run(['ip', 'route', 'show', 'default'], 
                                      capture_output=True, text=True)
                if result.stdout:
                    return result.stdout.split()[2]
        except:
            pass
        return None
    
    def get_router_info(self):
        """Get detailed router information"""
        try:
            gateway = self.get_default_gateway()
            if not gateway:
                return
            
            self.router_info = {
                'ip': gateway,
                'name': 'Unknown',
                'model': 'Unknown',
                'manufacturer': 'Unknown'
            }
            
            # try to get router info using SNMP or HTTP
            threading.Thread(target=self._get_router_details, args=(gateway,), daemon=True).start()
            
            # get router hostname
            try:
                hostname = socket.gethostbyaddr(gateway)[0]
                self.router_info['name'] = hostname
            except:
                pass
            
            # attempt to find manufacturer from MAC address - found method online
            try:
                # Get ARP table to find router MAC
                if platform.system() == "Windows":
                    result = subprocess.run(['arp', '-a', gateway], 
                                          capture_output=True, text=True, shell=True)
                    if result.stdout:
                        lines = result.stdout.split('\n')
                        for line in lines:
                            if gateway in line:
                                parts = line.split()
                                if len(parts) >= 2:
                                    mac = parts[1]
                                    self.router_info['mac'] = mac
                                    self.router_info['manufacturer'] = self.get_vendor_from_mac(mac)
                                break
            except:
                pass
                
        except Exception as e:
            print(f"Error getting router info: {e}")
    
    def _get_router_details(self, gateway_ip):
        """Professional router detection using UPnP/SSDP and SNMP (Network Engineering standard)"""
        try:
            # Method 1: UPnP/SSDP Discovery (Universal Plug and Play)
            upnp_info = self._upnp_discover_router(gateway_ip)
            if upnp_info:
                self.router_info.update(upnp_info)
                return
            
            # Method 2: SNMP Query (Simple Network Management Protocol)
            snmp_info = self._snmp_query_router(gateway_ip)
            if snmp_info:
                self.router_info.update(snmp_info)
                return
                
        except Exception as e:
            print(f"Error getting router details: {e}")
    
    def _upnp_discover_router(self, gateway_ip):
        """Use UPnP/SSDP to discover router and fetch device description XML"""
        try:
            # SSDP M-SEARCH multicast discovery
            ssdp_request = (
                'M-SEARCH * HTTP/1.1\r\n'
                'HOST: 239.255.255.250:1900\r\n'
                'MAN: "ssdp:discover"\r\n'
                'MX: 2\r\n'
                'ST: upnp:rootdevice\r\n'
                '\r\n'
            ).encode('utf-8')
            
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.settimeout(3)
            sock.sendto(ssdp_request, ('239.255.255.250', 1900))
            
            devices = []
            try:
                while True:
                    data, addr = sock.recvfrom(8192)
                    if addr[0] == gateway_ip:
                        devices.append(data.decode('utf-8', errors='ignore'))
            except socket.timeout:
                pass
            finally:
                sock.close()
            
            # Parse SSDP responses and fetch device description XML
            for response in devices:
                location_match = re.search(r'LOCATION:\s*(.+)', response, re.IGNORECASE)
                if location_match:
                    location_url = location_match.group(1).strip()
                    
                    try:
                        # Fetch the device description XML
                        xml_response = requests.get(location_url, timeout=3)
                        if xml_response.status_code == 200:
                            return self._parse_upnp_xml(xml_response.text)
                    except:
                        continue
            
            return None
            
        except Exception as e:
            print(f"UPnP discovery error: {e}")
            return None
    
    def _parse_upnp_xml(self, xml_content):
        """Parse UPnP device description XML for router info"""
        try:
            # Remove namespace prefixes for easier parsing
            xml_content = re.sub(r'xmlns="[^"]+"', '', xml_content)
            root = ET.fromstring(xml_content)
            
            info = {}
            
            # Find device section
            device = root.find('.//device')
            if device is not None:
                # Extract manufacturer
                manufacturer = device.find('manufacturer')
                if manufacturer is not None and manufacturer.text:
                    info['manufacturer'] = manufacturer.text.strip()
                
                # Extract model name
                model_name = device.find('modelName')
                if model_name is not None and model_name.text:
                    info['model'] = model_name.text.strip()
                
                # Extract model number (more specific)
                model_number = device.find('modelNumber')
                if model_number is not None and model_number.text:
                    if 'model' in info:
                        info['model'] += f" ({model_number.text.strip()})"
                    else:
                        info['model'] = model_number.text.strip()
                
                # Extract friendly name
                friendly_name = device.find('friendlyName')
                if friendly_name is not None and friendly_name.text:
                    info['name'] = friendly_name.text.strip()
                
                # Extract firmware version if available
                firmware = device.find('firmwareVersion')
                if firmware is not None and firmware.text:
                    info['firmware'] = firmware.text.strip()
            
            return info if info else None
            
        except Exception as e:
            print(f"XML parsing error: {e}")
            return None
    
    def _snmp_query_router(self, gateway_ip):
        """Query router using SNMP protocol (standard network management)"""
        try:
            from pysnmp.hlapi import *
            
            info = {}
            
            # Standard SNMP community strings (most routers use 'public' read-only)
            community_strings = ['public', 'private']
            
            # Standard MIB OIDs for device information
            oids = {
                'sysDescr': '1.3.6.1.2.1.1.1.0',      # System Description
                'sysName': '1.3.6.1.2.1.1.5.0',        # System Name
                'sysLocation': '1.3.6.1.2.1.1.6.0',    # System Location
                'sysUpTime': '1.3.6.1.2.1.1.3.0',      # System Uptime
            }
            
            for community in community_strings:
                try:
                    # Query sysDescr (contains model info)
                    iterator = getCmd(
                        SnmpEngine(),
                        CommunityData(community, mpModel=1),  # SNMPv2c
                        UdpTransportTarget((gateway_ip, 161), timeout=2, retries=1),
                        ContextData(),
                        ObjectType(ObjectIdentity(oids['sysDescr']))
                    )
                    
                    errorIndication, errorStatus, errorIndex, varBinds = next(iterator)
                    
                    if errorIndication or errorStatus:
                        continue
                    
                    # Parse sysDescr
                    for varBind in varBinds:
                        value = str(varBind[1])
                        if value and value != 'No Such Instance currently exists at this OID':
                            info['model'] = value
                            
                            # Try to extract manufacturer from description
                            manufacturers = ['Cisco', 'Netgear', 'Linksys', 'ASUS', 'TP-Link', 
                                           'D-Link', 'Belkin', 'Ubiquiti', 'Mikrotik', 'Arris']
                            for mfr in manufacturers:
                                if mfr.lower() in value.lower():
                                    info['manufacturer'] = mfr
                                    break
                    
                    # Query sysName
                    iterator = getCmd(
                        SnmpEngine(),
                        CommunityData(community, mpModel=1),
                        UdpTransportTarget((gateway_ip, 161), timeout=2, retries=1),
                        ContextData(),
                        ObjectType(ObjectIdentity(oids['sysName']))
                    )
                    
                    errorIndication, errorStatus, errorIndex, varBinds = next(iterator)
                    
                    if not errorIndication and not errorStatus:
                        for varBind in varBinds:
                            value = str(varBind[1])
                            if value and value != 'No Such Instance currently exists at this OID':
                                info['name'] = value
                    
                    # Query sysUpTime
                    iterator = getCmd(
                        SnmpEngine(),
                        CommunityData(community, mpModel=1),
                        UdpTransportTarget((gateway_ip, 161), timeout=2, retries=1),
                        ContextData(),
                        ObjectType(ObjectIdentity(oids['sysUpTime']))
                    )
                    
                    errorIndication, errorStatus, errorIndex, varBinds = next(iterator)
                    
                    if not errorIndication and not errorStatus:
                        for varBind in varBinds:
                            value = str(varBind[1])
                            if value and value != 'No Such Instance currently exists at this OID':
                                # Convert timeticks to readable format
                                ticks = int(value) if value.isdigit() else 0
                                uptime_seconds = ticks / 100
                                days = int(uptime_seconds // 86400)
                                hours = int((uptime_seconds % 86400) // 3600)
                                minutes = int((uptime_seconds % 3600) // 60)
                                info['uptime'] = f"{days}d {hours}h {minutes}m"
                    
                    # If we got any info, return it
                    if info:
                        return info
                        
                except Exception as e:
                    continue
            
            return None
            
        except ImportError:
            print("pysnmp not installed - SNMP queries unavailable")
            return None
        except Exception as e:
            print(f"SNMP query error: {e}")
            return None
    
    def get_vendor_from_mac(self, mac_address):
        """Get vendor information from MAC address"""
        try:
            # clean MAC address
            mac = mac_address.replace('-', ':').replace('.', ':').upper()
            oui = mac[:8]  # first 3 octets
            
            # Common vendor OUIs - again thank u github
            vendors = {
                '00:50:56': 'VMware',
                '08:00:27': 'VirtualBox',
                '00:15:5D': 'Microsoft',
                '00:1B:21': 'Cisco',
                '00:14:BF': 'Cisco',
                '94:10:3E': 'ASUS',
                'AC:9E:17': 'ASUS',
                '20:CF:30': 'NETGEAR',
                'A0:40:A0': 'NETGEAR',
                '00:1F:33': 'Netgear',
                '68:7F:74': 'Linksys',
                '14:91:82': 'Linksys',
                '14:CC:20': 'TP-Link',
                'EC:08:6B': 'TP-Link',
                '00:17:9A': 'D-Link',
                '28:10:7B': 'D-Link'
            }
            
            return vendors.get(oui, 'Unknown')
            
        except:
            return 'Unknown'
    
    def get_wifi_details(self):
        """Get WiFi-specific details if connected via WiFi"""
        try:
            if platform.system() == "Windows":
                # get current WiFi profile
                result = subprocess.run(['netsh', 'wlan', 'show', 'profile'], 
                                      capture_output=True, text=True, shell=True)
                
                if result.stdout:
                    lines = result.stdout.split('\n')
                    current_profile = None
                    
                    for line in lines:
                        if 'All User Profile' in line and '*' in line:
                            current_profile = line.split(':')[1].strip()
                            break
                    
                    if current_profile:
                        # get detailed profile info
                        profile_result = subprocess.run([
                            'netsh', 'wlan', 'show', 'profile', current_profile, 'key=clear'
                        ], capture_output=True, text=True, shell=True)
                        
                        if profile_result.stdout:
                            self._parse_wifi_profile(profile_result.stdout, current_profile)
                
                # get signal strength and other details
                interface_result = subprocess.run(['netsh', 'wlan', 'show', 'interfaces'], 
                                                capture_output=True, text=True, shell=True)
                
                if interface_result.stdout:
                    self._parse_wifi_interface(interface_result.stdout)
                    
        except Exception as e:
            print(f"Error getting WiFi details: {e}")
    
    def _parse_wifi_profile(self, profile_output, ssid):
        """Parse WiFi profile information"""
        try:
            lines = profile_output.split('\n')
            wifi_info = {'ssid': ssid}
            
            for line in lines:
                line = line.strip()
                if 'Key Content' in line and ':' in line:
                    password = line.split(':', 1)[1].strip()
                    wifi_info['password'] = password
                elif 'Authentication' in line and ':' in line:
                    auth = line.split(':', 1)[1].strip()
                    wifi_info['security'] = auth
                elif 'Cipher' in line and ':' in line:
                    cipher = line.split(':', 1)[1].strip()
                    wifi_info['encryption'] = cipher
            
            self.current_network.update(wifi_info)
            
        except Exception as e:
            print(f"Error parsing WiFi profile: {e}")
    
    def _parse_wifi_interface(self, interface_output):
        """Parse WiFi interface information"""
        try:
            lines = interface_output.split('\n')
            
            for line in lines:
                line = line.strip()
                if 'Signal' in line and ':' in line:
                    signal = line.split(':', 1)[1].strip()
                    self.current_network['signal_strength'] = signal
                elif 'Channel' in line and ':' in line:
                    channel = line.split(':', 1)[1].strip()
                    self.current_network['channel'] = channel
                elif 'Radio type' in line and ':' in line:
                    radio = line.split(':', 1)[1].strip()
                    self.current_network['radio_type'] = radio
                elif 'BSSID' in line and ':' in line:
                    bssid = line.split(':', 1)[1].strip()
                    self.current_network['bssid'] = bssid
                    
        except Exception as e:
            print(f"Error parsing WiFi interface: {e}")
    
    def run_speed_test(self):
        """Run internet speed test"""
        if self.speed_test_running:
            messagebox.showwarning("Speed Test Running", "A speed test is already in progress!")
            return
        
        self.speed_test_running = True
        self.speed_test_btn.configure(state="disabled", text="🔄 Testing...")
        self.speed_status.configure(text="Initializing speed test...")
        
        threading.Thread(target=self._run_speed_test_thread, daemon=True).start()
    
    def _run_speed_test_thread(self):
        """Speed test thread"""
        try:
            self.speed_status.configure(text="Finding best server...")
            self.speed_progress.set(0.1)
            
            st = speedtest.Speedtest()
            
            # find best server
            self.speed_status.configure(text="Connecting to test server...")
            self.speed_progress.set(0.2)
            st.get_best_server()
            
            # download test
            self.speed_status.configure(text="Testing download speed...")
            self.speed_progress.set(0.3)
            download_speed = st.download() / 1_000_000  # Convert to Mbps
            
            self.speed_progress.set(0.7)
            
            # upload test
            self.speed_status.configure(text="Testing upload speed...")
            upload_speed = st.upload() / 1_000_000  # Convert to Mbps
            
            self.speed_progress.set(0.9)
            
            # ping test
            ping = st.results.ping
            
            # updating UI
            self.download_speed_label.configure(text=f"{download_speed:.1f} Mbps")
            self.upload_speed_label.configure(text=f"{upload_speed:.1f} Mbps")
            self.ping_label.configure(text=f"{ping:.1f} ms")
            
            # storing data 'results'
            result = {
                'timestamp': datetime.now(),
                'download': download_speed,
                'upload': upload_speed,
                'ping': ping,
                'server': st.results.server
            }
            
            self.speed_history.append(result)
            
            # updating graph
            self.update_speed_graph()
            
            self.speed_progress.set(1.0)
            self.speed_status.configure(text=f"Test complete! Server: {st.results.server['sponsor']}")
            
        except Exception as e:
            self.speed_status.configure(text=f"Speed test failed: {str(e)}")
            messagebox.showerror("Speed Test Error", f"Speed test failed: {str(e)}")
        
        finally:
            self.speed_test_running = False
            self.speed_test_btn.configure(state="normal", text="Run Speed Test")

    def run_detailed_speed_test(self):
        """Run 3 detailed speed tests in sequence and log full results to the troubleshooting textbox"""
        if self.speed_test_running:
            messagebox.showwarning("Speed Test Running", "A speed test is already in progress!")
            return

        self.speed_test_running = True
        self.detailed_speed_btn.configure(state="disabled", text="🔄 Running 3 tests...")
        self.speed_status.configure(text="Starting detailed multi-run speed tests...")
        threading.Thread(target=self._detailed_speed_test_thread, daemon=True).start()

    def _detailed_speed_test_thread(self):
        """Perform 3 sequential speedtest runs, capture server and result details, and append to diagnostic log."""
        try:
            st = speedtest.Speedtest()
            # pre-warm: find best server once
            self.speed_status.configure(text="Finding best server for detailed tests...")
            st.get_best_server()
            server_info = st.results.server if hasattr(st, 'results') and st.results and 'server' in st.results else None

            for run_idx in range(1, 4):
                self.speed_status.configure(text=f"Detailed run {run_idx}/3: testing download...")
                self.speed_progress.set(0.1 * run_idx)

                # recreate Speedtest instance per run to ensure fresh measurements
                st_run = speedtest.Speedtest()
                try:
                    st_run.get_best_server()
                except Exception:
                    # fallback: reuse previously found server if get_best_server fails
                    pass

                start_ts = datetime.now()
                download_bps = st_run.download()
                upload_bps = st_run.upload()
                ping_ms = st_run.results.ping if hasattr(st_run.results, 'ping') else getattr(st_run, 'results', {}).get('ping', 0)

                download_mbps = download_bps / 1_000_000
                upload_mbps = upload_bps / 1_000_000

                # building a detailed result dict
                detailed = {
                    'run': run_idx,
                    'timestamp': start_ts.isoformat(),
                    'download_mbps': round(download_mbps, 2),
                    'upload_mbps': round(upload_mbps, 2),
                    'ping_ms': round(ping_ms, 2),
                    'server': st_run.results.server if hasattr(st_run, 'results') and st_run.results and 'server' in st_run.results else server_info,
                    'raw_results': getattr(st_run, 'results', {})
                }

                # append to speed_history and UI labels
                self.speed_history.append({
                    'timestamp': start_ts,
                    'download': detailed['download_mbps'],
                    'upload': detailed['upload_mbps'],
                    'ping': detailed['ping_ms'],
                    'server': detailed['server']
                })

                # update UI labels
                self.download_speed_label.configure(text=f"{detailed['download_mbps']:.1f} Mbps")
                self.upload_speed_label.configure(text=f"{detailed['upload_mbps']:.1f} Mbps")
                self.ping_label.configure(text=f"{detailed['ping_ms']:.1f} ms")

                # log full details to diagnostic text box (thread-safe via after)
                def append_log(txt):
                    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    self.diagnostic_text.insert('end', f"[{timestamp}] Detailed Speed Test Run {run_idx}:\n")
                    self.diagnostic_text.insert('end', txt + "\n\n")
                    self.diagnostic_text.see('end')

                server_summary = detailed['server'] if detailed['server'] else {}
                log_text = (
                    f"Download: {detailed['download_mbps']} Mbps, Upload: {detailed['upload_mbps']} Mbps, Ping: {detailed['ping_ms']} ms\n"
                    f"Server: {server_summary}\n"
                    f"Raw: {detailed['raw_results']}"
                )

                self.root.after(0, append_log, log_text)

                # tiny pause between runs - avoids hammering
                time.sleep(2)

            # after all runs, refresh graph and status
            self.root.after(0, self.update_speed_graph)
            self.speed_status.configure(text="Detailed multi-run tests complete")

        except Exception as e:
            self.speed_status.configure(text=f"Detailed speed test failed: {str(e)}")
            self.root.after(0, lambda: messagebox.showerror("Detailed Speed Test Error", f"Detailed speed test failed: {str(e)}"))
        finally:
            self.speed_test_running = False
            self.root.after(0, lambda: self.detailed_speed_btn.configure(state="normal", text="📋 Run Detailed Speed Test"))
    
    def update_speed_graph(self):
        """Update speed test history graph"""
        if not self.speed_history:
            return
        
        try:
            # get data for plotting
            timestamps = [result['timestamp'] for result in self.speed_history]
            downloads = [result['download'] for result in self.speed_history]
            uploads = [result['upload'] for result in self.speed_history]
            
            # clear and plot
            self.speed_ax.clear()
            self.speed_ax.set_facecolor('#2b2b2b')
            
            self.speed_ax.plot(timestamps, downloads, 'cyan', label='Download', linewidth=2, marker='o')
            self.speed_ax.plot(timestamps, uploads, 'orange', label='Upload', linewidth=2, marker='s')
            
            self.speed_ax.set_title('Speed Test History', color='white', fontsize=14, weight='bold')
            self.speed_ax.set_ylabel('Speed (Mbps)', color='white')
            self.speed_ax.set_xlabel('Time', color='white')
            self.speed_ax.legend()
            self.speed_ax.grid(True, alpha=0.3)
            self.speed_ax.tick_params(colors='white')
            
            # rotate x-axis labels
            plt.setp(self.speed_ax.xaxis.get_majorticklabels(), rotation=45)
            
            self.speed_canvas.draw()
            
        except Exception as e:
            print(f"Error updating speed graph: {e}")
    
    def toggle_monitoring(self):
        """Toggle continuous monitoring"""
        if self.monitoring_active:
            self.monitoring_active = False
            self.continuous_btn.configure(text="Start Monitoring")
            self.status_label.configure(text="Continuous monitoring stopped")
        else:
            self.monitoring_active = True
            self.continuous_btn.configure(text="Stop Monitoring")
            self.status_label.configure(text="Continuous monitoring active")
            threading.Thread(target=self._monitoring_loop, daemon=True).start()
    
    def _monitoring_loop(self):
        """Continuous monitoring loop"""
        while self.monitoring_active:
            try:
                # run speed test every 5 minutes
                if not self.speed_test_running:
                    self.run_speed_test()
                
                # wait 5 minutes
                for _ in range(300):  # 300 seconds = 5 minutes
                    if not self.monitoring_active:
                        break
                    time.sleep(1)
                    
            except Exception as e:
                print(f"Monitoring loop error: {e}")
                time.sleep(10)
    
    def scan_wifi_networks(self):
        """Scan for WiFi networks"""
        if self.wifi_scanning:
            return
        
        self.wifi_scanning = True
        self.wifi_scan_btn.configure(state="disabled", text="🔄 Scanning...")
        self.scan_status.configure(text="Scanning for WiFi networks...")
        
        threading.Thread(target=self._scan_wifi_thread, daemon=True).start()
    
    def _scan_wifi_thread(self):
        """WiFi scanning thread"""
        try:
            self.wifi_networks = []
            
            if platform.system() == "Windows":
                # use netsh to scan WiFi networks
                result = subprocess.run(['netsh', 'wlan', 'show', 'profile'], 
                                      capture_output=True, text=True, shell=True)
                
                # refresh available networks
                subprocess.run(['netsh', 'wlan', 'refresh'], 
                             capture_output=True, text=True, shell=True)
                
                time.sleep(3)  # wait for scan to complete
                
                # get available networks
                result = subprocess.run(['netsh', 'wlan', 'show', 'networks', 'mode=bssid'], 
                                      capture_output=True, text=True, shell=True)
                
                if result.stdout:
                    self._parse_wifi_scan(result.stdout)
            
            # update UI
            self._update_wifi_display()
            self._update_wifi_graph()
            
        except Exception as e:
            print(f"WiFi scan error: {e}")
            self.scan_status.configure(text=f"WiFi scan failed: {str(e)}")
        
        finally:
            self.wifi_scanning = False
            self.wifi_scan_btn.configure(state="normal", text="📡 Scan WiFi")
            self.scan_status.configure(text=f"Found {len(self.wifi_networks)} networks")
    
    def _parse_wifi_scan(self, scan_output):
        """Parse Windows netsh WiFi scan output"""
        try:
            lines = scan_output.split('\n')
            current_network = {}
            
            for line in lines:
                line = line.strip()
                
                if line.startswith('SSID'):
                    if current_network:  # save previous network
                        self.wifi_networks.append(current_network)
                    current_network = {'ssid': line.split(':', 1)[1].strip()}
                
                elif 'BSSID' in line and ':' in line:
                    current_network['bssid'] = line.split(':', 1)[1].strip()
                
                elif 'Signal' in line and ':' in line:
                    signal = line.split(':', 1)[1].strip()
                    current_network['signal'] = signal
                
                elif 'Channel' in line and ':' in line:
                    channel = line.split(':', 1)[1].strip()
                    current_network['channel'] = channel
                
                elif 'Authentication' in line and ':' in line:
                    auth = line.split(':', 1)[1].strip()
                    current_network['security'] = auth
                
                elif 'Radio type' in line and ':' in line:
                    radio = line.split(':', 1)[1].strip()
                    if 'n' in radio.lower():
                        current_network['frequency'] = '2.4/5 GHz'
                    elif 'g' in radio.lower():
                        current_network['frequency'] = '2.4 GHz'
                    elif 'ac' in radio.lower():
                        current_network['frequency'] = '5 GHz'
                    else:
                        current_network['frequency'] = 'Unknown'
            
            if current_network:  # save last network
                self.wifi_networks.append(current_network)
            
            # add vendor info
            for network in self.wifi_networks:
                if 'bssid' in network:
                    network['vendor'] = self.get_vendor_from_mac(network['bssid'])
                else:
                    network['vendor'] = 'Unknown'
                    
        except Exception as e:
            print(f"Error parsing WiFi scan: {e}")
    
    def _update_wifi_display(self):
        """Update WiFi networks display"""
        try:
            # clear existing items
            for item in self.wifi_tree.get_children():
                self.wifi_tree.delete(item)
            
            # add networks to treeview
            for network in self.wifi_networks:
                self.wifi_tree.insert('', 'end', values=(
                    network.get('ssid', 'Hidden'),
                    network.get('bssid', 'Unknown'),
                    network.get('signal', 'Unknown'),
                    network.get('channel', 'Unknown'),
                    network.get('frequency', 'Unknown'),
                    network.get('security', 'Unknown'),
                    network.get('vendor', 'Unknown')
                ))
                
        except Exception as e:
            print(f"Error updating WiFi display: {e}")
    
    def _update_wifi_graph(self):
        """Update WiFi signal strength graph"""
        if not self.wifi_networks:
            return
        
        try:
            # group networks by channel
            channel_data = defaultdict(list)
            
            for network in self.wifi_networks:
                channel = network.get('channel', 'Unknown')
                signal = network.get('signal', '0%')
                
                try:
                    # convert signal percentage to dBm (rough approximation)
                    signal_pct = int(signal.replace('%', ''))
                    signal_dbm = -100 + (signal_pct * 70 / 100)  # rough conversion
                    
                    if channel.isdigit():
                        channel_data[int(channel)].append(signal_dbm)
                except:
                    continue
            
            if not channel_data:
                return
            
            # prepare data for plotting
            channels = sorted(channel_data.keys())
            avg_signals = [np.mean(channel_data[ch]) for ch in channels]
            max_signals = [max(channel_data[ch]) for ch in channels]
            
            # clear and plot
            self.wifi_ax.clear()
            self.wifi_ax.set_facecolor('#2b2b2b')
            
            self.wifi_ax.bar(channels, avg_signals, alpha=0.7, color='cyan', label='Average Signal')
            self.wifi_ax.bar(channels, max_signals, alpha=0.5, color='orange', label='Max Signal')
            
            self.wifi_ax.set_title('WiFi Signal Strength by Channel', color='white', fontsize=14, weight='bold')
            self.wifi_ax.set_ylabel('Signal Strength (dBm)', color='white')
            self.wifi_ax.set_xlabel('Channel', color='white')
            self.wifi_ax.legend()
            self.wifi_ax.grid(True, alpha=0.3)
            self.wifi_ax.tick_params(colors='white')
            
            self.wifi_canvas.draw()
            
        except Exception as e:
            print(f"Error updating WiFi graph: {e}")
    
    def benchmark_dns(self):
        """Benchmark DNS servers"""
        self.start_dns_btn.configure(state="disabled", text="🔄 Testing...")
        self.dns_status.configure(text="Benchmarking DNS servers...")
        
        threading.Thread(target=self._benchmark_dns_thread, daemon=True).start()
    
    def _benchmark_dns_thread(self):
        """DNS benchmarking thread"""
        try:
            # ist of DNS servers to test
            dns_servers = [
                ('8.8.8.8', 'Google Primary'),
                ('8.8.4.4', 'Google Secondary'),
                ('1.1.1.1', 'Cloudflare Primary'),
                ('1.0.0.1', 'Cloudflare Secondary'),
                ('208.67.222.222', 'OpenDNS'),
                ('208.67.220.220', 'OpenDNS'),
                ('9.9.9.9', 'Quad9'),
                ('149.112.112.112', 'Quad9 Secondary'),
                ('76.76.19.19', 'Alternate DNS'),
                ('76.223.100.101', 'Alternate DNS'),
            ]
            
            # test domains
            test_domains = [
                'google.com',
                'youtube.com',
                'facebook.com',
                'amazon.com',
                'microsoft.com'
            ]
            
            self.dns_results = {}
            
            for dns_ip, dns_name in dns_servers:
                self.dns_status.configure(text=f"Testing {dns_name}...")
                
                total_time = 0
                successful_queries = 0
                
                for domain in test_domains:
                    try:
                        start_time = time.time()
                        
                        # create custom resolver
                        resolver = dns.resolver.Resolver()
                        resolver.nameservers = [dns_ip]
                        resolver.timeout = 3
                        resolver.lifetime = 3
                        
                        # perform DNS query
                        answers = resolver.resolve(domain, 'A')
                        
                        end_time = time.time()
                        query_time = (end_time - start_time) * 1000  # Convert to ms
                        
                        total_time += query_time
                        successful_queries += 1
                        
                    except Exception as e:
                        print(f"DNS query failed for {domain} using {dns_ip}: {e}")
                        continue
                
                if successful_queries > 0:
                    avg_response_time = total_time / successful_queries
                    success_rate = (successful_queries / len(test_domains)) * 100
                    
                    self.dns_results[dns_ip] = {
                        'name': dns_name,
                        'avg_response': avg_response_time,
                        'success_rate': success_rate,
                        'status': 'Good' if avg_response_time < 50 else 'Slow' if avg_response_time < 100 else 'Poor'
                    }
                else:
                    self.dns_results[dns_ip] = {
                        'name': dns_name,
                        'avg_response': 0,
                        'success_rate': 0,
                        'status': 'Failed'
                    }
            
            # update UI
            self._update_dns_display()
            self._update_dns_graph()
            
        except Exception as e:
            print(f"DNS benchmark error: {e}")
            self.dns_status.configure(text=f"DNS benchmark failed: {str(e)}")
        
        finally:
            self.start_dns_btn.configure(state="normal", text="🚀 Start Benchmark")
            self.dns_status.configure(text="DNS benchmark complete")
    
    def _update_dns_display(self):
        """Update DNS benchmark display"""
        try:
            # clear existing items
            for item in self.dns_tree.get_children():
                self.dns_tree.delete(item)
            
            # sort DNS results by response time
            sorted_dns = sorted(self.dns_results.items(), 
                              key=lambda x: x[1]['avg_response'] if x[1]['avg_response'] > 0 else float('inf'))
            
            # add results to treeview
            for dns_ip, result in sorted_dns:
                self.dns_tree.insert('', 'end', values=(
                    dns_ip,
                    result['name'],
                    f"{result['avg_response']:.1f}" if result['avg_response'] > 0 else "Failed",
                    f"{result['success_rate']:.1f}%",
                    result['status']
                ))
                
        except Exception as e:
            print(f"Error updating DNS display: {e}")
    
    def _update_dns_graph(self):
        """Update DNS response time graph"""
        if not self.dns_results:
            return
        
        try:
            # prepare data for plotting
            dns_names = []
            response_times = []
            colors = []
            
            # sort by response time
            sorted_dns = sorted(self.dns_results.items(), 
                              key=lambda x: x[1]['avg_response'] if x[1]['avg_response'] > 0 else float('inf'))
            
            for dns_ip, result in sorted_dns:
                if result['avg_response'] > 0:  # only include successful tests
                    dns_names.append(result['name'][:15])  # cut long names
                    response_times.append(result['avg_response'])
                    
                    # color code by performance
                    if result['avg_response'] < 30:
                        colors.append('green')
                    elif result['avg_response'] < 60:
                        colors.append('orange')
                    else:
                        colors.append('red')
            
            if not response_times:
                return
            
            # clear and plot
            self.dns_ax.clear()
            self.dns_ax.set_facecolor('#2b2b2b')
            
            bars = self.dns_ax.bar(dns_names, response_times, color=colors, alpha=0.7)
            
            self.dns_ax.set_title('DNS Server Response Times', color='white', fontsize=14, weight='bold')
            self.dns_ax.set_ylabel('Response Time (ms)', color='white')
            self.dns_ax.set_xlabel('DNS Server', color='white')
            self.dns_ax.tick_params(colors='white')
            self.dns_ax.grid(True, alpha=0.3)
            
            # rotate x-axis labels
            plt.setp(self.dns_ax.xaxis.get_majorticklabels(), rotation=45, ha='right')
            
            # add value labels on bars
            for bar, value in zip(bars, response_times):
                height = bar.get_height()
                self.dns_ax.text(bar.get_x() + bar.get_width()/2., height,
                               f'{value:.1f}ms', ha='center', va='bottom', color='white', fontsize=8)
            
            self.dns_canvas.draw()
            
        except Exception as e:
            print(f"Error updating DNS graph: {e}")
    
    def toggle_bandwidth_monitoring(self):
        """Toggle bandwidth monitoring"""
        if hasattr(self, 'bandwidth_monitoring') and self.bandwidth_monitoring:
            self.bandwidth_monitoring = False
            self.toggle_bandwidth_btn.configure(text="Start Monitoring")
            self.bandwidth_status.configure(text="Bandwidth monitoring stopped")
        else:
            self.bandwidth_monitoring = True
            self.toggle_bandwidth_btn.configure(text="Stop Monitoring")
            self.bandwidth_status.configure(text="Monitoring bandwidth usage...")
            threading.Thread(target=self._bandwidth_monitoring_loop, daemon=True).start()
    
    def _bandwidth_monitoring_loop(self):
        """Bandwidth monitoring loop"""
        # get initial network stats
        initial_stats = psutil.net_io_counters(pernic=True)
        process_stats = {}
        
        while getattr(self, 'bandwidth_monitoring', False):
            try:
                time.sleep(1)  # monitor every second
                
                # get current network stats
                current_stats = psutil.net_io_counters(pernic=True)
                
                # calculate total network usage
                total_bytes_sent = 0
                total_bytes_recv = 0
                
                for interface, stats in current_stats.items():
                    if interface in initial_stats:
                        total_bytes_sent += stats.bytes_sent - initial_stats[interface].bytes_sent
                        total_bytes_recv += stats.bytes_recv - initial_stats[interface].bytes_recv
                
                # convert to KB/s (rough approximation)
                download_speed = total_bytes_recv / 1024
                upload_speed = total_bytes_sent / 1024
                
                # update UI
                self.total_download_label.configure(text=f"Download: {download_speed:.1f} KB/s")
                self.total_upload_label.configure(text=f"Upload: {upload_speed:.1f} KB/s")
                
                # store data for graphing
                current_time = time.time()
                self.bandwidth_data['download'].append((current_time, download_speed))
                self.bandwidth_data['upload'].append((current_time, upload_speed))
                
                # update bandwidth graph
                if len(self.bandwidth_data['download']) % 5 == 0:  # Update graph every 5 seconds
                    self._update_bandwidth_graph()
                
                # get per-process network usage (simplified)
                self._update_process_bandwidth()
                
                # update initial stats for next iteration
                initial_stats = current_stats
                
            except Exception as e:
                print(f"Bandwidth monitoring error: {e}")
                time.sleep(5)
    
    def _refresh_port_pid_map(self):
        """
        Snapshot current connections to map Ports -> PIDs.
        We cache this because running net_connections() on every packet is too slow.
        """
        try:
            # get all active connections with a PID
            connections = psutil.net_connections(kind='inet')
            new_map = {}
            for conn in connections:
                if conn.laddr and conn.pid:
                    # map the Local Port to the PID
                    new_map[conn.laddr.port] = conn.pid
            self.port_pid_map = new_map
        except Exception as e:
            print(f"Error updating port map: {e}")

    def _packet_callback(self, pkt):
        """
        The Master Analyzer: Handles DPI, IDS, QoS, and Bandwidth in real-time.
        Network Engineering Course - All Professor Requirements
        """
        # Timestamp for QoS
        current_time = time.time()
        
        # --- 1. Protocol Distribution (Deep Packet Inspection) ---
        if IP in pkt:
            # Simple protocol counting
            if pkt.haslayer(TCP): 
                self.protocol_stats['TCP'] += 1
            elif pkt.haslayer(UDP): 
                self.protocol_stats['UDP'] += 1
            elif pkt.haslayer(ICMP): 
                self.protocol_stats['ICMP'] += 1
            
            # Application Layer Detection
            if pkt.haslayer(DNS): 
                self.protocol_stats['DNS'] += 1
            
            # HTTPS/TLS detection
            try:
                if pkt.haslayer('TLS') or (hasattr(pkt, 'dport') and pkt.dport == 443):
                    self.protocol_stats['HTTPS'] += 1
                elif hasattr(pkt, 'dport') and pkt.dport == 80:
                    self.protocol_stats['HTTP'] += 1
            except:
                pass
        
        # --- 3. Intrusion Detection System (Port Scan Detection) ---
        if TCP in pkt and IP in pkt:
            src_ip = pkt[IP].src
            # Only track external IPs (not our own)
            if src_ip != self.current_network.get('ip_address'):
                # Detect SYN Scan: External IP sending SYN to many ports
                if pkt[TCP].flags == 'S': 
                    self.syn_tracker[src_ip].add(pkt[TCP].dport)
                    
                    if len(self.syn_tracker[src_ip]) > 10:
                        alert_msg = f"⚠️ PORT SCAN DETECTED: {src_ip} scanned {len(self.syn_tracker[src_ip])} ports"
                        if alert_msg not in self.security_alerts:
                            self.security_alerts.append(alert_msg)
        
        # --- 4. Application Layer Analysis (DNS Query Tracking) ---
        if pkt.haslayer(DNS) and pkt[DNS].qr == 0:  # DNS Query (not response)
            try:
                query_name = pkt[DNS].qd.qname.decode('utf-8', errors='ignore')
                if query_name:
                    self.dns_queries[query_name] += 1
            except:
                pass
        
        # --- 5. QoS Analysis (Jitter Calculation) ---
        if hasattr(self, 'last_packet_time'):
            inter_arrival = current_time - self.last_packet_time
            self.packet_times.append(inter_arrival)
        self.last_packet_time = current_time
        
        # --- 7. WiFi Deauth Detection (Monitor Mode Required) ---
        # Note: Requires WiFi adapter in monitor mode (rare on Windows)
        try:
            if pkt.haslayer(Dot11Deauth):
                alert_msg = f"🚨 WiFi DEAUTH ATTACK detected against {pkt.addr1}"
                self.security_alerts.append(alert_msg)
        except:
            pass
        
        # --- EXISTING BANDWIDTH LOGIC (Preserved) ---
        if IP in pkt:
            payload_len = len(pkt)  # total size in bytes
            
            # identify direction and Process
            # we look at TCP/UDP ports to find the owner PID
            if TCP in pkt or UDP in pkt:
                sport = pkt.sport if TCP in pkt else pkt[UDP].sport
                dport = pkt.dport if TCP in pkt else pkt[UDP].dport
                
                # check if this is INCOMING (Destination is us)
                if dport in self.port_pid_map:
                    pid = self.port_pid_map[dport]
                    self.pid_traffic[pid]['down'] += payload_len
                    
                # check if this is OUTGOING (Source is us)
                elif sport in self.port_pid_map:
                    pid = self.port_pid_map[sport]
                    self.pid_traffic[pid]['up'] += payload_len

    def _start_background_sniffer(self):
        """
        Runs the blocking Scapy sniff function in a thread.
        """
        print("Starting Packet Sniffer...")
        while True:
            # 1. update the Port->PID map periodically
            if time.time() - self.last_map_update > 2:
                self._refresh_port_pid_map()
                self.last_map_update = time.time()
            
            # 2. sniff a batch of packets (store=0 saves RAM)
            try:
                # we sniff in short bursts so we can update the map loop
                # filter="ip" ensures we only get IP traffic
                sniff(prn=self._packet_callback, filter="ip", store=0, timeout=2)
            except Exception as e:
                print(f"Sniffer error: {e}")
                time.sleep(1)

    def _update_process_bandwidth(self):
        """
        Update per-process bandwidth usage using REAL Scapy data.
        """
        try:
            # clear UI list
            for item in self.bandwidth_tree.get_children():
                self.bandwidth_tree.delete(item)
            
            # 1. Snapshot the traffic data and reset counters (to calculate rate per second)
            # We copy the dict so the sniffer can keep writing to the main one
            current_traffic = self.pid_traffic.copy()
            
            # Reset the main counters for the next second's measurement
            self.pid_traffic.clear() 
            
            display_data = []

            # 2. Match PIDs to Process Names
            for pid, traffic in current_traffic.items():
                try:
                    proc = psutil.Process(pid)
                    name = proc.name()
                    
                    # convert bytes to KB/s (since this runs roughly every 1s)
                    down_speed = traffic['down'] / 1024.0
                    up_speed = traffic['up'] / 1024.0
                    
                    if down_speed > 0.1 or up_speed > 0.1: # filter out idle processes
                        display_data.append({
                            'name': name,
                            'pid': pid,
                            'down': down_speed,
                            'up': up_speed,
                            'total': down_speed + up_speed
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue

            # 3. sort by total usage (highest first)
            display_data.sort(key=lambda x: x['total'], reverse=True)

            # 4. update UI (Top 15)
            for data in display_data[:15]:
                self.bandwidth_tree.insert('', 'end', values=(
                    data['name'],
                    data['pid'],
                    f"{data['down']:.1f}",
                    f"{data['up']:.1f}",
                    f"{(data['down'] + data['up']) / 1024:.1f}" # total in MB roughly
                ))
                
        except Exception as e:
            print(f"Error updating process bandwidth: {e}")
    
    def run_topology_scan(self):
        """
        Uses Scapy ARP requests to map the LAN.
        Network Topology Discovery (Professor Requirement #2)
        """
        def _scan():
            try:
                # Get local subnet (assuming /24 for simplicity)
                my_ip = self.current_network.get('ip_address', '192.168.1.1')
                base_ip = ".".join(my_ip.split('.')[:3]) + ".0/24"
                
                # Update UI status
                self.root.after(0, lambda: self.status_label.configure(text="Mapping network topology..."))
                
                # Scapy ARP scan
                ans, unans = arping(base_ip, timeout=2, verbose=0)
                
                self.detected_devices = []
                for sent, received in ans:
                    device = {
                        'ip': received.psrc,
                        'mac': received.hwsrc,
                        'vendor': self.get_vendor_from_mac(received.hwsrc)
                    }
                    self.detected_devices.append(device)
                
                # Update UI
                self.root.after(0, lambda: messagebox.showinfo(
                    "Network Topology Scan Complete", 
                    f"Found {len(self.detected_devices)} devices on LAN\n\n" +
                    "\n".join([f"{d['ip']} - {d['vendor']}" for d in self.detected_devices[:10]])
                ))
                self.root.after(0, lambda: self.status_label.configure(text="Topology scan complete"))
                
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Scan Error", f"Failed to scan network: {e}"))
        
        threading.Thread(target=_scan, daemon=True).start()
    
    def export_netflow_data(self):
        """
        Exports captured stats to JSON for ELK stack or analysis.
        NetFlow Export (Professor Requirement #6)
        """
        try:
            data = {
                'timestamp': datetime.now().isoformat(),
                'protocol_distribution': dict(self.protocol_stats),
                'top_dns_queries': self.dns_queries.most_common(10),
                'security_alerts': list(self.security_alerts),
                'devices': self.detected_devices,
                'network_info': {
                    'ssid': self.current_network.get('ssid'),
                    'gateway': self.router_info.get('ip'),
                    'ip_address': self.current_network.get('ip_address')
                }
            }
            
            filename = f"netflow_dump_{int(time.time())}.json"
            with open(filename, 'w') as f:
                json.dump(data, f, indent=4)
            
            messagebox.showinfo("NetFlow Export", f"Network data exported to:\n{filename}")
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export NetFlow data: {e}")
    
    def predict_network_congestion(self):
        """
        Uses Linear Regression (Least Squares) to predict bandwidth trends.
        ML Trend Analysis (Professor Requirement #9)
        """
        try:
            if len(self.bandwidth_data.get('download', [])) < 10:
                return "Not enough data for prediction (need 10+ data points)"
            
            # Get recent download speeds
            data = list(self.bandwidth_data['download'])[-50:]  # Last 50 points
            if not data:
                return "No bandwidth data available"
            
            y = np.array([d[1] for d in data])  # Speeds
            x = np.arange(len(y))  # Time steps
            
            # Calculate Trend Line (slope and intercept)
            slope, intercept = np.polyfit(x, y, 1)
            
            # Prediction logic
            trend = "Stable"
            if slope > 0.5: 
                trend = "⬆️ Rapidly Increasing (Risk of Congestion)"
            elif slope < -0.5: 
                trend = "⬇️ Decreasing"
            
            return f"Trend: {trend}\nSlope: {slope:.2f} Mbps/sample\nCurrent Avg: {np.mean(y):.2f} Mbps"
        except Exception as e:
            return f"Prediction error: {e}"
    
    def save_network_profile(self):
        """
        Saves current network stats for comparison.
        Multi-Network Comparison (Professor Requirement #10)
        """
        try:
            ssid = self.current_network.get('ssid', 'Unknown')
            
            # Calculate averages from history
            avg_down = 0
            avg_up = 0
            avg_ping = 0
            
            if self.speed_history:
                avg_down = sum(r['download'] for r in self.speed_history) / len(self.speed_history)
                avg_up = sum(r['upload'] for r in self.speed_history) / len(self.speed_history)
            
            if self.ping_history.get('8.8.8.8'):
                pings = list(self.ping_history['8.8.8.8'])
                avg_ping = sum(pings) / len(pings) if pings else 0
            
            profile = {
                'ssid': ssid,
                'avg_download': avg_down,
                'avg_upload': avg_up,
                'avg_ping': avg_ping,
                'gateway': self.router_info.get('ip'),
                'device_count': len(self.detected_devices),
                'timestamp': datetime.now().isoformat()
            }
            
            self.network_profiles[ssid] = profile
            messagebox.showinfo(
                "Network Profile Saved", 
                f"Profile saved for '{ssid}'\n\n"
                f"Avg Download: {avg_down:.2f} Mbps\n"
                f"Avg Upload: {avg_up:.2f} Mbps\n"
                f"Avg Ping: {avg_ping:.2f} ms\n"
                f"\nTotal profiles: {len(self.network_profiles)}"
            )
        except Exception as e:
            messagebox.showerror("Save Error", f"Failed to save network profile: {e}")
    
    def _update_bandwidth_graph(self):
        """Update bandwidth usage graph"""
        try:
            if not self.bandwidth_data['download']:
                return
            
            # get recent data (last 60 data points)
            download_data = list(self.bandwidth_data['download'])[-60:]
            upload_data = list(self.bandwidth_data['upload'])[-60:]
            
            if not download_data:
                return
            
            # extract timestamps and values
            times = [datetime.fromtimestamp(point[0]) for point in download_data]
            downloads = [point[1] for point in download_data]
            uploads = [point[1] for point in upload_data if point[0] in [p[0] for p in download_data]]
            
            # clear and plot
            self.bandwidth_ax.clear()
            self.bandwidth_ax.set_facecolor('#2b2b2b')
            
            self.bandwidth_ax.plot(times, downloads, 'cyan', label='Download', linewidth=2)
            self.bandwidth_ax.plot(times, uploads[:len(times)], 'orange', label='Upload', linewidth=2)
            
            self.bandwidth_ax.set_title('Real-time Bandwidth Usage', color='white', fontsize=14, weight='bold')
            self.bandwidth_ax.set_ylabel('Speed (KB/s)', color='white')
            self.bandwidth_ax.set_xlabel('Time', color='white')
            self.bandwidth_ax.legend()
            self.bandwidth_ax.grid(True, alpha=0.3)
            self.bandwidth_ax.tick_params(colors='white')
            
            # rotate x-axis labels
            plt.setp(self.bandwidth_ax.xaxis.get_majorticklabels(), rotation=45)
            
            self.bandwidth_canvas.draw()
            
        except Exception as e:
            print(f"Error updating bandwidth graph: {e}")
    
    def run_ping_test(self):
        """Run ping test to common servers"""
        self.ping_test_btn.configure(state="disabled", text="🔄 Testing...")
        threading.Thread(target=self._ping_test_thread, daemon=True).start()
    
    def _ping_test_thread(self):
        """Ping test thread"""
        try:
            servers = [
                ('8.8.8.8', 'Google DNS'),
                ('1.1.1.1', 'Cloudflare DNS'),
                ('google.com', 'Google'),
                ('youtube.com', 'YouTube'),
                ('github.com', 'GitHub')
            ]
            
            results = []
            
            for server, name in servers:
                try:
                    response_time = ping3.ping(server, timeout=3)
                    if response_time:
                        results.append(f"{name} ({server}): {response_time*1000:.1f} ms")
                    else:
                        results.append(f"{name} ({server}): Timeout")
                except Exception as e:
                    results.append(f"{name} ({server}): Error - {str(e)}")
            
            # update diagnostic text
            result_text = "PING TEST RESULTS\n" + "="*50 + "\n"
            result_text += "\n".join(results)
            result_text += "\n\n"
            
            self.diagnostic_text.insert("end", result_text)
            
        except Exception as e:
            self.diagnostic_text.insert("end", f"Ping test error: {str(e)}\n\n")
        
        finally:
            self.ping_test_btn.configure(state="normal", text="Ping Test")
    
    def run_traceroute(self):
        """Run traceroute to Google"""
        self.traceroute_btn.configure(state="disabled", text="🔄 Tracing...")
        threading.Thread(target=self._traceroute_thread, daemon=True).start()
    
    def _traceroute_thread(self):
        """Traceroute thread"""
        try:
            if platform.system() == "Windows":
                result = subprocess.run(['tracert', '8.8.8.8'], 
                                      capture_output=True, text=True, shell=True, timeout=30)
            else:
                result = subprocess.run(['traceroute', '8.8.8.8'], 
                                      capture_output=True, text=True, timeout=30)
            
            # update diagnostic text
            result_text = "TRACEROUTE TO 8.8.8.8\n" + "="*50 + "\n"
            result_text += result.stdout + "\n\n"
            
            self.diagnostic_text.insert("end", result_text)
            
        except subprocess.TimeoutExpired:
            self.diagnostic_text.insert("end", "Traceroute timeout\n\n")
        except Exception as e:
            self.diagnostic_text.insert("end", f"Traceroute error: {str(e)}\n\n")
        
        finally:
            self.traceroute_btn.configure(state="normal", text="Traceroute")
    
    def flush_dns(self):
        """Flush DNS cache"""
        try:
            if platform.system() == "Windows":
                result = subprocess.run(['ipconfig', '/flushdns'], 
                                      capture_output=True, text=True, shell=True)
                self.diagnostic_text.insert("end", "🧹 DNS CACHE FLUSHED\n" + "="*30 + "\n")
                self.diagnostic_text.insert("end", result.stdout + "\n\n")
            else:
                self.diagnostic_text.insert("end", "🧹 DNS flush not available on this platform\n\n")
                
        except Exception as e:
            self.diagnostic_text.insert("end", f"DNS flush error: {str(e)}\n\n")
    
    def reset_network(self):
        """Reset network settings"""
        try:
            if platform.system() == "Windows":
                commands = [
                    ['netsh', 'winsock', 'reset'],
                    ['netsh', 'int', 'ip', 'reset'],
                    ['ipconfig', '/release'],
                    ['ipconfig', '/renew']
                ]
                
                self.diagnostic_text.insert("end", "🔄 NETWORK RESET\n" + "="*30 + "\n")
                
                for cmd in commands:
                    try:
                        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
                        self.diagnostic_text.insert("end", f"Command: {' '.join(cmd)}\n")
                        self.diagnostic_text.insert("end", f"Result: {result.stdout}\n\n")
                    except Exception as e:
                        self.diagnostic_text.insert("end", f"Command failed: {' '.join(cmd)} - {str(e)}\n\n")
                
                self.diagnostic_text.insert("end", "⚠️ Network reset complete. Restart recommended.\n\n")
            else:
                self.diagnostic_text.insert("end", "🔄 Network reset not available on this platform\n\n")
                
        except Exception as e:
            self.diagnostic_text.insert("end", f"Network reset error: {str(e)}\n\n")
    
    def optimize_network(self):
        """Optimize network settings"""
        try:
            recommendations = []
            
            # analyze current settings and provide recommendations
            if self.dns_results:
                # find fastest DNS
                fastest_dns = min(self.dns_results.items(), 
                                key=lambda x: x[1]['avg_response'] if x[1]['avg_response'] > 0 else float('inf'))
                recommendations.append(f"💡 Use fastest DNS: {fastest_dns[0]} ({fastest_dns[1]['name']}) - {fastest_dns[1]['avg_response']:.1f}ms")
            
            # check WiFi signal strength
            if 'signal_strength' in self.current_network:
                signal = self.current_network['signal_strength']
                try:
                    signal_pct = int(signal.replace('%', ''))
                    if signal_pct < 70:
                        recommendations.append(f"📶 WiFi signal is weak ({signal}). Consider moving closer to router or using 5GHz band.")
                except:
                    pass
            
            # check channel congestion
            if self.wifi_networks:
                channel_usage = defaultdict(int)
                for network in self.wifi_networks:
                    channel = network.get('channel', 'Unknown')
                    if channel.isdigit():
                        channel_usage[int(channel)] += 1
                
                if channel_usage:
                    best_channel = min(channel_usage.items(), key=lambda x: x[1])
                    current_channel = self.current_network.get('channel', 'Unknown')
                    
                    if current_channel.isdigit() and int(current_channel) != best_channel[0]:
                        recommendations.append(f"📡 Consider switching to channel {best_channel[0]} (less congested)")
            
            # simple internet recommendations
            recommendations.extend([
                "Disable unnecessary devices from network",
                "Check for updates on your router monthly for the best performance",
                "Place router in central, higher up location"
            ])
            
            # update recommendations display
            self.recommendations_text.delete("1.0", "end")
            self.recommendations_text.insert("1.0", "\n".join(recommendations))
            
            messagebox.showinfo("Network Optimization", 
                               f"Generated {len(recommendations)} optimization recommendations!")
            
        except Exception as e:
            messagebox.showerror("Optimization Error", f"Failed to generate recommendations: {str(e)}")
    
    def export_report(self):
        """Export comprehensive network report"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"network_diagnostic_report_{timestamp}.txt"
            
            report = []
            report.append("=" * 80)
            report.append("NETWORK DIAGNOSTIC REPORT")
            report.append("=" * 80)
            report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            report.append("")
            
            # Current connection
            report.append("CURRENT CONNECTION")
            report.append("-" * 40)
            for key, value in self.current_network.items():
                report.append(f"{key.replace('_', ' ').title()}: {value}")
            report.append("")
            
            # Router information
            report.append("ROUTER INFO")
            report.append("-" * 40)
            for key, value in self.router_info.items():
                report.append(f"{key.replace('_', ' ').title()}: {value}")
            report.append("")
            
            # Speed test results
            if self.speed_history:
                report.append("SPEED TEST HISTORY")
                report.append("-" * 40)
                for result in list(self.speed_history)[-5:]:  # Last 5 tests
                    report.append(f"{result['timestamp'].strftime('%Y-%m-%d %H:%M')} - "
                                f"Down: {result['download']:.1f} Mbps, "
                                f"Up: {result['upload']:.1f} Mbps, "
                                f"Ping: {result['ping']:.1f} ms")
                report.append("")
            
            # DNS benchmark results
            if self.dns_results:
                report.append("DNS BENCHMARK RESULTS")
                report.append("-" * 40)
                sorted_dns = sorted(self.dns_results.items(), 
                                  key=lambda x: x[1]['avg_response'] if x[1]['avg_response'] > 0 else float('inf'))
                for dns_ip, result in sorted_dns:
                    report.append(f"{result['name']} ({dns_ip}): {result['avg_response']:.1f}ms - {result['status']}")
                report.append("")
            
            # WiFi networks
            if self.wifi_networks:
                report.append("WIFI NETWORKS DETECTED")
                report.append("-" * 40)
                for network in self.wifi_networks[:10]:  # Top 10
                    report.append(f"SSID: {network.get('ssid', 'Hidden')} - "
                                f"Signal: {network.get('signal', 'Unknown')} - "
                                f"Channel: {network.get('channel', 'Unknown')} - "
                                f"Security: {network.get('security', 'Unknown')}")
                report.append("")
            
            # network adapters
            report.append("🔌 NETWORK ADAPTERS")
            report.append("-" * 40)
            for adapter in self.network_adapters:
                if adapter['is_up']:
                    report.append(f"Name: {adapter['name']}")
                    report.append(f"  Status: {'Up' if adapter['is_up'] else 'Down'}")
                    report.append(f"  Speed: {adapter['speed']} Mbps" if adapter['speed'] > 0 else "  Speed: Unknown")
                    for addr in adapter['addresses']:
                        if addr['type'] == 'IPv4':
                            report.append(f"  IPv4: {addr['address']}")
                    report.append("")
            
            report.append("End of Report")
            report.append("=" * 80)
            
            # save report logic - stole from my tracker app
            with open(filename, 'w', encoding='utf-8') as f:
                f.write("\n".join(report))
            
            messagebox.showinfo("Export Complete", f"Network report exported to {filename}")
            
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export report: {str(e)}")
    
    def update_ui_loop(self):
        """Update UI elements periodically"""
        try:
            # updating connection status
            if self.current_network:
                network_name = self.current_network.get('ssid', 'Wired Connection')
                self.connection_status.configure(text=f"🟢 Connected to: {network_name}")
                
                # also update network overview
                self.network_name_label.configure(text=f"Network: {network_name}")
                
                if 'ip_address' in self.current_network:
                    self.ip_address_label.configure(text=f"IP Address: {self.current_network['ip_address']}")
                
                if 'gateway' in self.current_network:
                    self.gateway_label.configure(text=f"Gateway: {self.current_network['gateway']}")
                
                if 'signal_strength' in self.current_network:
                    self.signal_strength_label.configure(text=f"Signal: {self.current_network['signal_strength']}")
                
                if 'channel' in self.current_network:
                    self.channel_label.configure(text=f"Channel: {self.current_network['channel']}")
                
                if 'radio_type' in self.current_network:
                    self.frequency_label.configure(text=f"Type: {self.current_network['radio_type']}")
                
                if 'security' in self.current_network:
                    self.security_label.configure(text=f"Security: {self.current_network['security']}")
            
            # update router info
            if self.router_info:
                router_name = self.router_info.get('name', 'Unknown')
                router_model = self.router_info.get('model', 'Unknown')
                
                self.router_name_label.configure(text=f"Router: {router_name}")
                self.router_model_label.configure(text=f"Model: {router_model}")
            
            # update adapters list
            self._update_adapter_display()
            
        except Exception as e:
            print(f"UI update error: {e}")
        
        # to schedule next update
        self.root.after(5000, self.update_ui_loop)  # Update every 5 seconds
    
    def _update_adapter_display(self):
        """Update network adapters display"""
        try:
            # clear any existing widgets
            for widget in self.adapters_scroll.winfo_children():
                widget.destroy()
            
            # add adapter info
            for i, adapter in enumerate(self.network_adapters):
                if adapter['is_up']:  # Only show active adapters
                    adapter_frame = ctk.CTkFrame(self.adapters_scroll)
                    adapter_frame.pack(fill="x", padx=5, pady=5)
                    
                    # adapter name and status
                    name_label = ctk.CTkLabel(adapter_frame, 
                                            text=f"🔌 {adapter['name']}", 
                                            font=ctk.CTkFont(size=14, weight="bold"))
                    name_label.pack(anchor="w", padx=10, pady=2)
                    
                    # speed and status
                    if adapter['speed'] > 0:
                        speed_text = f"Speed: {adapter['speed']} Mbps"
                    else:
                        speed_text = "Speed: Unknown"
                    
                    speed_label = ctk.CTkLabel(adapter_frame, text=speed_text)
                    speed_label.pack(anchor="w", padx=20, pady=1)
                    
                    # IP addresses
                    for addr in adapter['addresses']:
                        if addr['type'] == 'IPv4':
                            ip_label = ctk.CTkLabel(adapter_frame, 
                                                  text=f"IPv4: {addr['address']}")
                            ip_label.pack(anchor="w", padx=20, pady=1)
                        
        except Exception as e:
            print(f"Error updating adapter display: {e}")
    
    def run(self):
        """Start the application"""
        self.root.mainloop()

# bruh - app start
if __name__ == "__main__":
    try:
        app = NetworkDiagnosticTool()
        app.run()
    except KeyboardInterrupt:
        print("\nApplication terminated by user")
    except Exception as e:
        print(f"Application error: {e}")
        import traceback
        traceback.print_exc()