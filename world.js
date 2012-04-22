function World(slices) {
    this.slices = slices;

    this.magma = new WorldLayer(this, slices, 10, 0, 65,
        function(i) { return 35 + Math.random() * 5; },
        smoothInterp);

    this.rock = new WorldLayer(this, slices, 5, 0, 75,
        function(i) { return 30 + Math.random() * 10; },
        bumpyInterp);  

    this.dirt = new WorldLayer(this, slices, 0, 0, 50,
        function(i) { return 15 + Math.random() * 10; }, 
        bumpyInterp); 

    this.water = new WaterLayer(this, slices, -5, 0, 0, 0);   

    this.gold = new WaterLayer(this, slices, -5, 0, 15, 15);

    this.makeMeshes();

    this.skyMesh = CSG.sphere({ radius: 500 }).toMesh();
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
        var dirtSum = 0;
        for(var i = 0; i < this.slices; i++) {
            this.magma.totalRadii[i] = this.magma.radii[i] + this.gold.height;
            this.rock.totalRadii[i] = this.rock.radii[i] + this.magma.totalRadii[i];
            this.dirt.totalRadii[i] = this.dirt.radii[i] + this.rock.totalRadii[i];
            dirtSum += this.dirt.totalRadii[i];
        }

        this.gold.startAt = 0;
        this.water.startAt = dirtSum / this.slices;

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