export class CanvasCuadrado {
    constructor(g, canvas) {
        this.graphics = g;
        this.rWidth = 6;
        this.rHeight = 4;
        this.maxX = canvas.width - 1;
        this.maxY = canvas.height - 1;
        this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
        this.centerX = this.maxX / 2;
        this.centerY = this.maxY / 2;
    }

    iX(x) { return Math.round(this.centerX + x / this.pixelSize); }
    iY(y) { return Math.round(this.centerY - y / this.pixelSize); }

    drawSpiral(xA, yA, xB, yB, xC, yC, xD, yD) {
        this.graphics.beginPath();
        this.graphics.moveTo(xA, yA);
        this.graphics.lineTo(xB, yB);
        this.graphics.lineTo(xC, yC);
        this.graphics.lineTo(xD, yD);
        this.graphics.lineTo(xA, yA); // volver a A para que parezca espiral cerrada
        this.graphics.stroke();
    }

    paint() {
        // Borde del canvas
        this.drawLine(0, 0, 0, 480);
        this.drawLine(0, 0, 640, 0);
        this.drawLine(640, 0, 640, 480);
        this.drawLine(640, 480, 0, 480);

        // Parámetros del cuadrado
        let lado = 450;
        let side = 0.95 * lado;
        let sideHalf = 0.5 * side;
        let xCenter = 320;
        let yCenter = 240;

        let xA = xCenter - sideHalf;
        let yA = yCenter - sideHalf;
        let xB = xCenter + sideHalf;
        let yB = yCenter - sideHalf;
        let xC = xCenter + sideHalf;
        let yC = yCenter + sideHalf;
        let xD = xCenter - sideHalf;
        let yD = yCenter + sideHalf;

        let q = 0.05;
        let p = 1 - q;

        for (let i = 0; i < 50; i++) {
            this.drawSpiral(xA, yA, xB, yB, xC, yC, xD, yD);

            // Calcular nuevos puntos "empujando" cada vértice hacia el siguiente
            let xA1 = p * xA + q * xB;
            let yA1 = p * yA + q * yB;
            let xB1 = p * xB + q * xC;
            let yB1 = p * yB + q * yC;
            let xC1 = p * xC + q * xD;
            let yC1 = p * yC + q * yD;
            let xD1 = p * xD + q * xA;
            let yD1 = p * yD + q * yA;

            xA = xA1;
            yA = yA1;
            xB = xB1;
            yB = yB1;
            xC = xC1;
            yC = yC1;
            xD = xD1;
            yD = yD1;
        }
    }

    // Línea básica (para el borde)
    drawLine(x1, y1, x2, y2) {
        this.graphics.beginPath();
        this.graphics.moveTo(x1, y1);
        this.graphics.lineTo(x2, y2);
        this.graphics.closePath();
        this.graphics.stroke();
    }
}
