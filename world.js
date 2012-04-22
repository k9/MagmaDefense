function World(worldSlices) {
    this.magmaLayer = new WorldLayer(worldSlices, 10, 60, 70,
        function(i) { return 60; },
        smoothInterp);

    this.rockLayer = new WorldLayer(worldSlices, 5, 5, 15,
        function(i) { return 10 + Math.random() * 5; },
        bumpyInterp);  

    this.dirtLayer = new WorldLayer(worldSlices, 0, 5, 15,
        function(i) { return 10 + Math.random() * 5; }, 
        bumpyInterp); 

    this.waterLayer = new WaterLayer(worldSlices, 0, 5, 15,
        function(i) { return 10 + Math.random() * 5; }, 
        bumpyInterp);

    this.makeMeshes();

    this.selector = new GL.Mesh();
    var angle = Math.PI / worldSlices;
    var size = 200;
    var x = Math.sin(angle) * 200;
    var y = Math.cos(angle) * 200;
    this.selector.vertices.push([x, 20, y], [-x, 20, y], [0, 20, 0]);
    this.selector.triangles.push([0, 1, 2]);
    this.selector.compile();
}

function smoothInterp(before, from, to, after, pct) {
    var beforeTarget = from + (from - before);
    var afterTarget = to + (to - after);
    var startMix = mix(from, beforeTarget, pct / 2);
    var endMix = mix(afterTarget, to, pct / 2);
    var weightedMix = mix(startMix, endMix, pct);

    return clamp(weightedMix, Math.min(from, to), Math.max(from, to));
}

function bumpyInterp(before, from, to, after, pct) {
    return smoothInterp(before, from, to, after, pct) + Math.random() * 0.5;
}

function WorldLayer(slices, z, minHeight, maxHeight, heightFn, interpFn) {
    this.z = z;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.interpFn = interpFn;
    this.totalRadii = [];
    this.radii = [];
    for(var i = 0; i < slices; i++)
        this.radii[i] = heightFn(i);
}

$.extend(WorldLayer.prototype, {
    makeMesh: function() {
        radiiCount = this.totalRadii.length;
        detailRadii = [];
        for(var i = 0; i < radiiCount; i++) {
            var before = this.totalRadii[mod(i - 1, radiiCount)];
            var from = this.totalRadii[i];
            var to = this.totalRadii[mod(i + 1, radiiCount)];
            var after = this.totalRadii[mod(i + 2, radiiCount)];

            var detail = 8;
            for(var j = 0; j < detail; j++)
                detailRadii[i * detail + j] = this.interpFn(before, from, to, after, j / detail);
        }

        layer.mesh = CSG.bumpyCylinder({
            start: [0, -5 + layer.z, 0],
            end: [0, 5 + layer.z, 0],
            sliceArray: detailRadii
        }).toMesh();

        layer.mesh.compile();
    },

    modifyRegion: function(slice, amount) {
        var layer = this[layerName + "Layer"];
        if(layerName == "water") {
            for(var i = 0; i < layer.radii.length; i++)
                layer.radii[i] += amount;
        }
        else {
            layer.radii[slice] = clamp(layer.radii[slice] + amount, layer.minHeight, layer.maxHeight);
        }

        this.makeMeshes();
    }
};

$.extend(World.prototype, {
    modifyRegion: function(layerName, slice, amount) {
        this[layerName + "Layer"].modifyRegion(slice, amount);
        this.makeMeshes();
    },

    makeMeshes: function() {
        for(var i = 0; i < this.magmaLayer.radii.length; i++) {
            this.magmaLayer.totalRadii[i] = this.magmaLayer.radii[i];
            this.rockLayer.totalRadii[i] = this.rockLayer.radii[i] + this.magmaLayer.totalRadii[i];
            this.dirtLayer.totalRadii[i] = this.dirtLayer.radii[i] + this.rockLayer.totalRadii[i];
        }

        this.makeMesh(this.magmaLayer);
        this.makeMesh(this.rockLayer);
        this.makeMesh(this.dirtLayer);
    },

    makeMesh: function(layer) {
        radiiCount = layer.totalRadii.length;
        detailRadii = [];
        for(var i = 0; i < radiiCount; i++) {
            var before = layer.totalRadii[mod(i - 1, radiiCount)];
            var from = layer.totalRadii[i];
            var to = layer.totalRadii[mod(i + 1, radiiCount)];
            var after = layer.totalRadii[mod(i + 2, radiiCount)];

            var detail = 8;
            for(var j = 0; j < detail; j++)
                detailRadii[i * detail + j] = layer.interpFn(before, from, to, after, j / detail);
        }

        layer.mesh = CSG.bumpyCylinder({
            start: [0, -5 + layer.z, 0],
            end: [0, 5 + layer.z, 0],
            sliceArray: detailRadii
        }).toMesh();

        layer.mesh.compile();
    }
});