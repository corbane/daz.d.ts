const isArray = Array.isArray;
function resizeArray(arr, count, val) {
    var i = arr.length;
    arr.length = count;
    if (typeof val == "function")
        for (; i < count; i++)
            arr[i] = val(i);
    else
        for (; i < count; i++)
            arr[i] = val;
}
export class Sizer {
    constructor(sizes, minis, glues) {
        // applyChanges (copyResult: boolean)
        // {
        //     const count  = this.sizes.length
        //
        //     resizeArray (this.glues, count, Sizer.DEFAULT_GLUE)
        //     resizeArray (this.memos, count, -1)
        //     resizeArray (this.result, count, 0)
        //
        //     if (copyResult) this.applyResult ()
        // }
        // Events
        this.onResultCallbacks = [];
        this.onSizesCallbacks = [];
        sizes = isArray(sizes) ? sizes : [];
        this.sizes = sizes;
        this.minis = isArray(minis) ? minis : [];
        this.glues = isArray(glues) ? glues : [];
        this.memos = [];
        this.dirty = true;
        this.result = [].concat(this.sizes);
        // Agrandis ou réduit les tableaux pour qu'ils correspondent à `this.sizes`.
        resizeArray(this.glues, sizes.length, Sizer.DEFAULT_GLUE);
        resizeArray(this.memos, sizes.length, -1);
        resizeArray(this.result, sizes.length, 0);
        resizeArray(this.minis, sizes.length, 10);
    }
    isDirty() { return this.dirty; }
    totalSize() {
        return this.sizes.reduce((p, v) => v + p);
    }
    refSizes() {
        return this.dirty ? this.result : this.sizes;
    }
    /**
     * Retourne les valeurs cumulées des dimensions
     * @note
     * - pour `sizes = [1, 5, 10]`, `axis = [0, 1, 6]`
     * La dénomination de la variable est trompeuse,
     * les valeurs contenues représentent le décalage de chaque dimension
     */
    computeAxis() {
        const result = this.refSizes();
        const axis = new Array(result.length + 1);
        axis[0] = 0;
        for (var c = 0; c < result.length; c++) {
            axis[c + 1] = axis[c] + result[c];
        }
        return axis;
    }
    /**
     * Applique les nouvelles dimensions
     */
    applyResult() {
        const sizes = this.sizes;
        const result = this.result;
        for (var i = 0; i < sizes.length; i++)
            sizes[i] = result[i];
        for (var cb of this.onSizesCallbacks)
            cb();
    }
    onResultChange(callback) {
        if (this.onResultCallbacks.indexOf(callback) < 0)
            this.onResultCallbacks.push(callback);
    }
    offResultChange(callback) {
        const i = this.onResultCallbacks.indexOf(callback);
        if (i < 0)
            return;
        this.onResultCallbacks.splice(i, 1);
    }
    onSizesChange(callback) {
        if (this.onSizesCallbacks.indexOf(callback) < 0)
            this.onSizesCallbacks.push(callback);
    }
    offSizesChange(callback) {
        const i = this.onSizesCallbacks.indexOf(callback);
        if (i < 0)
            return;
        this.onSizesCallbacks.splice(i, 1);
    }
    // Open - Close
    collapse(index) {
        const sizes = this.sizes;
        const mins = this.minis;
        const mems = this.memos;
        debug: {
            console.assert(0 <= index && index <= sizes.length);
        }
        if (sizes.length < 2)
            return;
        if (sizes[index] == mins[index])
            return;
        if (index == sizes.length - 1) {
            var o = sizes[index] - mins[index];
            var i = sizes.length - 2;
        }
        else {
            var o = mins[index] - sizes[index];
            var i = index;
        }
        mems[index] = o;
        this.resize(i, i + 1, o);
    }
    expand(index) {
        const sizes = this.sizes;
        const mems = this.memos;
        debug: {
            console.assert(0 <= index && index <= sizes.length);
        }
        if (sizes.length < 2)
            return;
        if (mems[index] === -1)
            return;
        if (index == sizes.length - 1) {
            var i = sizes.length - 2;
        }
        else {
            var i = index;
        }
        this.resize(i, i + 1, mems[index] * -1);
        mems[index] = -1;
    }
    toggle(index) {
        if (this.memos[index] === -1)
            this.collapse(index);
        else
            this.expand(index);
    }
    // Resize
    /**
     * Procédure principale de redimensionnement.
     * @param i Index de valeur précédent.
     * @param j Index de valeur suivant.
     * @param dir Direction du décalage.
     * @param iend Limite d’index de valeur précédent
     * @param jend Limite d’index de valeur suivant
     * @param offset Décalage souhaité.
     * @note
     * - Si `offset < 0` alors
     *   - `dir == -1`
     *   - `i < j`
     *   - `iend >= -1`
     *   - `jend <= this.sizes.length`
     * - Si `offset >= 0` alors
     *   - `dir == 1`
     *   - `i > j`
     *   - `iend <= this.sizes.length`
     *   - `jend >= -1`
     */
    __resize(i, j, dir, iend, jend, offset) {
        // const map = ... : ICell[]
        const sizes = this.sizes;
        const mins = this.minis;
        const result = this.result;
        const glue = this.glues;
        const total = sizes.reduce((prevVal, curVal) => prevVal + curVal);
        // decrease
        if (sizes[j] < glue[j] && offset < glue[j]) {
            for (var k = 0; k != sizes.length; k++)
                result[k] = sizes[k];
            return;
        }
        var del = offset;
        var add = 0;
        do {
            // var size = map[i].getSize ()
            // var min  = map[i].getMinSize ()
            if (sizes[i] - mins[i] < del) {
                result[i] = mins[i];
                add += mins[i];
                del -= sizes[i] - mins[i];
            }
            else {
                // var glue = map[i].getGlue ()
                result[i] = sizes[i] - del;
                if (result[i] < glue[i]) {
                    offset += (result[i] - mins[i]);
                    result[i] = mins[i];
                }
                add += result[i];
                break;
            }
            i += dir;
        } while (i != iend);
        if (i != iend) {
            for (i += dir; i != iend; i += dir) {
                // var size = map[i].getSize ()
                result[i] = sizes[i];
                add += sizes[i];
            }
        }
        // increase
        dir *= -1;
        for (var k = j + dir; k != jend; k += dir) {
            // var size = map[k].getSize ()
            result[k] = sizes[k];
            add += sizes[k];
        }
        // stretch
        // var size = map[j].getSize ()
        if (total < add + sizes[j] + offset)
            result[j] = total - add;
        else
            result[j] = sizes[j] + offset;
    }
    /**
     * Redimensionne les valeurs.
     * @param prev Index de la valeur précédent.
     * @param next Index de la valeur suivant.
     * @param offset Décalage souhaité.
     * @note
     * - Si `offset` est négatif, la ou les valeurs précédentes seront réduites et la valeur suivante augmentera.
     * - Si `offset` est positif, la ou les valeurs suivantes seront réduites et la valeur précédente augmentera.
     */
    resize(prev, next, offset) {
        if (offset == 0)
            return;
        const sizes = this.sizes;
        debug: {
            console.assert(0 <= prev && prev <= sizes.length);
            console.assert(0 <= next && next <= sizes.length);
            console.assert(sizes.length == this.minis.length);
        }
        if (offset < 0)
            this.__resize(prev, next, -1, -1, sizes.length, -offset);
        else
            this.__resize(next, prev, 1, sizes.length, -1, offset);
        this.dirty = true;
        for (var cb of this.onResultCallbacks)
            cb();
    }
    // Stretch
    /**
     * Effectue une homothétie de l’ensemble des valeurs.
     * @param desiredSize - Taille total désiré après la mise à l’échelle.
     */
    stretch(desiredSize, applyResult = true) {
        debug: {
            console.assert(desiredSize == (desiredSize | 0), "desiredSize argument must be an integer");
        }
        const sizes = this.sizes;
        const mins = this.minis;
        const result = this.result;
        const total = sizes.reduce((p, c) => p + c);
        var f = desiredSize / total;
        if (!isFinite(f))
            f = 1;
        // Apply scale to all items - 1
        var cumul = 0;
        for (var i = 1; i < sizes.length; i++) {
            var s = Math.round(sizes[i] * f);
            result[i] = s < mins[i] ? mins[i] : s;
            cumul += s;
        }
        // Stretch first item size
        var s = desiredSize - cumul;
        if (s < mins[0])
            s = mins[0];
        result[0] = s;
        this.dirty = true;
        if (applyResult === true)
            this.applyResult();
    }
    //
    equalize(applyResult = true) {
        const sizes = this.sizes;
        const result = this.result;
        var c = 0; // count
        var t = 0; // total
        for (var i = 0; i < sizes.length; i++)
            if (sizes[i] !== 0)
                c++, t += sizes[i];
        var s = t / c | 0;
        result[0] = t - s * (c - 1);
        for (var i = 1; i < sizes.length; i++) {
            if (sizes[i] !== 0) {
                result[i] = s;
            }
            else {
                result[i] = 0;
            }
        }
        this.dirty = true;
        if (applyResult === true)
            this.applyResult();
    }
}
Sizer.DEFAULT_GLUE = 80;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2l6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi90cy9zaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFBO0FBUTdCLFNBQVMsV0FBVyxDQUFFLEdBQVUsRUFBRSxLQUFhLEVBQUUsR0FBUTtJQUVyRCxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFBO0lBQ2xCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFBO0lBQ2xCLElBQUksT0FBTyxHQUFHLElBQUksVUFBVTtRQUN4QixPQUFRLENBQUMsR0FBRyxLQUFLLEVBQUcsQ0FBQyxFQUFFO1lBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBRSxDQUFDLENBQUMsQ0FBQTs7UUFFekMsT0FBUSxDQUFDLEdBQUcsS0FBSyxFQUFHLENBQUMsRUFBRTtZQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7QUFDN0MsQ0FBQztBQUVELE1BQU0sT0FBTyxLQUFLO0lBb0JkLFlBQWEsS0FBZ0IsRUFBRSxLQUFnQixFQUFFLEtBQWdCO1FBMkRqRSxxQ0FBcUM7UUFDckMsSUFBSTtRQUNKLHVDQUF1QztRQUN2QyxFQUFFO1FBQ0YsMERBQTBEO1FBQzFELDBDQUEwQztRQUMxQywwQ0FBMEM7UUFDMUMsRUFBRTtRQUNGLDBDQUEwQztRQUMxQyxJQUFJO1FBRUosU0FBUztRQUVELHNCQUFpQixHQUFHLEVBQW9CLENBQUE7UUFDeEMscUJBQWdCLEdBQUcsRUFBb0IsQ0FBQTtRQXZFM0MsS0FBSyxHQUFHLE9BQU8sQ0FBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUUsS0FBSyxDQUFDLENBQUMsQ0FB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