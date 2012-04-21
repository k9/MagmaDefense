var render = function() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    placeCamera();
    gl.pushMatrix();
    game.shaders.solid.uniforms({ color: [0.4, 0.4, 0.9] }).draw(game.world.waterLayer.mesh);
    game.shaders.solid.uniforms({ color: [0.41, 0.25, 0.15] }).draw(game.world.dirtLayer.mesh);
        game.shaders.solid.uniforms({ color: [0.7, 0.7, 0.7] }).draw(game.world.rockLayer.mesh);
    game.shaders.solid.uniforms({ color: [1.0, 0.43, 0.26] }).draw(game.world.magmaLayer.mesh);
    gl.popMatrix();
};

function placeCamera() { 
    gl.loadIdentity();
    gl.translate(0, 0, -400);
    gl.rotate(game.state.cameraElevation, 1, 0, 0); 
    gl.rotate(game.state.cameraAngle, 0, 1, 0);   
}

var gl;
function setupRender(thegl) {
    gl = thegl; 
    gl.canvas.width = $(gl.canvas).width();
    gl.canvas.height = $(gl.canvas).height();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.matrixMode(gl.PROJECTION);
    gl.loadIdentity();
    gl.perspective(45, gl.canvas.width / gl.canvas.height, 0.1, 1000);
    gl.matrixMode(gl.MODELVIEW);
    gl.enable(gl.DEPTH_TEST);
}