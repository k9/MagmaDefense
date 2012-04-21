function mix(start, end, mix) {
    return start * (1 - mix) + end * mix;
}

function bindFn(fn, thisObject) {
    return function() { fn.apply(thisObject, arguments); };
}