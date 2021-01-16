import { Stack, bindTo } from "./stack.js";
const GUTTER_SIZE = 4;
const BORDER_SIZE = 6;
/**
 * Enveloppe un block contenue dans une pile
 */
class DomBlock {
    constructor(element, stack) {
        this.gutterSize = GUTTER_SIZE;
        this.element = element;
        this.stack = stack;
    }
    getOffset() {
        if (this.stack.getDirection() == "horizontal")
            return parseInt(this.element.style.left) - this.gutterSize / 2;
        else
            return parseInt(this.element.style.top) - this.gutterSize / 2;
    }
    setOffset(offset) {
        if (this.stack.getDirection() == "horizontal")
            this.element.style.left = (offset + this.gutterSize / 2) + "px";
        else
            this.element.style.top = (offset + this.gutterSize / 2) + "px";
    }
    getSize() {
        if (this.stack.getDirection() == "horizontal")
            return parseInt(this.element.style.width) + this.gutterSize;
        else
            return parseInt(this.element.style.height) + this.gutterSize;
    }
    setSize(size) {
        if (this.stack.getDirection() == "horizontal")
            this.element.style.width = (size - this.gutterSize) + "px";
        else
            this.element.style.height = (size - this.gutterSize) + "px";
    }
}
/**
 * Enveloppe une bordure de séparation entre chaque block.
 */
class DomBorder {
    /**
     * @param element Élément HTML ou SVG à utiliser comme bordure
     * @param orientation Orientation de la bordure
     * @note Habituellement, l'orientation de la bordure sera inversée par rapport à la direction de la pile
     */
    constructor(element, orientation) {
        this.element = element;
        this.orientation = orientation;
        this.setThickness(BORDER_SIZE);
    }
    getThickness() {
        return this.thickness;
    }
    setThickness(thickness) {
        if (this.orientation == "horizontal")
            this.element.style.height = thickness + "px";
        else
            this.element.style.width = thickness + "px";
        // TODO: Réaligner l'axe.
        this.thickness = thickness;
    }
    getOrientation() {
        return this.orientation;
    }
    setOrientation(orientation) {
        this.orientation = orientation;
    }
    /**
     * retourne le décalage de l'axe
     */
    getOffset() {
        if (this.orientation == "horizontal")
            return parseInt(this.element.style.top) - this.thickness / 2;
        else
            return parseInt(this.element.style.left) - this.thickness / 2;
    }
    /**
     * Positionne l'axe de la bordure
     * @param offset Décalage de l'axe
     */
    setOffset(offset) {
        if (this.orientation == "horizontal")
            this.element.style.top = (offset - this.thickness / 2) + "px";
        else
            this.element.style.left = (offset - this.thickness / 2) + "px";
    }
}
export class DomStack extends Stack {
    constructor(element) {
        super();
        this.blocks = [];
        this.borders = [];
        // Container events
        this.onResize = bindTo(this, function onResize() {
            this.getSizer().stretch(this.getContainerSize());
        });
        this.prev = -1;
        this.next = -1;
        this.start = 0;
        this.moveX = bindTo(this, function moveX(evt) {
            if (evt instanceof MouseEvent) {
                evt.stopImmediatePropagation();
                evt.preventDefault();
                this.getSizer().resize(this.prev, this.next, evt.clientX - this.start);
            }
            else {
                this.getSizer().resize(this.prev, this.next, evt.touches[0].clientX - this.start);
            }
        });
        this.moveY = bindTo(this, function moveY(evt) {
            if (evt instanceof MouseEvent) {
                evt.stopImmediatePropagation();
                evt.preventDefault();
                this.getSizer().resize(this.prev, this.next, evt.clientY - this.start);
            }
            else {
                this.getSizer().resize(this.prev, this.next, evt.touches[0].clientY - this.start);
            }
        });
        this.stopMove = bindTo(this, function stopMove(evt) {
            //@ts-ignore
            window.removeEventListener("mouseup", this.stopMove, true);
            //@ts-ignore
            window.removeEventListener("touchend", this.stopMove, true);
            switch (this.activeBorder.getOrientation()) {
                case "vertical":
                    //@ts-ignore
                    window.removeEventListener("mousemove", this.moveX, true);
                    //@ts-ignore
                    window.removeEventListener("touchmove", this.moveX, true);
                    break;
                case "horizontal":
                    //@ts-ignore
                    window.removeEventListener("mousemove", this.moveY, true);
                    //@ts-ignore
                    window.removeEventListener("touchmove", this.moveY, true);
                    break;
            }
            this.getSizer().offResultChange(this.updateOffsets);
            this.getSizer().applyResult();
            this.activeBorder = null;
        });
        this.startMove = bindTo(this, function startMove(evt) {
            const h = evt.target["IBorder"];
            if (!(h instanceof DomBorder))
                return;
            this.activeBorder = h;
            //@ts-ignore
            window.addEventListener("mouseup", this.stopMove, true);
            //@ts-ignore
            window.addEventListener("touchend", this.stopMove, true);
            switch (h.getOrientation()) {
                case "vertical":
                    if (evt instanceof MouseEvent) {
                        evt.stopImmediatePropagation();
                        evt.preventDefault();
                        this.start = evt.clientX;
                    }
                    else {
                        this.start = evt.touches[0].clientX;
                    }
                    this.prev = this.findPrev(this.start, true);
                    this.next = this.prev + 1;
                    //@ts-ignore
                    window.addEventListener("mousemove", this.moveX, true);
                    //@ts-ignore
                    window.addEventListener("touchmove", this.moveX, true);
                    break;
                case "horizontal":
                    if (evt instanceof MouseEvent) {
                        evt.stopImmediatePropagation();
                        evt.preventDefault();
                        this.start = evt.clientY;
                    }
                    else {
                        this.start = evt.touches[0].clientY;
                    }
                    this.prev = this.findPrev(this.start, true);
                    this.next = this.prev + 1;
                    //@ts-ignore
                    window.addEventListener("mousemove", this.moveY, true);
                    //@ts-ignore
                    window.addEventListener("touchmove", this.moveY, true);
                    break;
            }
            this.getSizer().onResultChange(this.updateOffsets);
        });
        this.element = element;
        //document.addEventListener("DOMContentLoaded", this.initDom.bind(this));
        this.initDom ()
    }
    initDom() {
        for (var c of this.element.children) {
            if (!(c instanceof HTMLElement || c instanceof SVGElement))
                continue;
            this.blocks.push(new DomBlock(c, this));
        }
        window.addEventListener("resize", this.onResize);
        super.init();
    }
    // STACK IMPLEMENTATION
    // Properties
    initDirection() {
        return this.element.classList.contains("horizontal")
            ? "horizontal"
            : "vertical";
    }
    /**
     * Obtient la largeur de la pile si `getDirection() == "vertical"` sinon obtient sa hauteur.
     */
    getContainerSize() {
        return this.getDirection() == "horizontal"
            ? this.element.clientWidth
            : this.element.clientHeight;
    }
    // Children
    initSizes() {
        const blocks = this.getBlocks();
        const sizes = new Array(blocks.length);
        var rest = this.getContainerSize();
        var cnull = 0;
        for (var i = 0; i < blocks.length; i++) {
            //@ts-ignore
            var n = blocks[i].element.dataset.size | 0;
            if (n <= 0) {
                sizes[i] = 0;
                cnull++;
            }
            else {
                sizes[i] = n;
                rest -= n;
            }
        }
        if (rest > 0) {
            var n = (rest / cnull) | 0;
            for (var i = 0; i < sizes.length; i++) {
                if (sizes[i] == 0)
                    sizes[i] = n;
            }
        }
        return sizes;
    }
    initMinSizes() {
        const blocks = this.getBlocks();
        const mins = new Array(blocks.length);
        for (var i = 0; i < blocks.length; i++) {
            //@ts-ignore
            mins[i] = blocks[i].element.dataset.minSize | 0;
        }
        return mins;
    }
    initGlues() {
        const blocks = this.getBlocks();
        const glues = new Array(blocks.length);
        for (var i = 0; i < blocks.length; i++) {
            //@ts-ignore
            glues[i] = blocks[i].element.dataset.glue | 0;
        }
        return glues;
    }
    getBlocks() {
        return this.blocks;
    }
    getBorders() {
        return this.borders;
    }
    createBlock() {
        const e = document.createElement("div");
        e.classList.add("j-block");
        return new DomBlock(e, this);
    }
    createBorder() {
        const e = document.createElement("div");
        const o = this.getDirection() == "horizontal" ? "vertical" : "horizontal";
        e.classList.add("sizer-handle", o);
        const b = new DomBorder(e, o);
        e["IBorder"] = b; // quick access for dom events
        return b;
    }
    appendBlock(block) {
        if (this.blocks.indexOf(block) >= 0)
            return;
        this.element.append(block.element);
        this.blocks.push(block);
    }
    appendBorder(border) {
        if (this.borders.indexOf(border) >= 0)
            return;
        this.attachEvents(border);
        this.borders.push(border);
        this.element.append(border.element);
    }
    removeBlock(block) {
        const i = this.blocks.indexOf(block);
        if (i < 0)
            return;
        this.blocks.splice(i, 1);
        block.element.remove();
    }
    removeBorder(border) {
        const i = this.borders.indexOf(border);
        if (i < 0)
            return;
        this.detachEvents(border);
        this.borders.splice(i, 1);
        border.element.remove();
    }
    // DOM EVENTS
    activeBorderEvents() {
        window.addEventListener("resize", this.onResize);
        for (let b of this.getBorders())
            this.attachEvents(b);
    }
    disableBorderEvents() {
        window.removeEventListener("resize", this.onResize);
        for (let b of this.getBorders())
            this.detachEvents(b);
    }
    attachEvents(border) {
        //@ts-ignore
        border.element.addEventListener("mousedown", this.startMove, true);
        //@ts-ignore
        border.element.addEventListener("touchstart", this.startMove, { capture: true, passive: true });
    }
    detachEvents(border) {
        //@ts-ignore
        border.element.removeEventListener("mousedown", this.startMove, true);
        //@ts-ignore
        border.element.removeEventListener("touchstart", this.startMove, { capture: true, passive: true });
    }
    findPrev(pos, useMiddleAxis) {
        const axis = this.getSizer().computeAxis();
        for (var i = 1; i < axis.length; i++) {
            if (pos < axis[i]) {
                return useMiddleAxis
                    ? pos - axis[i - 1] < axis[i] - pos ? i - 2 : i - 1
                    : i - 1;
            }
        }
    }
}
