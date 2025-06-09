import { CanvasCuadrado } from './canvasCuadrado.js';

// Configurar el canvas para el cuadrado
let canvasCuadrado = document.getElementById('circlechart2');
let graphicsCuadrado = canvasCuadrado.getContext('2d');
const miCanvasCuadrado = new CanvasCuadrado(graphicsCuadrado, canvasCuadrado);
miCanvasCuadrado.paint();
