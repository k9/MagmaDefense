function World(worldSlices) {
    this.dirtLayer = new Array(worldSlices);
    for(var i = 0; i < this.dirtLayer.length; i ++) {
        this.dirtLayer[i] = 100;
    }

    this.makeMesh(this.dirtLayer);
}

$.extend(World.prototype, {
    growRegion: function(slice, layer) {
        this.dirtLayer[slice] += 1;
        this.makeMesh(this.dirtLayer);
    },

    shrinkRegion: function(slice, layer) {
        this.dirtLayer[slice] -= 1;
        this.makeMesh(this.dirtLayer);
    },

    makeMesh: function(layer) {
        layer.mesh = CSG.bumpyCylinder({
            start: [0, -5, 0],
            end: [0, 5, 0],
            sliceArray: layer
        }).toMesh();

        layer.mesh.compile();
    }
});