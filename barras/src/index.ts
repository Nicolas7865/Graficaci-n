import { CanvasLocal } from './canvasLocal.js'; 
let canvas: HTMLCanvasElement;
let graphics: CanvasRenderingContext2D | null; 
let miCanvas: CanvasLocal; 
function initializeCanvas() {
    canvas = <HTMLCanvasElement>document.getElementById('circlechart');
    graphics = canvas.getContext('2d');

    if (graphics) {
        if (!miCanvas) { 
            miCanvas = new CanvasLocal(graphics, canvas);
        }
        const colorPicker1 = document.getElementById('colorPicker1') as HTMLInputElement;
        const colorPicker2 = document.getElementById('colorPicker2') as HTMLInputElement;
        const colorPicker3 = document.getElementById('colorPicker3') as HTMLInputElement;
        const colorPicker4 = document.getElementById('colorPicker4') as HTMLInputElement;

        const color1 = colorPicker1 ? colorPicker1.value : '';
        const color2 = colorPicker2 ? colorPicker2.value : '';
        const color3 = colorPicker3 ? colorPicker3.value : '';
        const color4 = colorPicker4 ? colorPicker4.value : '';

        miCanvas.paint([color1, color2, color3, color4]);
    } else {
        console.error('...');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const colorPicker1 = document.getElementById('colorPicker1');
    const colorPicker2 = document.getElementById('colorPicker2');
    const colorPicker3 = document.getElementById('colorPicker3');
    const colorPicker4 = document.getElementById('colorPicker4');

    if (colorPicker1) colorPicker1.addEventListener('input', initializeCanvas);
    if (colorPicker2) colorPicker2.addEventListener('input', initializeCanvas);
    if (colorPicker3) colorPicker3.addEventListener('input', initializeCanvas);
    if (colorPicker4) colorPicker4.addEventListener('input', initializeCanvas);

    initializeCanvas(); 
});