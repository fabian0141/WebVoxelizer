import { init, rotatePosition } from "./controller.js";
import { initOBJ, loadOBJ, renderOBJ } from "./objShader.js";
import { initVoxels, renderVoxels } from "./voxels.js";

import "./lib/mat4.js"



document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    canvas.tabIndex = 1;
    canvas.focus = true;
    document.body.appendChild(canvas);
    canvas.width = 800;
    canvas.height = 800;
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 not supported");
        return;
    }

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    var far = 20;
    var near = 0.01;
    gl.depthRange(near, far);

    initOBJ(gl);
    initVoxels(gl);
    init(canvas);

    var projection = mat4.create();
    mat4.perspective(projection, 1.01, 1, near, far);

    loadOBJ("/static/models/cactus2.obj", () => {
        function render() {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //rot.y = (rot.y + 0.01) % PI;
            //rot.z = (rot.z + 0.01) % PI;
            var mvp = rotatePosition();
            renderVoxels(gl, mvp, projection);
            renderOBJ(gl, mvp, projection);

            requestAnimationFrame(render);
        }
        render();
    });
});
