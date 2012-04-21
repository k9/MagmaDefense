function World(worldSlices) {
    this.magmaLayer = new WorldLayer(this, worldSlices, 5, function(i) { 
        return 50 + Math.random() * 5; 
    });  

    this.dirtLayer = new WorldLayer(this, worldSlices, 0, function(i) { 
        return 100 + Math.random() * 1; 
    }); 
}

function WorldLayer(world, slices, z, heightFn) {
    this.z = z;
    this.radii = new Array(slices);
    for(var i = 0; i < this.radii.length; i++)
        this.radii[i] = heightFn(i);

    world.makeMesh(this);
}

$.extend(World.prototype, {
    modifyRegion: function(slice, layer, amount) {
        this.dirtLayer.radii[slice] += amount;
        this.makeMesh(this.dirtLayer);
    },

    makeMesh: function(layer) {
        layer.mesh = CSG.bumpyCylinder({
            start: [0, -5 + layer.z, 0],
            end: [0, 5 + layer.z, 0],
            sliceArray: layer.radii
        }).toMesh();

        layer.mesh.compile();
    }
});