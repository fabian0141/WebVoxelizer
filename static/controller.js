import "./lib/mat4.js";
import "./lib/vec3.js";
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
const upVector = vec3.fromValues(0, 1, 0);
const center = vec3.fromValues(0, 0, 0);

let deltaX = 0;
let deltaY = 0;

// Function to update camera position based on spherical coordinates
function rotatePosition() {




    mat4.lookAt(view, eye, center, upVector);
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
