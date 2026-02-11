# Network Analyzer v1.0
## Professional Network Diagnostic & Speed Testing Tool

**Author:** Dan  
**Course:** Network Engineering  
**Features:** Enterprise-grade network analysis with DPI, IDS, SNMP/UPnP discovery, and ML predictions

---

## 🚀 Quick Start (Recommended)

### One-Click Launch:
```
Double-click run.bat
```

**What it does:**
- ✅ Auto-detects if dependencies are installed
- ✅ Runs first-time setup if needed (one-time only)
- ✅ Always prompts for Administrator privileges (required for packet capture)
- ✅ Launches the application with elevated rights

---

## 📦 Manual Installation (Optional)

If you prefer manual setup:

```powershell
# Install all dependencies
python install.py

# Run the application (requires admin)
python network_diagnostic_tool.py
```

---

## 🎯 Features

### Core Network Analysis:
- **Speed Testing** - Download/upload/ping with detailed statistics
- **WiFi Scanning** - Discover all nearby networks with signal strength
- **DNS Benchmarking** - Test response times across 10+ DNS providers
- **Router Discovery** - UPnP/SSDP + SNMP queries (industry standard)
- **Bandwidth Monitoring** - Real-time per-process traffic analysis

### Advanced Features (Network Engineering Course Requirements):
1. **Deep Packet Inspection (DPI)** - Protocol distribution analysis (TCP/UDP/ICMP/DNS/HTTP/HTTPS)
2. **Network Topology Mapping** - ARP scanning to discover all LAN devices
3. **Intrusion Detection System (IDS)** - Port scan detection with real-time alerts
4. **Application Layer Analysis** - DNS query tracking and domain statistics
5. **QoS Metrics** - Jitter and inter-arrival time calculations
6. **NetFlow Export** - JSON export for ELK Stack integration
7. **WiFi Attack Detection** - Deauthentication attack monitoring
8. **ML Trend Analysis** - Network congestion prediction using linear regression
9. **Multi-Network Comparison** - Save and compare different network profiles

---

## 📊 New "Protocols (DPI)" Tab

Real-time protocol distribution with:
- **Pie Chart Visualization** - Live protocol breakdown
- **Top DNS Queries** - Most frequently accessed domains
- **QoS Metrics** - Jitter and latency statistics
- **Security Alerts** - IDS warnings for suspicious activity

### Action Buttons:
- 🗺️ **Scan Network Topology** - Map all devices on your LAN
- 📤 **Export NetFlow Data** - Save analysis to JSON
- 📈 **Predict Congestion** - ML-based bandwidth forecasting
- 💾 **Save Network Profile** - Store current network stats

---

## ⚙️ Requirements

### System:
- **OS:** Windows 10/11 (requires admin rights for packet capture)
- **Python:** 3.8 or higher
- **RAM:** 4GB minimum, 8GB recommended
- **Network:** Npcap driver (for full packet capture features)

### Dependencies (auto-installed):
```
customtkinter>=5.2.2    # Modern UI
psutil>=5.9.8           # System monitoring
scapy>=2.5.0            # Packet capture
matplotlib>=3.7         # Charts
numpy>=1.23             # ML calculations
speedtest-cli>=2.1.3    # Speed tests
dnspython>=2.4.2        # DNS resolution
pywin32>=306            # Windows APIs
WMI>=1.5.1              # Windows Management
pysnmp-lextudio>=6.0.0  # SNMP queries
```

---

## 🔒 Security & Permissions

### Why Admin Rights?
The tool requires elevated privileges to:
- Capture raw network packets (Scapy)
- Access low-level WiFi adapter info
- Query Windows Management Instrumentation (WMI)
- Modify network adapter settings (optimization features)

### Safe Usage:
✅ Source code is fully visible (open for review)  
✅ No external connections except speed tests & DNS queries  
✅ All data stays local (unless you export manually)  
✅ No telemetry or tracking

---

## 📖 Usage Tips

### For Best Results:
1. **Run with admin rights** - Required for packet capture
2. **Disable VPN temporarily** - Can interfere with local network discovery
3. **Close bandwidth-heavy apps** - For accurate speed tests
4. **Use wired connection** - For router discovery features (WiFi may have limitations)

### Interpreting Results:
- **Protocol Distribution** - Shows what types of traffic dominate your network
- **Port Scan Alerts** - More than 10 SYN packets to different ports = suspicious
- **DNS Queries** - Tracks which domains your system contacts
- **QoS Jitter** - Lower is better (< 30ms ideal for gaming/VoIP)

---

## 🐛 Troubleshooting

### "Import errors" / Missing packages
```powershell
python install.py
```

### "Admin privileges required"
- Right-click `run.bat` → Run as Administrator
- Or use the built-in UAC prompt (automatic in run.bat)

### "Packet capture not working"
- Install Npcap from https://npcap.com/
- Restart your computer after installation

### "WiFi Deauth Detection doesn't work"
- This is normal on Windows - requires Monitor Mode
- Most Windows WiFi drivers don't support this
- Code is correct, just driver limitation

### "Speed test fails"
- Check firewall settings (allow Python)
- Try different times (servers may be busy)
- Ensure stable internet connection

---

## 🎓 Academic Notes (For Professor)

### Network Engineering Principles Demonstrated:
1. **UPnP/SSDP Discovery** - Industry standard for device enumeration
2. **SNMP Queries** - Enterprise network management protocol (MIB OIDs)
3. **Deep Packet Inspection** - OSI Layer 2-7 analysis
4. **Intrusion Detection** - Signature-based attack detection (port scans)
5. **QoS Analysis** - Real-time jitter/latency calculations
6. **NetFlow Export** - Standard format for SIEM integration

### Technical Highlights:
- Background packet capture using Scapy daemon threads
- Lightweight per-packet callbacks (< 1ms processing time)
- Real-time UI updates without blocking main thread
- Professional error handling with graceful fallbacks
- Standards-compliant protocol implementations

---

## 📄 License & Attribution

**Educational Project** - Network Engineering Course 2026  
Developed for academic demonstration of network analysis concepts.

### Technologies Used:
- Python 3.x
- Scapy (packet capture)
- CustomTkinter (modern UI)
- Matplotlib (data visualization)
- NumPy (machine learning)
- PyWin32 (Windows integration)

---

## 📞 Support

For course-related questions, contact your instructor.  
For technical issues, review the troubleshooting section above.

**Version:** 1.0  
**Last Updated:** February 2026
