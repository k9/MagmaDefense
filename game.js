window.Game = function() {
    this.gl = GL.create();
    $(this.gl.canvas).css({ width: "100%", height: "100%" });
    this.gl.ondraw = render;
    this.gl.onupdate = bindFn(this.tick, this);
    this.shaders = new Shaders();
    this.worldSlices = 15;
    this.world = new World(this.worldSlices);
    this.state = new GameState(this);
    this.selectRegion(0, 0);
    this.dragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.lastPos = null;

    var that = this;
    $(document).on({
        mousemove: function(e) { that.mousemove(e); },
        mousedown: function(e) { that.mousedown(e); },
        mouseup: function(e) { that.mouseup(e); }
    });
};

function GameState(game) {
    this.cameraElevation = 90;
    this.cameraAngle = 0;
    this.activeSlice = 0;
    this.activeLayer = 0;
}

$.extend(Game.prototype, {
    mousemove: function(e) {
        if(!this.lastPos) this.lastPos = { x: e.pageX, y: e.pageY };
        if(this.dragging) this.selectRegion(e.pageX, e.pageY);
        this.lastPos = { x: e.pageX, y: e.pageY };
    },

    mousedown: function(e) { 
        var offset = $(this.gl.canvas).offset();
        this.dragging = true; 
        this.dragStart.x = e.pageX - offset.left;
        this.dragStart.y = e.pageY - offset.top;
    },

    mouseup: function(e) { this.dragging = false; },

    start: function() {
        $("#gameContainer").append(this.gl.canvas);
        setupRender(this.gl);
        this.gl.animate();
    },

    modifyRegion: function(amount) {
        this.world.modifyRegion(this.state.activeSlice, this.state.activeLayer, amount / 10);
    },

    selectRegion: function(x, y) {
        this.state.activeSlice = Math.floor(x / 50) % this.worldSlices;
        this.state.cameraAngle = 180 + this.state.activeSlice * (360 / this.worldSlices);
    },

    tick: function() {

    }
});