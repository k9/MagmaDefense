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
        if(this.dragging && Math.abs(this.dragStart.x - e.pageX) > 20) {
            var moveBy = (this.dragStart.x - e.pageX) > 0 ? 1 : -1;
            this.selectRegion(this.state.activeSlice + moveBy);
            this.dragStart = { x: e.pageX, y: e.pageY };
        }
    },

    mousedown: function(e) {
        this.dragging = true;
        this.dragStart = { x: e.pageX, y: e.pageY };
    },

    mouseup: function(e) { this.dragging = false; },

    buttondown: function(e) {
        var el = $(e.target);
        var layerName = el.parents("li").data("layer");
        var amount = el.hasClass("plus") ? 10 : -10;
        var that = this;
        this.modifyRegion(layerName, amount);
        this.buttonTimer = setInterval(
            function() { that.modifyRegion(layerName, amount); }, 100);
    },
    
    buttonup: function(e) { clearInterval(this.buttonTimer); },

    start: function() {
        $("#gameContainer").append(this.gl.canvas);
        setupRender(this.gl);
        this.gl.animate();
    },

    modifyRegion: function(layer, amount) {
        this.world.modifyRegion(this.state.activeSlice, layer, amount / 10);
    },

    selectRegion: function(newSlice) {
        this.state.activeSlice = mod(newSlice, this.worldSlices);
        this.state.cameraAngle = this.state.activeSlice * (360 / this.worldSlices);
    },

    tick: function() {

    }
});