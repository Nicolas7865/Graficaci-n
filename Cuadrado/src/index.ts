import { CanvasCuadrado } from './canvasCuadrado.js';

// Configurar el canvas para el cuadrado
let canvasCuadrado: HTMLCanvasElement = document.getElementById('circlechart2') as HTMLCanvasElement;
let graphicsCuadrado: CanvasRenderingContext2D = canvasCuadrado.getContext('2d')!;
const miCanvasCuadrado: CanvasCuadrado = new CanvasCuadrado(graphicsCuadrado, canvasCuadrado);
miCanvasCuadrado.paint();