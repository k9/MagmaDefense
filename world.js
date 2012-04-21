function World(worldSlices) {
    this.magmaLayer = new WorldLayer(this, worldSlices, 10, 
        function(i) { return 50 + Math.random() * 0; },
        smoothInterp);

    this.rockLayer = new WorldLayer(this, worldSlices, 5, 
        function(i) { return 75 + Math.random() * 0; },
        smoothInterp);  

    this.dirtLayer = new WorldLayer(this, worldSlices, 0,
        function(i) { return 95 + Math.random() * 0; }, 
        smoothInterp);

    this.waterLayer = new WorldLayer(this, worldSlices, -5, 
        function(i) { return 100; },
        smoothInterp);  

    this.selector = new GL.Mesh();
    var angle = Math.PI * 2 / worldSlices;
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
    var startMix = mix(from, beforeTarget, pct);
    var endMix = mix(afterTarget, to, pct);
    var weightedMix = mix(startMix, endMix, pct);

    return clamp(weightedMix, Math.min(from, to), Math.max(from, to));
}

function WorldLayer(world, slices, z, heightFn, interpFn) {
    this.z = z;
    this.interpFn = interpFn;
    this.radii = [];
    for(var i = 0; i < slices; i++)
        this.radii[i] = heightFn(i);

    world.makeMesh(this);
}

$.extend(World.prototype, {
    modifyRegion: function(slice, layerName, amount) {
        var layer = this[layerName + "Layer"];
        if(layerName == "water") {
            for(var i = 0; i < layer.radii.length; i++)
                layer.radii[i] += amount;
        }
        else {
            layer.radii[slice] += amount;
        }

        this.makeMesh(layer);
    },

    makeMesh: function(layer) {
        radiiCount = layer.radii.length;
        detailRadii = [];
        for(var i = 0; i < radiiCount; i++) {
            var before = layer.radii[mod(i - 1, radiiCount)];
            var from = layer.radii[i];
            var to = layer.radii[mod(i + 1, radiiCount)];
            var after = layer.radii[mod(i + 2, radiiCount)];

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