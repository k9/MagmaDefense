var worldHeight = 275;
function Missile(game, world) {
    this.game = game;
    this.world = world;
    this.active = false;
    this.height = 0;
    
    this.sliceDamage = 15;

    this.mesh = CSG.cylinder({
        slices: 8,
        start: [0, 0, 0],
        end: [0, 0, 20],
        radius: 4.0
    }).union(CSG.sphere({ radius: 4.0, center: [0, 0, 0] }))
    .union(CSG.cube({ radius: 2.0, center: [5, 0, 20] }))
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
        this.type = type;
        this.slice = slice;
        this.height = worldHeight;
        this.active = true;
        this.submerged = false;
    },

    update: function(seconds) {
        var inWater = this.height < this.world["water"].totalSliceHeight();
        if(inWater && !this.submerged) {
            this.submerged = true;
            game.state.credits["water"] = Math.min(3, game.state.credits["water"] + 1);
            game.updateControls();
        }
        
        this.height -= inWater ? seconds * game.speed / 2 : seconds * game.speed;

        var that = this;
        var changed = false;
        $.each(["dirt", "rock", "magma", "gold"], function(i, name) {
            var layerHeight = that.world[name].totalSliceHeight(that.slice);
            var layerThickness = that.world[name].sliceHeight(that.slice);
            if(that.active && that.height < layerHeight && layerThickness > 0) {
                if(name == "gold") {
                    that.game.lose();
                    return;
                }

                var damage = inWater ? that.sliceDamage / 2 : that.sliceDamage;
                if(that.type == "fusion" || that.type == name)
                    damage *= 4;
                else {
                    game.state.credits[that.type] = Math.min(3, game.state.credits[that.type] + 1);
                    game.updateControls();
                }

                changed = true;
                that.active = false;
                that.world[name].modifyRegions(that.slice, -damage);
                that.world.makeMeshes();
            }
        });
    }
});