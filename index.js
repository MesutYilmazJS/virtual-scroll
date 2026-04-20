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

        this.totalItems = options.totalItems;
        this.cache = {};
        this.fetching = false;

        this.container = document.getElementById(this.containerId);
        this.spacer = this.container.querySelector("#spacer");

        this.startIndex = 0;
        
        // Remove old scroll listeners to prevent duplicate event loops upon reset
        if (this.container._scrollHandler) {
            this.container.removeEventListener("scroll", this.container._scrollHandler);
        }
        
        this.init();
        
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

        // Calculate total spacer height to stretch the scrollbar correctly
        const totalRows = Math.ceil(this.totalItems / this.columns);
        this.spacer.style.height = `${Math.max(0, totalRows * (this.itemHeight + this.gap))}px`;

        // Center the grid inside the container horizontally if enough space, else stick to left
        const totalRowWidth = this.columns * this.itemWidth + (this.columns - 1) * this.gap;
        this.offsetX = Math.max(24, (this.containerWidth - totalRowWidth) / 2);
    }

    init() {
        this.recalculateLayout();
        this.renderItems();
        
        // Attach scroll listener safely
        this.container._scrollHandler = () => this.onScroll();
        this.container.addEventListener("scroll", this.container._scrollHandler);
    }

    async ensureData(start, count) {
        this.missingIndexes = [];
        for (let i = start; i < start + count && i < this.totalItems; i++) {
            if (!this.cache[i]) {
                this.missingIndexes.push(i);
            }
        }

        // Only fetch missing items efficiently instead of recreating massive arrays
        if (this.missingIndexes.length > 0) {
            // Simulated fetch/data preparation
            for (let i = 0; i < this.missingIndexes.length; i++) {
                const index = this.missingIndexes[i];
                this.cache[index] = `Sanal Blok #${index + 1}`;
            }
        }
    }

    async renderItems() {
        this.fetching = true;
        await this.ensureData(this.startIndex, this.visibleCount);
        
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

        const endIndex = Math.min(this.startIndex + this.visibleCount, this.totalItems);
        for (let i = this.startIndex; i < endIndex; i++) {
            const data = this.cache[i];
            const div = document.createElement("div");
            div.className = "item";
            div.style.width = `${this.itemWidth}px`;
            div.style.height = `${this.itemHeight}px`;
            // Calculate absolute position based on exact grid logic
            div.style.top = `${Math.floor(i / this.columns) * (this.itemHeight + this.gap)}px`;
            div.style.left = `${this.offsetX + (i % this.columns) * (this.itemWidth + this.gap)}px`;
            
            const palette = palettes[i % palettes.length];

            div.innerHTML = `
                <div class="item-inner">
                    <div class="item-decor" style="background: linear-gradient(90deg, ${palette.start}, ${palette.end})"></div>
                    <div class="item-icon" style="background: linear-gradient(135deg, ${palette.start}, ${palette.end})">
                      ${(i % 100) + 1}
                    </div>
                    <div class="item-title">${data}</div>
                    <div class="item-desc">DOM ağacı kararlılığını kusursuz şekilde koruyan optimize edilmiş sanal bileşen aktarımı.</div>
                </div>
            `;
            fragment.appendChild(div);
        }

        this.container.appendChild(fragment);
        
        // Update Interactive View Statistics efficiently
        const elVisibleCol = document.getElementById('visible_col');
        const elVisibleDiv = document.getElementById('visible_div');
        const elPageNumber = document.getElementById('page_number');
        
        if (elVisibleCol) elVisibleCol.innerText = this.visibleRows;
        if (elVisibleDiv) elVisibleDiv.innerText = endIndex - this.startIndex;
        if (elPageNumber) elPageNumber.innerText = Math.floor(this.startIndex / this.columns) + 1;
        
        this.fetching = false;
    }

    async onScroll() {
        if (this.fetching) return;
        const scrollTop = this.container.scrollTop;
        
        // Quantize start index to row block size
        const newStartIndex = Math.floor(scrollTop / (this.itemHeight + this.gap)) * this.columns;
        
        // Only trigger redraw if we have scrolled enough to warrant a new row appearing
        if (newStartIndex !== this.startIndex && newStartIndex <= this.totalItems) {
            this.startIndex = newStartIndex;
            await this.renderItems();
        }
    }
}
