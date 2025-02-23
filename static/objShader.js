import { createProgram } from "./program.js";

const vertexShaderSrc = `#version 300 es
in vec3 a_position;
in vec3 aNormal;
out vec4 color;
uniform mat4 u_modelViewProjection;
uniform mat4 projection;

void main() {
    vec4 pos = u_modelViewProjection * vec4(a_position, 1.0);
    vec3 vertPos = vec3(pos) / pos.w;

    vec3 N = normalize(vec3(u_modelViewProjection * vec4(aNormal, 0.0)));
    vec3 L = normalize(vec3(10.0, 10.0, 10.0) - vertPos);
    
    float diffuse = max(dot(N, L), 0.0) + 0.1;
    color = vec4(diffuse, diffuse, diffuse, 1.0);
    gl_Position = projection * u_modelViewProjection * vec4(a_position, 1.0);
}`;

const fragmentShaderSrc = `#version 300 es
precision highp float;
in vec4 color;
out vec4 outColor;
void main() {
    outColor = color;
}`;

var vertArr, indiArr, normArr;

function loadOBJ(url, callback) {
    fetch(url)
    .then(response => response.text())
    .then(data => {
        const vertices = [];
        const indices = [];
        const tempVertices = [];
        const tempIndices = new Map(); // Map to track unique vertices

        const lines = data.split("\n");
        for (let line of lines) {
            line = line.trim();
            const parts = line.split(/\s+/);

            if (parts[0] === "v") {
                // Parse vertex position
                tempVertices.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                );
            } else if (parts[0] === "f") {
                // Parse face (triangulate if needed)
                const faceIndices = parts.slice(1).map(vertex => {
                    const vIndex = parseInt(vertex.split("/")[0]) - 1;
                    if (!tempIndices.has(vIndex)) {
                        tempIndices.set(vIndex, vertices.length / 3);
                        vertices.push(
                            tempVertices[vIndex * 3],
                            tempVertices[vIndex * 3 + 1],
                            tempVertices[vIndex * 3 + 2]
                        );
                    }
                    return tempIndices.get(vIndex);
                });

                // Triangulate faces if necessary (OBJ may have quads)
                for (let i = 1; i < faceIndices.length - 1; i++) {
                    indices.push(faceIndices[0], faceIndices[i], faceIndices[i+1]);
                }
            }
        }
        vertArr = new Float32Array(vertices);
        indiArr = new Uint16Array(indices);
        normArr = computeNormals(vertices, indices);
        callback();
    });
}

function computeNormals(vertices, indices) {
    const normals = new Float32Array(vertices.length); // Same size as vertices, initialized to 0

    for (let i = 0; i < indices.length; i += 3) {
        // Get indices of the triangle vertices
        const i0 = indices[i] * 3;
        const i1 = indices[i + 1] * 3;
        const i2 = indices[i + 2] * 3;

        // Get vertex positions
        const v0 = vertices.slice(i0, i0 + 3);
        const v1 = vertices.slice(i1, i1 + 3);
        const v2 = vertices.slice(i2, i2 + 3);

        // Compute two edges
        const edge1 = [
            v1[0] - v0[0],
            v1[1] - v0[1],
            v1[2] - v0[2]
        ];
        const edge2 = [
            v2[0] - v0[0],
            v2[1] - v0[1],
            v2[2] - v0[2]
        ];

        // Compute cross product (face normal)
        const normal = [
            edge1[1] * edge2[2] - edge1[2] * edge2[1],
            edge1[2] * edge2[0] - edge1[0] * edge2[2],
            edge1[0] * edge2[1] - edge1[1] * edge2[0]
        ];

        // Accumulate normals per vertex
        for (const idx of [i0, i1, i2]) {
            normals[idx] += normal[0];
            normals[idx + 1] += normal[1];
            normals[idx + 2] += normal[2];
        }
    }

    // Normalize the normals
    for (let i = 0; i < normals.length; i += 3) {
        const length = Math.sqrt(
            normals[i] * normals[i] +
            normals[i + 1] * normals[i + 1] +
            normals[i + 2] * normals[i + 2]
        );
        if (length > 0) {
            normals[i] /= length;
            normals[i + 1] /= length;
            normals[i + 2] /= length;
        }
    }

    return normals;
}

var program;
var positionAttrib;
var normalAttrib;
var mvpUniform;
var projectionUniform;

var vao;
var vbo;
var nbo;
var ebo;

function initOBJ(gl) {
    program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);

    positionAttrib = gl.getAttribLocation(program, "a_position");
    normalAttrib = gl.getAttribLocation(program, "aNormal");
    mvpUniform = gl.getUniformLocation(program, "u_modelViewProjection");
    projectionUniform = gl.getUniformLocation(program, "projection");

    vao = gl.createVertexArray();
    vbo = gl.createBuffer();
    nbo = gl.createBuffer();
    ebo = gl.createBuffer();
}

function renderOBJ(gl, mvp, projection) {
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

export { loadOBJ, initOBJ, renderOBJ }