import { Shader } from "./shader.js";

class SimShader extends Shader {
    vsSim = `#version 300 es
    in vec4 aVertexPosition;
    in vec2 aTextureCoord;
    out highp vec2 vTextureCoord;

    void main(void) {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
  `;

    //density * weight * (1 + 3 * (dir*velo) + 4.5*(dir*velo)² - 1.5*velo²)
    //arrow = arrow * 0.5 + 0.5 * eq
    fsSim = `#version 300 es
    in highp vec2 vTextureCoord;
    uniform sampler2D uSimulation;
    uniform sampler2D uMap;
    uniform sampler2D uDensVelo;
    uniform sampler2D uDirMap;
    uniform highp vec2 simSize;
    uniform highp float weights[9];
    uniform highp vec2 dirs[9];
    out highp vec4 color;
    const highp float VISC = 1.8;
    const highp float BIG_INFLOW = 4.0/6.0;
    const highp float SMALL_INFLOW = 1.0/6.0;

    highp float equilibrium(highp vec3 densVelo, int idx) {

        highp float dirVelo = dot(dirs[idx], densVelo.yz);
        return densVelo.x * weights[idx] * (1.0 + 3.0 * dirVelo + 4.5 * dirVelo * dirVelo - 1.5 * dot(densVelo.yz, densVelo.yz));
    }

    int getMapType() {
        int mapVal = int(texture(uMap, vTextureCoord).x * 256.0);
        return (mapVal + 5) / 10;
    }

    highp float wall(int dirIdx) {
        highp vec2 originPos = vTextureCoord - dirs[dirIdx] / simSize / 1.5;
        return texture(uSimulation, originPos).r;
    }

    highp float inlet(int mapType, int dirIdx, highp vec3 densVelo) {
    
        highp float multiplier;

        if (dirIdx % 2 == 0) {
            multiplier = SMALL_INFLOW;
        } else {
            multiplier = BIG_INFLOW;
        }

        if (mapType == 3) {
            if (dirIdx / 3 != 0) {
                return texture(uSimulation, vTextureCoord).r;
            }
        } else if (mapType == 5) {
            if (dirIdx % 3 != 0) {
                return texture(uSimulation, vTextureCoord).r;
            }
        } else if (mapType == 7) {
            if (dirIdx % 3 != 2) {
                return texture(uSimulation, vTextureCoord).r;
            }
        } else if (mapType == 9) {
            if (dirIdx / 3 != 2) {
                return texture(uSimulation, vTextureCoord).r;
            }
        }

        highp vec2 originPos = vTextureCoord - dirs[dirIdx] / simSize / 1.5;
        return texture(uSimulation, originPos).r + multiplier * densVelo.x * (densVelo.y + densVelo.z);
        //return equilibrium(densVelo, dirIdx);
    }

    highp vec4 collide(highp float f, highp vec3 densVelo, int idx) {
        highp float eq = equilibrium(densVelo, idx);
        return vec4(f - VISC * (f - eq), densVelo);
    }

    void main(void) {

        int mapType = getMapType();
        int dirIdx = int(texture(uDirMap, vTextureCoord).x + 0.1);
        highp vec3 densVelo = texture(uDensVelo, vTextureCoord).xyz;
        highp float f = 0.0;

        if (mapType == 0) {
            f = texture(uSimulation, vTextureCoord).r;
        } else if (mapType == 1) {
            f = wall(dirIdx);
        } else if (mapType < 11) {
            f = inlet(mapType, dirIdx, densVelo); 
        } else if (mapType < 20) {
            f = equilibrium(densVelo, dirIdx);
        }

        color = collide(f, densVelo, dirIdx);
    }
`;

    constructor(gl) {
        super()
        this.initShaderProgram(gl, this.vsSim, this.fsSim)
    }

    getProgramInfo(gl) {
        var programInfo = super.getProgramInfo();
        programInfo.attribLocations = {
            vertexPosition: gl.getAttribLocation(this.shaderProgram, "aVertexPosition"),
            textureCoord: gl.getAttribLocation(this.shaderProgram, "aTextureCoord"),
        }

        programInfo.uniformLocations = {
            uSimulation: gl.getUniformLocation(this.shaderProgram, "uSimulation"),
            uMap: gl.getUniformLocation(this.shaderProgram, "uMap"),
            uDirMap: gl.getUniformLocation(this.shaderProgram, "uDirMap"),
            size: gl.getUniformLocation(this.shaderProgram, "simSize"),
            uDensVelo: gl.getUniformLocation(this.shaderProgram, "uDensVelo"),
            dirs: gl.getUniformLocation(this.shaderProgram, "dirs"),
            weights: gl.getUniformLocation(this.shaderProgram, "weights"),

        }
        return programInfo
    }
}

export { SimShader };