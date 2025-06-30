import { CanvasLocal } from './canvasLocal.js';
let canvas;
let graphics;
// Changed to 'canvas1' to match the updated index.html
canvas = document.getElementById('canvas1');
// Check if canvas and its context are available before proceeding
if (canvas && canvas.getContext) {
    graphics = canvas.getContext('2d'); // Use ! to assert non-null
    const miCanvas = new CanvasLocal(graphics, canvas);
    miCanvas.paint();
}
else {
    console.error("Canvas element with ID 'canvas1' not found or context not available.");
}
