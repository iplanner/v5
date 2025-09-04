export function isEqual(valA, valB, deep = true, explicit = ['__key']) {
    if (valA === valB) return true;
    if (typeof valB === 'object' && typeof valA === 'object') {
        if (valA instanceof Map) return false;
        if (valA instanceof Set) return false;
        if (valA instanceof Date && valB instanceof Date)
            return valA.getTime() === valB.getTime();
        if (valA instanceof RegExp && valB instanceof RegExp)
            return eqRegExp(valA, valB); // Stellen Sie sicher, dass eqRegExp woanders in Ihrem Code definiert ist.
        if (valA === null || valB === null) return false;
        if (Object.keys(valA).length !== Object.keys(valB).length) return false;
        for (const k of explicit) {
            if ((k in valA || k in valB) && valA[k] !== valB[k]) return false;
        }
        for (const key in valA) {
            if (!(key in valB)) return false;
            if (valA[key] !== valB[key] && !deep) return false;
            if (deep && !eq(valA[key], valB[key], deep, explicit)) return false;
        }
        return true;
    }
    return false;
}
