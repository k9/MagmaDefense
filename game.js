window.Game = function() {
    this.gl = GL.create();
    $(this.gl.canvas).css({ width: "100%", height: "100%" });
    this.shaders = new Shaders();
    this.worldSlices = 16;

    this.currentLevel = 0;
    this.levels = [
        { missiles: 15, speed: 100 },
        { missiles: 30, speed: 125 },
        { missiles: 45, speed: 150 },
        { missiles: 60, speed: 150 },
        { missiles: 60, speed: 175 }
    ];

    var that = this;
    $(document).on({
        keydown: function(e) { that.keyChange(e.keyCode, true); },
        keyup: function(e) { that.keyChange(e.keyCode, false); }
    });

    $("#gameContainer").append(this.gl.canvas);
    setupRender(this.gl);
    this.gl.animate();
};

function GameState(game) {
    this.credits = { dirt: 0, rock: 0, magma: 0, water: 0 };
    this.cameraElevation = 90;
    this.cameraAngle = 0;
    this.activeSlice = 0;
}

$.extend(Game.prototype, {
    keys: { left: 37, right: 39, A: 65, S: 83, D: 68, F: 70},

    keyChange: function(code, pressed) {
        if(pressed) {
            if(code == this.keys.right) this.selectRegion(this.state.activeSlice - 1); 
            if(code == this.keys.left) this.selectRegion(this.state.activeSlice + 1);
            if(code == this.keys.A) this.addToRegion("dirt");
            if(code == this.keys.S) this.addToRegion("rock");
            if(code == this.keys.D) this.addToRegion("magma");
            if(code == this.keys.F) this.addToAll();
        }
    },

    addToAll: function() {
        if(this.state.credits["water"] == 3) {
            this.world["dirt"].modifyAll(3, 1);
            this.world["rock"].modifyAll(3, 1);
            this.world["magma"].modifyAll(3, 1);
            this.world.makeMeshes();
            this.state.credits["water"] = 0;
        }
        else
            this.state.credits["water"] = 0;
        this.updateControls();
    },

    addToRegion: function(name) {
        if(this.state.credits[name] == 3) {
            this.world[name].modifyAll(9, 3);
            this.world.makeMeshes();
            this.state.credits[name] = 0;
        }
        else
            this.state.credits[name] = 0;
        this.updateControls();
    },

    start: function(levelChange) {
        this.currentLevel += levelChange;
        if(this.currentLevel >= this.levels.length) {
            this.finish();
            return;
        }

        this.missiles = this.levels[this.currentLevel].missiles;
        this.speed = this.levels[this.currentLevel].speed;
        this.world = new World(this.worldSlices);
        this.missile = new Missile(this, this.world);
        this.state = new GameState(this);
        this.selectRegion(0, 0);
        this.dragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.secondsElapsed = 0;   
        this.elapsed = 0;
        this.frames = 0;

        var that = this;
        $(".level.screen").find("h2").text("Level " + (1 + this.currentLevel)).end()
            .fadeIn(2000).click(function() {
            $(this).hide();

            that.gl.ondraw = render;
            that.gl.onupdate = bindFn(that.tick, that);
        });
    },

    finish: function() {
        $(".finish.screen").fadeIn(2000);
    },

    lose: function() {
        this.gl.ondraw = null;
        this.gl.onupdate = null;

        $(".tryAgain.screen").show().click(function() {
            $(this).hide();
            game.start(0);
        });
    },

    win: function() {
        this.gl.ondraw = null;
        this.gl.onupdate = null;
        game.start(1);
    },    

    selectRegion: function(newSlice) {
        this.state.activeSlice = mod(newSlice, this.worldSlices);
        if(this.missile.active && !this.missile.hit) this.missile.slice = this.state.activeSlice;
        this.updateControls();
    },

    updateControls: function() {
        var that = this;
        $("#controls .button").each(function() {
            var el = $(this);
            var layerName = el.data("layer");

            el.css("opacity", [0.1, 0.2, 0.3, 1.0][that.state.credits[layerName]]);
        });
        
        $("#counter .count").text(this.missiles > -1 ? this.missiles : 0);
    },

    tick: function(seconds) {
        seconds = clamp(seconds, 0.001, 0.1);
        this.elapsed += seconds;
        this.frames++;
        if(Math.floor(this.elapsed) > this.secondsElapsed) {
            //console.log(this.frames);
            this.frames = 0;
            this.secondsElapsed = Math.floor(this.elapsed);
        }

        var newAngle = this.state.activeSlice * (360 / this.worldSlices);
        var oldAngle = this.state.cameraAngle;
        if(oldAngle - newAngle > 180) oldAngle -= 360;
        if(newAngle - oldAngle > 180) oldAngle += 360;
        this.state.cameraAngle = newAngle; mix(oldAngle, newAngle, clamp(seconds * 10, 0, 1));

        if(game.missile.active)
            this.missile.update(seconds);
        else {
            var next = ["dirt", "rock", "magma", "fusion"][Math.floor(Math.random() * 4)];
            this.missile.start(this.state.activeSlice, next);
            this.missiles--;
            if(this.missiles < 0) this.win();
            else this.updateControls();
        }
    }
});