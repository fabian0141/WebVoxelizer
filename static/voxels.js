import { createProgram } from "./program.js";

const vertexShaderSrc = `#version 300 es
in vec3 a_position;
in vec3 aNormal;
out vec4 color;
uniform mat4 u_modelViewProjection;
uniform mat4 projection;

void main() {
    vec4 pos = u_modelViewProjection * vec4(a_position, 1.0);
    vec3 N = normalize(vec3(u_modelViewProjection * vec4(aNormal, 0.0)));
    vec3 L = normalize(vec3(10.0, 10.0, 10.0) - vec3(pos));
    
    float diffuse = max(dot(N, L), 0.0) + 0.1;
    color = vec4(diffuse * 0.4, diffuse * 0.95, diffuse * 1.0, 1.0);
    gl_Position = projection * u_modelViewProjection * vec4(a_position, 1.0);
}`;

const fragmentShaderSrc = `#version 300 es
precision highp float;
in vec4 color;
out vec4 outColor;

void main() {
    outColor = color;
    //outColor = vec4(1.0);
}`;

var vertArr, indiArr, normArr;

var program;
var positionAttrib;
var normalAttrib;
var mvpUniform;
var projectionUniform;

var vao;
var vbo;
var nbo;
var ebo;

function initVoxels(gl) {
    program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);

    positionAttrib = gl.getAttribLocation(program, "a_position");
    normalAttrib = gl.getAttribLocation(program, "aNormal");
    mvpUniform = gl.getUniformLocation(program, "u_modelViewProjection");
    projectionUniform = gl.getUniformLocation(program, "projection");

    vao = gl.createVertexArray();
    vbo = gl.createBuffer();
    nbo = gl.createBuffer();
    ebo = gl.createBuffer();

    var s = 0.1;
    vertArr = new Float32Array([
        -s, -s, -s, //left-bottom-back
        -s, -s, s,  //left-bottom-front
        -s, s, -s,  //left-top-back
        -s, s, s,   //left-top-front

        s, -s, -s,  //right-bottom-back
        s, -s, s,   //right-bottom-front
        s, s, -s,   //right-top-back
        s, s, s     //right-top-front
    ]);
    
    indiArr = new Uint16Array([
        //front
        3, 1, 5,
        3, 5, 7,
        //back
        6, 0, 2,
        6, 4, 0,
        //top
        2, 3, 7,
        2, 7, 6,
        //bottom
        1, 4, 5,
        1, 0, 4,
        //right
        7, 5, 4,
        7, 4, 6,
        //left
        0, 1, 3,
        0, 3, 2
    ]);

    normArr = new Float32Array([
        -0.5774, -0.5774, -0.5774,
        -0.5774, -0.5774, 0.5774,
        -0.5774, 0.5774, -0.5774,
        -0.5774, 0.5774, 0.5774,

        0.5774, -0.5774, -0.5774,
        0.5774, -0.5774, 0.5774,
        0.5774, 0.5774, -0.5774,
        0.5774, 0.5774, 0.5774,
    ]);
}

function renderVoxels(gl, mvp, projection) {
    gl.useProgram(program);

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertArr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
    gl.bufferData(gl.ARRAY_BUFFER, normArr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttrib);
    gl.vertexAttribPointer(normalAttrib, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indiArr, gl.STATIC_DRAW);

    gl.uniformMatrix4fv(mvpUniform, false, mvp);
    gl.uniformMatrix4fv(projectionUniform, false, projection);

    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indiArr.length, gl.UNSIGNED_SHORT, 0);
}

export { initVoxels, renderVoxels }