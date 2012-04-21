window.Game = function() {
    this.gl = GL.create();
    $(this.gl.canvas).css({ width: "100%", height: "100%" });
    this.gl.ondraw = render;
    this.gl.onupdate = bindFn(this.tick, this);
    this.shaders = new Shaders();

    this.world = new World();
};

$.extend(Game.prototype, {
    start: function() {
        $("#gameContainer").append(this.gl.canvas);
        setupRender(this.gl);
        this.gl.animate();
    },

    tick: function() {

    }
});