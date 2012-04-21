window.Game = function() {
    this.gl = GL.create();
    $(this.gl.canvas).css({ width: "100%", height: "100%" });
    this.gl.ondraw = render;
    this.gl.onupdate = bindFn(this.tick, this);
    this.shaders = new Shaders();
    this.worldSlices = 45;
    this.world = new World(this.worldSlices);
    this.state = new GameState(this);
    this.selectRegion(0, 0);

    var that = this;
    $(this.gl.canvas).mousemove(function(e) {
        var offset = $(that.gl.canvas).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
        that.selectRegion(x, y); 
    });

    $(this.gl.canvas).click(function(e) { 
        if(e.which == 1) that.growRegion(); 
        else that.shrinkRegion(); 
        return false; 
    });
};

function GameState(game) {
    this.cameraElevation = 125;
    this.cameraAngle = 0;
    this.activeSlice = 0;
    this.activeLayer = 0;
}

$.extend(Game.prototype, {
    start: function() {
        $("#gameContainer").append(this.gl.canvas);
        setupRender(this.gl);
        this.gl.animate();
    },

    growRegion: function() {
        this.world.growRegion(this.state.activeSlice, this.state.activeLayer);
    },

    shrinkRegion: function() {
        this.world.shrinkRegion(this.state.activeSlice, this.state.activeLayer);
    },

    selectRegion: function(x, y) {
        this.state.activeSlice = Math.floor(x / 10) % this.worldSlices;
        this.state.cameraAngle = 180 + (this.state.activeSlice - 0.5) * (360 / this.worldSlices);
    },

    tick: function() {

    }
});