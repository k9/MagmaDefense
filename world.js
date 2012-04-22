function World(slices) {
    this.slices = slices;

    this.magma = new WorldLayer(this, slices, 10, 0, 60,
        function(i) { return 50 + Math.random() * 5; },
        smoothInterp);

    this.rock = new WorldLayer(this, slices, 5, 0, 50,
        function(i) { return 30 + Math.random() * 10; },
        bumpyInterp);  

    this.dirt = new WorldLayer(this, slices, 0, 0, 30,
        function(i) { return 15 + Math.random() * 10; }, 
        bumpyInterp); 

    this.water = new WaterLayer(this, slices, -5, 10, 10, 10);   

    this.gold = new WaterLayer(this, slices, -5, 0, 15, 15);

    this.makeMeshes();

    this.skyMesh = CSG.sphere({
        radius: 500
    }).toMesh();

    this.skyMesh.compile();

    this.selector = new GL.Mesh();
    var angle = Math.PI * 2 / slices;
    var x = Math.sin(angle) * -400;
    var y = Math.cos(angle) * -400;
    this.selector.vertices.push([x, 20, y], [-x, 20, y], [0, 20, 0]);
    this.selector.triangles.push([0, 1, 2]);
    this.selector.compile();
}

$.extend(World.prototype, {
    modifyRegion: function(layerName, slice, amount) {
        if(this[layerName].modifyRegion(slice, amount))
            this.makeMeshes();
    },

    makeMeshes: function() {
        var dirtMin = 1000000;
        for(var i = 0; i < this.slices; i++) {
            this.magma.totalRadii[i] = this.magma.radii[i];
            this.rock.totalRadii[i] = this.rock.radii[i] + this.magma.totalRadii[i];
            this.dirt.totalRadii[i] = this.dirt.radii[i] + this.rock.totalRadii[i];
            dirtMin = Math.min(dirtMin, this.dirt.totalRadii[i]);
        }

        this.gold.startAt = 0;
        this.water.startAt = dirtMin;

        this.gold.makeMesh();
        this.magma.makeMesh();
        this.rock.makeMesh();
        this.dirt.makeMesh();
        this.water.makeMesh();
    },

    isMax: function(layerName, slice) {
        var layer = this[layerName];
        return layer.sliceHeight(slice) >= layer.maxHeight;
    },

    isMin: function(layerName, slice) {
        var layer = this[layerName];
        return layer.sliceHeight(slice) <= layer.minHeight;
    },    
});