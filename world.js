function World(worldSlices) {
    this.magmaLayer = new WorldLayer(this, worldSlices, 10, function(i) { 
        return 50 + Math.random() * 5; 
    });

    this.rockLayer = new WorldLayer(this, worldSlices, 5, function(i) { 
        return 75 + Math.random() * 5; 
    });  

    this.dirtLayer = new WorldLayer(this, worldSlices, 0, function(i) { 
        return 100; 
    });

    this.waterLayer = new WorldLayer(this, worldSlices, -5, function(i) { 
        return 100; 
    });  
}

function WorldLayer(world, slices, z, heightFn) {
    this.z = z;
    this.radii = [];
    for(var i = 0; i < slices; i++)
        this.radii[i] = heightFn(i);

    world.makeMesh(this);
}

$.extend(World.prototype, {
    modifyRegion: function(slice, layer, amount) {
        this.dirtLayer.radii[slice] += amount;
        this.makeMesh(this.dirtLayer);
    },

    makeMesh: function(layer) {
        radiiCount = layer.radii.length;
        smoothedRadii = [];
        for(var i = 0; i < radiiCount; i++) {
            var current = layer.radii[i];
            smoothedRadii[i] = current;
        }

        layer.mesh = CSG.bumpyCylinder({
            start: [0, -5 + layer.z, 0],
            end: [0, 5 + layer.z, 0],
            sliceArray: smoothedRadii
        }).toMesh();

        layer.mesh.compile();
    }
});