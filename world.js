function World(worldSlices) {
    this.magmaLayer = new WorldLayer(this, worldSlices, 10, 
        function(i) { return 50 + Math.random() * 5; },
        smoothInterp);

    this.rockLayer = new WorldLayer(this, worldSlices, 5, 
        function(i) { return 75 + Math.random() * 5; },
        smoothInterp);  

    this.dirtLayer = new WorldLayer(this, worldSlices, 0,
        function(i) { return 95 + Math.random() * 10; }, 
        smoothInterp);

    this.waterLayer = new WorldLayer(this, worldSlices, -5, 
        function(i) { return 100; },
        smoothInterp);  

    this.selector = new GL.Mesh();
    var angle = Math.PI * 2 / worldSlices;
    var size = 200;
    var x = Math.sin(angle/2) * 200;
    var y = Math.cos(angle/2) * 200;
    this.selector.vertices.push([x, 20, y], [-x, 20, y], [0, 20, 0]);
    this.selector.triangles.push([0, 1, 2]);
    this.selector.compile();
}

function smoothInterp(from, to, pct) {
    return mix(from, to, pct);
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
        layer.radii[slice] += amount;
        this.makeMesh(layer);
    },

    makeMesh: function(layer) {
        radiiCount = layer.radii.length;
        smoothedRadii = [];
        for(var i = 0; i < radiiCount; i++) {
            var from = layer.radii[i];
            var to = layer.radii[(i + 1) % radiiCount];

            for(var j = 0; j < 4; j++)
                smoothedRadii[i * 4 + j] = layer.interpFn(from, to, j / 4);
        }

        layer.mesh = CSG.bumpyCylinder({
            start: [0, -5 + layer.z, 0],
            end: [0, 5 + layer.z, 0],
            sliceArray: smoothedRadii
        }).toMesh();

        layer.mesh.compile();
    }
});