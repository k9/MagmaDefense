function World(slices) {
    this.slices = slices;

    this.magmaLayer = new WorldLayer(this, slices, 10, 80, 90,
        function(i) { return 80 + Math.random() * 3; },
        smoothInterp);

    this.rockLayer = new WorldLayer(this, slices, 5, 5, 35,
        function(i) { return 10 + Math.random() * 15; },
        bumpyInterp);  

    this.dirtLayer = new WorldLayer(this, slices, 0, 5, 35,
        function(i) { return 10 + Math.random() * 15; }, 
        bumpyInterp); 

    this.waterLayer = new WaterLayer(this, slices, -5, -5, 5, 0);   

    this.makeMeshes();

    this.selector = new GL.Mesh();
    var angle = Math.PI / slices;
    var size = 200;
    var x = Math.sin(angle) * 400;
    var y = Math.cos(angle) * 400;
    this.selector.vertices.push([x, 20, y], [-x, 20, y], [0, 20, 0]);
    this.selector.triangles.push([0, 1, 2]);
    this.selector.compile();
}

$.extend(World.prototype, {
    modifyRegion: function(layerName, slice, amount) {
        if(this[layerName + "Layer"].modifyRegion(slice, amount))
            this.makeMeshes();
    },

    makeMeshes: function() {
        var dirtSum = 0;
        for(var i = 0; i < this.slices; i++) {
            this.magmaLayer.totalRadii[i] = this.magmaLayer.radii[i];
            this.rockLayer.totalRadii[i] = this.rockLayer.radii[i] + this.magmaLayer.totalRadii[i];
            this.dirtLayer.totalRadii[i] = this.dirtLayer.radii[i] + this.rockLayer.totalRadii[i];
            dirtSum += this.dirtLayer.totalRadii[i];
        }

        this.waterLayer.startAt = dirtSum / this.slices;

        this.magmaLayer.makeMesh();
        this.rockLayer.makeMesh();
        this.dirtLayer.makeMesh();
        this.waterLayer.makeMesh();
    },

    isMax: function(layerName, slice) {
        var layer = this[layerName + "Layer"];
        return layer.sliceHeight(slice) >= layer.maxHeight;
    },

    isMin: function(layerName, slice) {
        var layer = this[layerName + "Layer"];
        return layer.sliceHeight(slice) <= layer.minHeight;
    },    
});