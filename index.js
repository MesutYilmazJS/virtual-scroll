class VirtualGrid {
    constructor(options) {
        this.containerId = options.containerId;
        this.containerWidth = options.containerWidth;
        this.containerHeight = options.containerHeight;
        this.itemWidth = options.itemWidth;
        this.itemHeight = options.itemHeight;
        this.columns = options.columns;
        this.gap = options.gap;

        this.totalItems = options.totalItems;
        this.cache = {};
        this.fetching = false;

        this.container = document.getElementById(this.containerId);
        this.spacer = this.container.querySelector("#spacer");

        this.startIndex = 0;
        document
            .querySelectorAll("#submit_btn")[0]
            .addEventListener("click", (e) => {
                location.reload();
            });
        document.querySelectorAll("#itemWidth")[0].disabled = true;
        document.querySelectorAll("#itemHeight")[0].disabled = true;
        document.querySelectorAll("#columns")[0].disabled = true;
        document.querySelectorAll("#totalItems")[0].disabled = true;
        this.init();
    }

    init() {
        this.container.style.width = `${this.containerWidth}px`;
        this.container.style.height = `${this.containerHeight}px`;

        this.visibleRows =
            Math.ceil(this.containerHeight / (this.itemHeight + this.gap)) + 1;
        this.visibleCount = this.visibleRows * this.columns;

        const totalRows = Math.ceil(this.totalItems / this.columns);
        this.spacer.style.height = `${totalRows * (this.itemHeight + this.gap)}px`;

        const totalRowWidth =
            this.columns * this.itemWidth + (this.columns - 1) * this.gap;
        this.offsetX = Math.max(0, (this.containerWidth - totalRowWidth) / 2);

        this.renderItems();
        this.container.addEventListener("scroll", () => this.onScroll());
    }

    async ensureData(start, count) {
        this.missingIndexes = [];
        for (let i = start; i < start + count && i < this.totalItems; i++) {
            if (!this.cache[i]) {
                this.missingIndexes.push(i);
            }
        }

        if (this.missingIndexes.length > 0) {
            const blockStart = this.missingIndexes[0];
            const result = Array.from(
                { length: this.totalItems },
                (_, i) => `Item ${i + 1}`
            );

            result.forEach((item, idx) => {
                this.cache[blockStart + idx] = item;
            });
        }
    }

    async renderItems() {
        this.fetching = true;
        await this.ensureData(this.startIndex, this.visibleCount);
        this.container.querySelectorAll(".item").forEach((el) => el.remove());

        const fragment = document.createDocumentFragment();
        const colors = [
            "#e74c3c",
            "#3498db",
            "#2ecc71",
            "#f1c40f",
            "#9b59b6",
            "#e67e22",
        ];

        for (
            let i = this.startIndex;
            i < Math.min(this.startIndex + this.visibleCount, this.totalItems);
            i++
        ) {
            const data = this.cache[i];
            const div = document.createElement("div");
            div.className = "item";
            div.style.width = `${this.itemWidth}px`;
            div.style.height = `${this.itemHeight}px`;
            div.style.top = `${Math.floor(i / this.columns) * (this.itemHeight + this.gap)
                }px`;
            div.style.left = `${this.offsetX + (i % this.columns) * (this.itemWidth + this.gap)
                }px`;
            div.style.backgroundColor = colors[(this.startIndex + i) % colors.length];
            div.innerHTML = `<h3>${data}</h3>`;
            fragment.appendChild(div);
        }

        this.container.appendChild(fragment);
        document.querySelectorAll('#visible_col')[0].innerHTML= `<i>Görülen Sütün : ${this.visibleRows} <i>`
        document.querySelectorAll('#visible_div')[0].innerHTML= `<i>Görülen div sayısı : ${this.visibleCount} <i>`
        document.querySelectorAll('#page_number')[0].innerHTML= `<i>Sayfa sayısı : ${this.startIndex+1}<i>`
        document.querySelectorAll('#info')[0].innerHTML= `<h7>Detaylı bilgi : F12 -> grid </h7>`
        
        this.fetching = false;
    }

    async onScroll() {
        if (this.fetching) return;
        const scrollTop = this.container.scrollTop;
        const newStartIndex =
            Math.floor(scrollTop / (this.itemHeight + this.gap)) * this.columns;
        if (newStartIndex !== this.startIndex) {
            this.startIndex = newStartIndex;
            await this.renderItems();
        }
    }
}
