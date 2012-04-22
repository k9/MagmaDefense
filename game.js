window.Game = function() {
    this.gl = GL.create();
    $(this.gl.canvas).css({ width: "100%", height: "100%" });
    this.gl.ondraw = render;
    this.gl.onupdate = bindFn(this.tick, this);
    this.shaders = new Shaders();
    this.worldSlices = 15;
    this.world = new World(this.worldSlices);
    this.missile = new Missile(this.world);
    this.countDown = 1;
    this.countDownSpeed = 1;
    this.state = new GameState(this);
    this.selectRegion(0, 0);
    this.dragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.secondsElapsed = 0;   
    this.elapsed = 0;
    this.frames = 0;

    var that = this;
    $(this.gl.canvas).on({
        mousemove: function(e) { that.mousemove(e); },
        mousedown: function(e) { that.mousedown(e); }
    });

    $(document).on({
        mouseup: function(e) { 
            that.mouseup(e); 
            that.buttonup(e); 
        },
        keydown: function(e) { that.keyChange(e.keyCode, true); },
        keyup: function(e) { that.keyChange(e.keyCode, false); }
    });

    this.buttonTimer = null;
    $("#controls .button").on({
        mousedown: function(e) { that.buttondown(e); }
    });
};

function GameState(game) {
    this.cameraElevation = 90;
    this.cameraAngle = 0;
    this.activeSlice = 0;
}

$.extend(Game.prototype, {
    mousemove: function(e) {
        if(!this.dragging) return;
        var newAngle = this.angleFromCenter(e.pageX, e.pageY);
        var angle = newAngle - this.dragStartAngle;
        if(angle > 180) angle -= 360;
        if(angle < -180) angle += 360;
        var moveBy = -angle / (360 / this.worldSlices);
        moveBy = moveBy > 0 ? Math.floor(moveBy) : Math.ceil(moveBy);
        if(this.dragging && moveBy != 0) {
            this.selectRegion(this.state.activeSlice + moveBy);
            this.dragStart = { x: e.pageX, y: e.pageY };
            this.dragStartAngle = newAngle;
        }
    },

    mousedown: function(e) {
        var el = $(e.target);
        this.dragging = true;
        this.dragStart = { x: e.pageX, y: e.pageY }; 
        this.dragStartAngle = this.angleFromCenter(e.pageX, e.pageY);
    },

    mouseup: function(e) { this.dragging = false; },

    buttondown: function(e) {
        var el = $(e.target);
        var layerName = el.parents("li").data("layer");
        this.world.modifyRegion(layerName, this.state.activeSlice, 3);
        updateControls();
    },
    
    buttonup: function(e) {},

    //left = 37, right = 39
    keyChange: function(code, pressed) {
        if(pressed) {
            if(code == 39) this.selectRegion(this.state.activeSlice - 1); 
            if(code == 37) this.selectRegion(this.state.activeSlice + 1);
            if(code == 65) this.world["dirt"].modifyRegions(this.state.activeSlice, 10);
            if(code == 83) this.world["rock"].modifyRegions(this.state.activeSlice, 10);
            if(code == 68) this.world["magma"].modifyRegions(this.state.activeSlice, 10);
        }
    },

    angleFromCenter: function(x, y) {
        var el = $(this.gl.canvas);
        var center = { 
            x: el.offset().left + el.width() / 2, 
            y: el.offset().top + el.height() / 2
        };

        var d = {
            x: x - center.x,
            y: y - center.y
        };

        return mod(Math.atan2(d.y, d.x) / Math.PI * 180 + 90, 360);
    },

    start: function() {
        $("#gameContainer").append(this.gl.canvas);
        setupRender(this.gl);
        this.gl.animate();
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
            var layerName = el.parents("li").data("layer");
            el.find(".count").text(6);
        });
    },

    tick: function(seconds) {
        seconds = clamp(seconds, 0.001, 0.1);
        this.elapsed += seconds;
        this.frames++;
        if(Math.floor(this.elapsed) > this.secondsElapsed) {
            console.log(this.frames);
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
                var next = ["dirt", "rock", "magma"][Math.floor(Math.random() * 3)];
                this.missile.start(this.state.activeSlice, next);
                game.countDown = 1;
            }
        }
    }
});