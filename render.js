var render = function() {
    var seconds = game.elapsed;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    placeCamera();
    gl.pushMatrix();
    gl.rotate(90, 0, 1, 0);

    var solid = game.shaders.solid;
    solid.uniforms({ scale: 1, pulse: 0, wave: 0, seconds: seconds });

    gl.pushMatrix();
    toggleAlpha(true);

    gl.pushMatrix();
    for(var i = 1; i <= 10; i++) {
        gl.rotate(53.0 + seconds / 20.0, 0.1 * i, 0.05 * i, 0.6);
        var x = i / 20 + 0.5
        solid.uniforms({ scale: 0.8 + i / 5, color: [x, x, 1.0, 0.25] }).draw(game.world.skyMesh, gl.POINTS);
        gl.rotate(-0.1, 0.1 * i, 0.05 * i, 0.6);
        solid.uniforms({ color: [x, x, 1.0, 0.125] }).draw(game.world.skyMesh, gl.POINTS);
    }
    gl.popMatrix();

    gl.rotate(game.state.cameraAngle, 0, 1, 0);
    solid.uniforms({ scale: 1.0, wave: 0.0033, color: [0.43, 0.57, 0.82, 0.33] }).draw(game.world.water.mesh);

    solid.uniforms({ wave: 0.0 });
    solid.uniforms({ scale: 1.0, color: [0.41, 0.30, 0.25, 1.0] }).draw(game.world.dirt.mesh);
    solid.uniforms({ scale: 0.95, color: [0.36, 0.25, 0.2, 1.0] }).draw(game.world.dirt.mesh);
    solid.uniforms({ scale: 0.9, color: [0.31, 0.20, 0.15, 1.0] }).draw(game.world.dirt.mesh);

    solid.uniforms({ scale: 1.0, color: [0.5, 0.5, 0.5, 1.0] }).draw(game.world.rock.mesh);
    solid.uniforms({ scale: 0.95, color: [0.45, 0.45, 0.45, 1.0] }).draw(game.world.rock.mesh);
    solid.uniforms({ scale: 0.9, color: [0.4, 0.4, 0.4, 1.0] }).draw(game.world.rock.mesh);

    solid.uniforms({ wave: 0 });
    solid.uniforms({ pulse: 0, scale: 1, color: [1.0, 0.43, 0.26, 0.6] }).draw(game.world.magma.mesh);
    solid.uniforms({ pulse: 0.002, scale: 1.05, color: [1.0, 0.43, 0.26, 0.2] }).draw(game.world.magma.mesh);
    solid.uniforms({ pulse: 0.004, scale: 1.075, color: [1.0, 0.43, 0.26, 0.2] }).draw(game.world.magma.mesh);
    solid.uniforms({ pulse: 0.008, scale: 1.1, color: [1.0, 0.43, 0.26, 0.2] }).draw(game.world.magma.mesh);
    solid.uniforms({ pulse: 0, scale: 0.8, color: [1.0, 0.43, 0.26, 0.5] }).draw(game.world.magma.mesh);
    solid.uniforms({ pulse: 0, scale: 0.5, color: [1.0, 0.43, 0.26, 0.5] }).draw(game.world.magma.mesh);

    solid.uniforms({ scale: 1.0, pulse: 0, wave: 0, color: [0.76, 0.72, 0.26, 1.0] }).draw(game.world.gold.mesh);

    if(game.missile.active) {
        gl.rotate(-game.missile.slice * 360 / game.worldSlices, 0, 1, 0);
        gl.translate(0, 0, game.missile.height);

        var missileColors = {
            dirt: [0.41, 0.30, 0.25, 1.0],
            rock: [0.5, 0.5, 0.5, 1.0],
            magma: [1.0, 0.43, 0.26, 1.0],
            fusion: [1.0, 1.0, 0.2, 1.0]
        }

        solid.uniforms({ scale: 1.0, pulse: 0, wave: 0, color: [0.7, 0.7, 0.7, 1.0] }).draw(game.missile.mesh);
        solid.uniforms({ scale: 1.0, pulse: 0, wave: 0, color: missileColors[game.missile.type] }).draw(game.missile.stripe);
    }
    gl.popMatrix();

    //solid.uniforms({ scale: 1.0, color: [1.0, 1.0, 1.0, 0.2] }).draw(game.world.selector);
    gl.popMatrix();
};

function placeCamera() { 
    gl.loadIdentity();
    gl.translate(0, -0, -400);
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
    gl.perspective(45, gl.canvas.width / gl.canvas.height, 0.1, 2000);
    gl.matrixMode(gl.MODELVIEW);
    gl.enable(gl.DEPTH_TEST);
}