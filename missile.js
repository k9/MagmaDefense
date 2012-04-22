var worldHeight = 275;
function Missile(world) {
    this.world = world;
    this.active = false;
    this.height = 0;
    this.health = 100;
    
    this.sliceDamage = 30; 
    this.sliceMinor = 2;
    this.missileDamage = 1;
    this.missileCritical = 25;

    this.mesh = CSG.cylinder({
        slices: 8,
        start: [0, 0, 0],
        end: [0, 0, 20],
        radius: 4.0
    }).union(CSG.cube({ radius: 2.0, center: [5, 0, 20] }))
    .union(CSG.cube({ radius: 2.0, center: [-5, 0, 20] })).toMesh();

    this.mesh.compile();

    this.stripe = CSG.cylinder({
        slices: 8,
        start: [0, 0, 3],
        end: [0, 0, 11],
        radius: 3.0
    }).toMesh();

    this.stripe.compile();
}

$.extend(Missile.prototype, {
    start: function(slice, type) {
        this.hit = false;
        this.layersHit = { gold: false, magma: false, rock: false, dirt: false, water: false };
        this.type = type;
        this.slice = slice;
        this.height = worldHeight;
        this.active = true;
        this.health = 100;
    },

    update: function(seconds) {
        this.height -= seconds * 200;

        var that = this;
        var changed = false;
        $.each(["dirt", "rock", "magma", "gold"], function(i, name) {
            var layerHeight = that.world[name].totalSliceHeight(that.slice);
            var dirtHeight = that.world["dirt"].totalSliceHeight(that.slice);
            if(that.health > 0 && !that.layersHit[name] && that.height < layerHeight) {
                this.hit = true;
                changed = true;
                that.layersHit[name] = true;

                var sliceDamage = that.sliceDamage;
                var missileDamage = that.missileDamage;
                if(name != that.type) {
                    sliceDamage = that.sliceMinor;
                    missileDamage = that.missileCritical;
                }

                if(name == "gold") sliceDamage *= 0.1;
                if(name == "water") sliceDamage = 0;

                that.health -= missileDamage * that.world[name].sliceHeight(that.slice);
                that.world[name].modifyRegions(that.slice, -sliceDamage);
            }
        });
        if(changed) this.world.makeMeshes();

        if(this.health < 0 || this.height < 0) 
            this.active = false;
    }
});