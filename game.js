window.Game = function() {
    this.gl = GL.create();
    $(this.gl.canvas).css({ width: "100%", height: "100%" });
    this.gl.ondraw = render;
    this.gl.onupdate = bindFn(this.tick, this);
    this.shaders = new Shaders();
    this.worldSlices = 20;
    this.world = new World(this.worldSlices);
    this.state = new GameState(this);
    this.selectRegion(0, 0);
    this.dragging = false;
    this.dragStart = { x: 0, y: 0 };

    var that = this;
    $(this.gl.canvas).on({
        mousemove: function(e) { that.mousemove(e); },
        mousedown: function(e) { that.mousedown(e); }
    });

    $(document).on({
        mouseup: function(e) { 
            that.mouseup(e); 
            that.buttonup(e); 
        }
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
        var amount = el.hasClass("plus") ? 10 : -10;
        var that = this;
        this.modifyRegion(layerName, amount);
        clearInterval(this.buttonTimer);
        this.buttonTimer = setInterval(
            function() { that.modifyRegion(layerName, amount); }, 50);
    },
    
    buttonup: function(e) { 
        clearInterval(this.buttonTimer); 
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

    modifyRegion: function(layer, amount) {
        this.world.modifyRegion(layer, this.state.activeSlice, amount / 10);
        this.updateControls();
    },

    selectRegion: function(newSlice) {
        this.state.activeSlice = mod(newSlice, this.worldSlices);
        this.updateControls();
    },

    updateControls: function() {
        var that = this;
        $("#controls .button").each(function() {
            var el = $(this);
            var layerName = el.parents("li").data("layer");

            var test = el.hasClass("plus") ? "isMax" : "isMin";
            el.toggleClass("disabled", that.world[test](layerName, that.state.activeSlice));
        });
    },

    tick: function(seconds) {
        seconds = clamp(seconds, 0.001, 0.1)

        var newAngle = this.state.activeSlice * (360 / this.worldSlices);
        if(newAngle - this.state.cameraAngle > 180) newAngle -= 360;
        if(newAngle - this.state.cameraAngle < -180) newAngle += 360;
        this.state.cameraAngle = mix(this.state.cameraAngle, newAngle, clamp(seconds * 30, 0, 1));
    }
});