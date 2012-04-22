window.Game = function() {
    this.gl = GL.create();
    $(this.gl.canvas).css({ width: "100%", height: "100%" });
    this.gl.ondraw = render;
    this.gl.onupdate = bindFn(this.tick, this);
    this.shaders = new Shaders();
    this.worldSlices = 12;
    this.world = new World(this.worldSlices);
    this.missile = new Missile(this, this.world);
    this.countDown = 1;
    this.countDownSpeed = 10;
    this.state = new GameState(this);
    this.selectRegion(0, 0);
    this.dragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.secondsElapsed = 0;   
    this.elapsed = 0;
    this.frames = 0;

    var that = this;
    $(document).on({
        keydown: function(e) { that.keyChange(e.keyCode, true); },
        keyup: function(e) { that.keyChange(e.keyCode, false); }
    });
};

function GameState(game) {
    this.credits = { dirt: 0, rock: 0, magma: 0 };
    this.cameraElevation = 90;
    this.cameraAngle = 0;
    this.activeSlice = 0;
}

$.extend(Game.prototype, {
    keys: { left: 37, right: 39, A: 65, S: 83, D: 68},

    keyChange: function(code, pressed) {
        if(pressed) {
            if(code == this.keys.right) this.selectRegion(this.state.activeSlice - 1); 
            if(code == this.keys.left) this.selectRegion(this.state.activeSlice + 1);
            if(code == this.keys.A) this.addToRegion("dirt");
            if(code == this.keys.S) this.addToRegion("rock");
            if(code == this.keys.D) this.addToRegion("magma");
        }
    },

    addToRegion: function(name, amount) {
        if(this.state.credits[name] == 3) {
            this.world[name].modifyAll(20);
            this.world.makeMeshes();
            this.state.credits[name] = 0;
        }
        this.updateControls();
    },

    start: function() {
        $("#gameContainer").append(this.gl.canvas);
        setupRender(this.gl);
        this.gl.animate();
    },

    lose: function() {
        this.gl.ondraw = null;
        this.gl.onupdate = null;
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

            el.css("opacity", [0.1, 0.3, 0.5, 1.0][that.state.credits[layerName]]);
        });
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
        else if(game.countDown > 0) {
            game.countDown -= seconds * this.countDownSpeed;
            if(game.countDown < 0) {
                var next = ["dirt", "rock", "magma", "fusion"][Math.floor(Math.random() * 4)];
                this.missile.start(this.state.activeSlice, next);
                game.countDown = 1;
            }
        }
    }
});