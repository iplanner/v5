export function outsideIgnore(event, collection) {
    if (!Array.isArray(collection) || collection.length === 0) {
        return true;
    }
    return !collection.some(selector => event.target.closest(selector) !== null);
}