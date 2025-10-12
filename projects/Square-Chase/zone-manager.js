// Zone Management System
class ZoneManager {
    constructor() {
        this.zoneTypes = [
            {
                id: 'speed',
                name: 'Speed Zone',
                icon: '⚡',
                description: 'Square goes faster!',
                class: 'zone-speed',
                color: 'var(--speed-zone)',
                effect: { type: 'speed', multiplier: 2, duration: 3000 }
            },
            {
                id: 'slow',
                name: 'Slow Zone',
                icon: '🐌',
                description: 'Square slows down',
                class: 'zone-slow',
                color: 'var(--slow-zone)',
                effect: { type: 'speed', multiplier: 0.3, duration: 4000 }
            },
            {
                id: 'invisible',
                name: 'Ghost Zone',
                icon: '👻',
                description: 'Square becomes invisible',
                class: 'zone-invisible',
                color: 'var(--invisible-zone)',
                effect: { type: 'invisible', duration: 4000 }
            },
            {
                id: 'boost',
                name: 'Boost Zone',
                icon: '🚀',
                description: 'Temporary super speed!',
                class: 'zone-boost',
                color: 'var(--boost-zone)',
                effect: { type: 'boost', multiplier: 3, duration: 1500 }
            },
            {
                id: 'freeze',
                name: 'Freeze Zone',
                icon: '❄️',
                description: 'Square freezes in place',
                class: 'zone-freeze',
                color: 'var(--freeze-zone)',
                effect: { type: 'freeze', duration: 2000 }
            },
            {
                id: 'chaos',
                name: 'Chaos Zone',
                icon: '🌪️',
                description: 'Random chaotic movement!',
                class: 'zone-chaos',
                color: 'var(--chaos-zone)',
                effect: { type: 'chaos', duration: 3000 }
            }
        ];

        this.positions = [
            { top: '15%', left: '10%', right: 'auto', bottom: 'auto' },
            { top: '10%', left: 'auto', right: '15%', bottom: 'auto' },
            { top: 'auto', left: '8%', right: 'auto', bottom: '25%' },
            { top: 'auto', left: 'auto', right: '12%', bottom: '30%' }
        ];

        this.activeZones = [];
        this.currentZoneSet = [];
        this.cycleInterval = null;
        this.isShuffling = false;
        this.zoneElements = [];
        
        this.initializeZones();
        this.startZoneCycle();
    }

    initializeZones() {
        // Create 4 zone elements
        for (let i = 0; i < 4; i++) {
            const zoneElement = document.createElement('div');
            zoneElement.className = `pause-zone zone-${i + 1}`;
            zoneElement.dataset.zoneIndex = i;
            document.body.appendChild(zoneElement);
            this.zoneElements.push(zoneElement);
        }

        // Set initial zone types (first 4)
        this.updateZoneSet();
    }

    updateZoneSet() {
        // Randomly select 4 different zone types from the 6 available
        const availableTypes = [...this.zoneTypes];
        this.currentZoneSet = [];
        
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * availableTypes.length);
            this.currentZoneSet.push(availableTypes.splice(randomIndex, 1)[0]);
        }

        // Apply the selected zones to elements
        this.applyZonesToElements();
    }

    applyZonesToElements() {
        this.zoneElements.forEach((element, index) => {
            const zoneType = this.currentZoneSet[index];
            const position = this.positions[index];

            // Clear existing classes
            element.className = `pause-zone zone-${index + 1}`;
            
            // Apply new zone type
            element.classList.add(zoneType.class);
            element.dataset.type = zoneType.id;
            element.innerHTML = `
                ${zoneType.icon} ${zoneType.name}<br>
                <small>${zoneType.description}</small>
            `;

            // Apply position
            Object.keys(position).forEach(key => {
                element.style[key] = position[key];
            });

            // Show the zone
            element.classList.remove('hidden');
        });

        console.log('Active zone set:', this.currentZoneSet.map(z => z.name));
    }

    shufflePositions() {
        if (this.isShuffling) return;
        
        this.isShuffling = true;
        console.log('Shuffling zone positions...');

        // Add shuffle animation
        this.zoneElements.forEach(element => {
            element.classList.add('zone-shuffling');
        });

        // Shuffle positions array
        const shuffledPositions = [...this.positions];
        for (let i = shuffledPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
        }

        // Apply new positions
        setTimeout(() => {
            this.zoneElements.forEach((element, index) => {
                const position = shuffledPositions[index];
                Object.keys(position).forEach(key => {
                    element.style[key] = position[key];
                });
            });

            // Remove shuffle animation
            setTimeout(() => {
                this.zoneElements.forEach(element => {
                    element.classList.remove('zone-shuffling');
                });
                this.isShuffling = false;
            }, 1500);
        }, 300);
    }

    cycleZones() {
        console.log('Cycling to new zone set...');
        
        // Hide current zones
        this.zoneElements.forEach(element => {
            element.classList.add('hidden');
        });

        // After transition, update to new zones
        setTimeout(() => {
            this.updateZoneSet();
        }, 300);
    }

    startZoneCycle() {
        // Cycle zones every 15 seconds
        this.cycleInterval = setInterval(() => {
            this.cycleZones();
        }, 15000);

        // Shuffle positions every 8 seconds
        setInterval(() => {
            this.shufflePositions();
        }, 8000);
    }

    getZoneEffect(zoneId) {
        const zoneType = this.zoneTypes.find(z => z.id === zoneId);
        return zoneType ? zoneType.effect : null;
    }

    stopCycle() {
        if (this.cycleInterval) {
            clearInterval(this.cycleInterval);
            this.cycleInterval = null;
        }
    }

    destroy() {
        this.stopCycle();
        this.zoneElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.zoneElements = [];
    }
}

// Export for use in other modules
window.ZoneManager = ZoneManager;