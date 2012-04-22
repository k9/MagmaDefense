function WorldLayer(world, slices, z, minHeight, maxHeight, heightFn, interpFn) {
    this.world = world;
    this.z = z;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.interpFn = interpFn;
    this.totalRadii = [];
    this.radii = [];
    for(var i = 0; i < slices; i++)
        this.radii[i] = heightFn(i);
}

var detail = 5;
$.extend(WorldLayer.prototype, {
    makeMesh: function() {
        radiiCount = this.totalRadii.length;
        detailRadii = [];
        for(var i = 0; i < radiiCount; i++) {
            var before = this.totalRadii[mod(i - 1, radiiCount)];
            var from = this.totalRadii[i];
            var to = this.totalRadii[mod(i + 1, radiiCount)];
            var after = this.totalRadii[mod(i + 2, radiiCount)];

            for(var j = 0; j < detail; j++)
                detailRadii[i * detail + j] = this.interpFn(before, from, to, after, j / detail);
        }

        this.mesh = CSG.bumpyCylinder({
            start: [0, -5 + this.z, 0],
            end: [0, 5 + this.z, 0],
            sliceArray: detailRadii
        }).toMesh();
    },

    modifyAll: function(amount, rnd) {
        for(var i = 0; i < this.radii.length; i++)
            this.modifyRegion(i, amount + Math.random() * rnd);
    },

    modifyRegion: function(slice, amount) {
        var newRadius = clamp(this.radii[slice] + amount, this.minHeight, this.maxHeight);
        if(newRadius < 5) newRadius = 0;
        var changed = (newRadius != this.radii[slice]);
        this.radii[slice] = newRadius;
        return changed;
    },

    modifyRegions: function(slice, amount) {
        this.modifyRegion(mod(slice - 2, this.radii.length), amount * 0.1);
        this.modifyRegion(mod(slice - 1, this.radii.length), amount * 0.5);
        this.modifyRegion(mod(slice + 1, this.radii.length), amount * 0.8);
        this.modifyRegion(slice, amount);
        this.modifyRegion(mod(slice + 1, this.radii.length), amount * 0.8);
        this.modifyRegion(mod(slice + 2, this.radii.length), amount * 0.5);
        this.modifyRegion(mod(slice + 3, this.radii.length), amount * 0.1);
    },

    erode: function() {
        var total = 0;
        for(var i = 0; i < this.radii.length; i++)
            total += this.radii[i];

        var avg = total / this.radii.length;

        for(var i = 0; i < this.radii.length; i++)
            this.radii[i] = mix(this.radii[i], avg, 0.1);       
    },

    totalSliceHeight: function(slice) { return this.totalRadii[slice]; },
    sliceHeight: function(slice) { return this.radii[slice]; }
});

function WaterLayer(world, slices, z, minHeight, maxHeight, height) {
    this.startAt = 0;
    this.world = world;
    this.slices = slices;
    this.z = z;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.height = height;
}

$.extend(WaterLayer.prototype, {
    makeMesh: function() {
        this.mesh = CSG.cylinder({
            slices: this.slices * detail,
            start: [0, -5 + this.z, 0],
            end: [0, 5 + this.z, 0],
            radius: this.startAt + this.height
        }).toMesh();

        this.mesh.compile();
    },

    modifyRegion: function(slice, amount) {
        var newRadius = clamp(this.height + amount, this.minHeight, this.maxHeight);
        var changed = (newRadius != this.height);
        this.height = newRadius;
        return changed;
    },

    totalSliceHeight: function(slice) { return this.startAt + this.height; },
    sliceHeight: function(slice) { return this.height; }
});

function smoothInterp(before, from, to, after, pct) {
    var beforeTarget = from + (from - before) / 2;
    var afterTarget = to + (to - after) / 2;
    var linear = mix(from, to, pct);
    var target = mix(beforeTarget, afterTarget, pct);
    var weighted = mix(target, linear, Math.abs(pct - 0.5) * 2);

    return clamp(weighted, Math.min(from, to), Math.max(from, to));
}

function bumpyInterp(before, from, to, after, pct) {
    return smoothInterp(before, from, to, after, pct) + Math.sin(before * from * to * after * pct) * 0.5;
}