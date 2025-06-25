import { CanvasLocal } from './canvasLocal.js';

const canvas = document.getElementById('circlechart');
const graphics = canvas.getContext('2d');

const myQrCanvasHandler = new CanvasLocal(graphics, canvas);

myQrCanvasHandler.paint();

const urlInput = document.getElementById('url'); 
const generateButton = document.getElementById('boton');


generateButton.addEventListener('click', () => {
    const enteredUrl = urlInput.value;
    if (enteredUrl && enteredUrl.trim() !== "") {
        myQrCanvasHandler.generateQRCode(enteredUrl.trim());
    } else {
        myQrCanvasHandler.clearCanvasArea();
        console.warn("URL");
    }
});