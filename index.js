class VirtualGrid {
    constructor(options) {
        this.containerId = options.containerId;
        // Container dimensions
        this.containerWidth = options.containerWidth;
        this.containerHeight = options.containerHeight;
        this.itemWidth = options.itemWidth;
        this.itemHeight = options.itemHeight;
        this.columns = options.columns;
        this.gap = options.gap || 20;

        // Backend integration state
        this.apiUrl = options.apiUrl;
        this.data = [];
        this.fetching = false;
        this.hasMore = true;
        this.nextCursor = null;

        this.container = document.getElementById(this.containerId);
        this.spacer = this.container.querySelector("#spacer");

        this.startIndex = 0;
        
        // Remove old scroll listeners to prevent duplicate event loops upon reset
        if (this.container._scrollHandler) {
            this.container.removeEventListener("scroll", this.container._scrollHandler);
        }
        
        // Handle window resize dynamically to maintain container constraints
        window.addEventListener('resize', this.debounce(() => {
            if (this.container.clientWidth !== this.containerWidth || 
                this.container.clientHeight !== this.containerHeight) {
                this.containerWidth = this.container.clientWidth;
                this.containerHeight = this.container.clientHeight;
                this.recalculateLayout();
                this.renderItems();
            }
        }, 150));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    recalculateLayout() {
        // Calculate visible items dynamically based on exact viewport size
        this.visibleRows = Math.ceil(this.containerHeight / (this.itemHeight + this.gap)) + 1;
        this.visibleCount = this.visibleRows * this.columns;

        // Calculate total spacer height dynamically based on loaded data
        // We add an extra empty space row at the bottom to allow scrolling further and triggering data load
        const loadedRows = Math.ceil(this.data.length / this.columns);
        let visualRows = loadedRows;
        
        if (this.hasMore) {
            visualRows += 2; // Extra scrollable area buffering to trigger threshold easily
        }

        this.spacer.style.height = `${Math.max(0, visualRows * (this.itemHeight + this.gap))}px`;

        // Center the grid inside the container horizontally if enough space, else stick to left
        const totalRowWidth = this.columns * this.itemWidth + (this.columns - 1) * this.gap;
        this.offsetX = Math.max(24, (this.containerWidth - totalRowWidth) / 2);
    }

    async init() {
        await this.fetchData();
        this.recalculateLayout();
        this.renderItems();
        
        // Attach scroll listener safely using infinite scroll bounds
        this.container._scrollHandler = () => this.onScroll();
        this.container.addEventListener("scroll", this.container._scrollHandler);
    }

    async fetchData() {
        if (this.fetching || !this.hasMore) return;
        
        this.fetching = true;
        const statusEl = document.getElementById('api_status');
        const indicator = document.getElementById('status_indicator');
        
        if (statusEl) {
            statusEl.textContent = 'Veri çekiliyor...';
            statusEl.className = 'status-loading';
        }

        // --- GITHUB PAGES LIVE DEMO MOCK FALLBACK ---
        // If the user hasn't provided a real hosted backend yet, simulate the Postgres Cursor pagination.
        if (this.apiUrl.includes('localhost') && window.location.hostname.includes('github.io') || this.apiUrl === 'mock') {
            await new Promise(resolve => setTimeout(resolve, 350)); // Network latency simulation
            
            const limit = 60;
            let startId = this.nextCursor ? parseInt(this.nextCursor) : 100000;
            let mockData = [];
            
            for (let i = 0; i < limit && startId > 0; i++) {
                mockData.push({
                    id: startId,
                    title: `Sanal Blok #${startId}`,
                    description: 'Otomatik Üretilmiş Veri (GitHub Pages Mock API)',
                });
                startId--;
            }

            this.data = this.data.concat(mockData);
            this.nextCursor = startId > 0 ? startId : null;
            if (!this.nextCursor || mockData.length === 0) this.hasMore = false;
            
            if (statusEl) {
                statusEl.textContent = 'Örnek Veri Yüklendi (Mock API)';
                statusEl.className = '';
                if(indicator) indicator.textContent = 'Bağlı (Mock API)';
            }
            this.fetching = false;
            this.recalculateLayout();
            return;
        }
        // ---------------------------------------------
        
        try {
            // Fetch significantly larger chunks (60 items) for standard scroll UX
            let url = `${this.apiUrl}?limit=60`;
            if (this.nextCursor) {
                url += `&cursor=${this.nextCursor}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("Ağ hatası");

            const json = await response.json();
            
            // Deduplicate guard checking: prevent append copies
            const currentLastId = this.data.length > 0 ? this.data[this.data.length - 1].id : null;
            if (json.data.length > 0 && json.data[0].id === currentLastId) {
                 json.data.shift(); // remove overlapping id to keep unique
            }

            this.data = this.data.concat(json.data);
            this.nextCursor = json.nextCursor;

            if (!this.nextCursor || json.data.length === 0) {
                this.hasMore = false;
            }

            if (statusEl) {
                statusEl.textContent = ``;
                statusEl.className = '';
                if(indicator) indicator.textContent = 'Bağlı';
            }
        } catch (error) {
            console.error("Fetch Data Error:", error);
            if (statusEl) {
                statusEl.textContent = 'Sunucuya bağlanılamadı. API açık mı?';
                statusEl.className = 'status-error';
                if(indicator) indicator.textContent = 'API Hatası';
            }
        } finally {
            this.fetching = false;
            this.recalculateLayout();
        }
    }

    async renderItems() {
        // Rapidly remove currently visible node DOM items
        this.container.querySelectorAll(".item").forEach((el) => el.remove());

        const fragment = document.createDocumentFragment();
        
        // Premium color palettes for the generic cards
        const palettes = [
            { start: "#ff416c", end: "#ff4b2b" },
            { start: "#36D1DC", end: "#5B86E5" },
            { start: "#8E2DE2", end: "#4A00E0" },
            { start: "#f12711", end: "#f5af19" },
            { start: "#00b09b", end: "#96c93d" },
            { start: "#11998e", end: "#38ef7d" },
            { start: "#FF5F6D", end: "#FFC371" },
            { start: "#2193b0", end: "#6dd5ed" }
        ];

        // Ensure we don't index beyond data we have loaded
        const endIndex = Math.min(this.startIndex + this.visibleCount, this.data.length);
        
        for (let i = this.startIndex; i < endIndex; i++) {
            const itemObj = this.data[i];
            // Format ID or fallback to standard index
            const displayId = itemObj.id || ((i % 100) + 1);
            const title = itemObj.title || `Sanal Blok #${i+1}`;
            const desc = itemObj.description || 'DOM ağacı kararlılığını koruyan sanal bileşen aktarımı.';

            const div = document.createElement("div");
            div.className = "item";
            div.style.width = `${this.itemWidth}px`;
            div.style.height = `${this.itemHeight}px`;
            // Calculate absolute position
            div.style.top = `${Math.floor(i / this.columns) * (this.itemHeight + this.gap)}px`;
            div.style.left = `${this.offsetX + (i % this.columns) * (this.itemWidth + this.gap)}px`;
            
            const palette = palettes[i % palettes.length];

            div.innerHTML = `
                <div class="item-inner">
                    <div class="item-decor" style="background: linear-gradient(90deg, ${palette.start}, ${palette.end})"></div>
                    <div class="item-icon" style="background: linear-gradient(135deg, ${palette.start}, ${palette.end})">
                      #${displayId}
                    </div>
                    <div class="item-title">${title}</div>
                    <div class="item-desc">${desc}</div>
                </div>
            `;
            fragment.appendChild(div);
        }

        this.container.appendChild(fragment);
        
        // Update Interactive View Statistics
        const elVisibleDiv = document.getElementById('visible_div');
        const elDataCount = document.getElementById('data_count');
        
        if (elVisibleDiv) elVisibleDiv.innerText = endIndex - this.startIndex;
        if (elDataCount) elDataCount.innerText = this.data.length;
    }

    async onScroll() {
        const scrollTop = this.container.scrollTop;
        
        // Quantize start index to row block size
        const newStartIndex = Math.floor(scrollTop / (this.itemHeight + this.gap)) * this.columns;
        
        // Check if we approach the end of the loaded data 
        // e.g. within 2 complete rows from the bottom of our currently fetched array
        const threshold = this.data.length - (this.visibleCount + (this.columns * 2));
        
        if (this.hasMore && newStartIndex >= threshold) {
            // Background fetch more data while scrolling
            await this.fetchData();
        }

        // Only explicitly redraw DOM elements if we switched complete row bounds
        if (newStartIndex !== this.startIndex) {
            // Guard prevent overshooting bounds entirely
            this.startIndex = Math.min(newStartIndex, Math.max(0, this.data.length - this.visibleCount));
            if(this.startIndex < 0) this.startIndex = 0;

            this.renderItems();
        }
    }
}
