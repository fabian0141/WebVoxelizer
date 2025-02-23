import "./lib/mat4.js";
import "./lib/vec3.js";
import { normalize } from "./lib/vec3.js";
import "./lib/vec4.js";

const PI = 6.28318;

let radius = 5.0; // Distance from the object
let theta = Math.PI / 2; // Horizontal angle (start facing -Z)
let phi = 0; // Vertical angle (angle from the equator)

var keypressed = { top: false, down: false, left: false, right: false };
var isDragging = false;
var prevMouse = { x: 0, y: 0 };

var canvas;
var eye = vec3.fromValues(0, 0, 5);
var view = mat4.create();
let up = vec3.fromValues(0, 1, 0);
let right = vec3.fromValues(1, 0, 0);
let center = vec3.fromValues(0, 0, 0);
mat4.lookAt(view, eye, center, up);


let deltaX = 0;
let deltaY = 0;
let speed = 0.03;

// Function to update camera position based on spherical coordinates
function rotatePosition() {
    if (Math.abs(deltaX) < 0.0001 && Math.abs(deltaY) < 0.0001) {
        console.log(deltaX, deltaY);
        return view;
    } 
    deltaX *= speed;
    deltaY *= -speed;

    var newPos = vec3.clone(eye);
    vec3.scaleAndAdd(newPos, newPos, right, deltaX);
    vec3.scaleAndAdd(newPos, newPos, up, deltaY);
    vec3.sub(newPos, newPos, center);
    vec3.normalize(newPos, newPos);
    vec3.scale(eye, newPos, radius);
    let newRight = vec3.create();
    vec3.cross(newRight, up, eye);
    vec3.cross(up, eye, right);
    normalize(up, up);
    vec3.normalize(right, newRight);
    console.log(eye[0], eye[1], eye[2], up[0], up[1], up[2], right[0], right[1], right[2]);


    mat4.lookAt(view, eye, center, up);
    deltaX = 0;
    deltaY = 0;
    return view;
}

function init(can) {
    canvas = can;
    canvas.addEventListener(
        "onwheel" in document ? "wheel" : "mousewheel",
        function (e) {
            radius *= Math.exp(e.deltaY / 2000);
        }
    );

    canvas.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowDown":
                keypressed.down = true;
                break;
            case "ArrowUp":
                keypressed.top = true;
                break;
            case "ArrowLeft":
                keypressed.left = true;
                break;
            case "ArrowRight":
                keypressed.right = true;
                break;
        }
    });

    canvas.addEventListener("keyup", (e) => {
        switch (e.key) {
            case "ArrowDown":
                keypressed.down = false;
                break;
            case "ArrowUp":
                keypressed.top = false;
                break;
            case "ArrowLeft":
                keypressed.left = false;
                break;
            case "ArrowRight":
                keypressed.right = false;
                break;
        }
    });

    document.addEventListener("mouseup", function (event) {
        isDragging = false;
    });

    canvas.addEventListener("mousemove", function (event) {
        if (!isDragging) return;

        deltaX += event.clientX - prevMouse.x;
        deltaY += event.clientY - prevMouse.y;



        prevMouse.x = event.clientX;
        prevMouse.y = event.clientY;

    });

    canvas.addEventListener("mousedown", function (event) {
        prevMouse.x = event.clientX;
        prevMouse.y = event.clientY;
        isDragging = true;
    });
}

export { init, rotatePosition };
