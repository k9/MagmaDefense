function rgbByteToFloat(r, g, b) {
    return [r / 256, g / 256, b / 256];
}

function mix(start, end, mix) {
    return start * (1 - mix) + end * mix;
}

function mod(x, y) {
    return ((x % y) + y) % y;
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

function bindFn(fn, thisObject) {
    return function() { fn.apply(thisObject, arguments); };
}