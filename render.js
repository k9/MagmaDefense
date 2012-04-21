var render = function() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    placeCamera();
    gl.pushMatrix();
    gl.rotate(180, 0, 1, 0);

    gl.pushMatrix();
    gl.rotate(game.state.cameraAngle, 0, 1, 0);
    var sh = game.shaders;
    sh.solid.uniforms({ color: [0.4, 0.4, 0.9, 1.0] }).draw(game.world.waterLayer.mesh)
    sh.solid.uniforms({ color: [0.41, 0.25, 0.15, 1.0] }).draw(game.world.dirtLayer.mesh);
    sh.solid.uniforms({ color: [0.7, 0.7, 0.7, 1.0] }).draw(game.world.rockLayer.mesh);
    sh.solid.uniforms({ color: [1.0, 0.43, 0.26, 1.0] }).draw(game.world.magmaLayer.mesh);    
    gl.popMatrix();

    toggleAlpha(true);
    sh.solid.uniforms({ color: [1.0, 1.0, 1.0, 0.25] }).draw(game.world.selector);
    toggleAlpha(false);
    gl.popMatrix();
};

function placeCamera() { 
    gl.loadIdentity();
    gl.translate(0, 0, -400);
    gl.rotate(game.state.cameraElevation, 1, 0, 0);  
}

function toggleAlpha(on) {
    if(on) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);
    }
    else {
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);    
    }
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