/**
 * @file Contient les définitions de pile d'objets verticaux ou horizontaux
 * @version 1.0.0
 * @author Vrecq Jean-marie
 */
import { Sizer } from "./sizer.js";
/**
 * Identique à `Function.binto` mais avec typage de retour.
 */
export function bindTo(target, func) {
    return func.bind(target);
}
export class Stack {
    constructor() {
        /**
         * Crée ou supprime des éléments de bordures.
         */
        this.updateBorders = bindTo(this, function () {
            const borders = this.getBorders();
            const n = this.sizer.refSizes().length - 1;
            if (n < borders.length) {
                for (var i = borders.length - 1; i >= n; i--) {
                    var h = borders[i];
                    this.removeBorder(h);
                }
                borders.length = n;
            }
            else if (borders.length < n) {
                for (var i = borders.length; i < n; i++) {
                    var h = this.createBorder();
                    this.appendBorder(h);
                    borders[i] = h;
                }
            }
        });
        /**
         * Met à jour la position des blocks et des bordures.
         */
        this.updateOffsets = bindTo(this, function update() {
            const blocks = this.getBlocks();
            const borders = this.getBorders();
            const axis = this.sizer.computeAxis();
            const sizes = this.sizer.refSizes();
            const blockCount = sizes.length;
            for (var i = 0; i < blockCount - 1; i++) {
                borders[i].setOffset(axis[i + 1]);
            }
            for (var i = 0; i < blockCount; i++) {
                blocks[i].setOffset(axis[i]);
                blocks[i].setSize(sizes[i]);
            }
        });
        /**
         * Met à jour la position des bordures.
         */
        this.updateBorderOffsets = bindTo(this, function update() {
            const borders = this.getBorders();
            const axis = this.sizer.computeAxis();
            for (var i = 0; i < axis.length - 2; i++) {
                borders[i].setOffset(axis[i + 1]);
            }
        });
    }
    init() {
        this.direction = this.initDirection();
        const thisSize = this.getContainerSize();
        this.sizer = new Sizer(this.initSizes(), this.initMinSizes(), this.initGlues());
        this.sizer.stretch(thisSize);
        this.updateBorders();
        this.updateOffsets();
        this.sizer.onSizesChange(this.updateOffsets);
    }
    getSizer() {
        return this.sizer;
    }
    /**
     * Obtient la direction de la pile.
     */
    getDirection() {
        return this.direction;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi90cy9zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUtsQzs7R0FFRztBQUNILE1BQU0sVUFBVSxNQUFNLENBQWtELE1BQVMsRUFBRSxJQUFzQjtJQUVyRyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUUsTUFBTSxDQUEwQixDQUFBO0FBQ3RELENBQUM7QUF5QkQsTUFBTSxPQUFnQixLQUFLO0lBQTNCO1FBOENJOztXQUVHO1FBQ08sa0JBQWEsR0FBRyxNQUFNLENBQUUsSUFBSSxFQUFFO1lBRXBDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUcsQ0FBQTtZQUNsQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7WUFFM0MsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFDdEI7Z0JBQ0ksS0FBSyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRyxDQUFDLElBQUksQ0FBQyxFQUFHLENBQUMsRUFBRSxFQUFFO29CQUM1QyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ2xCLElBQUksQ0FBQyxZQUFZLENBQUUsQ0FBQyxDQUFDLENBQUE7aUJBQ3hCO2dCQUNELE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO2FBQ3JCO2lCQUNJLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzNCO2dCQUNJLEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRyxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsRUFBRSxFQUFFO29CQUN2QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFHLENB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