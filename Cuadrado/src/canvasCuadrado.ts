export class CanvasCuadrado {
  protected graphics: CanvasRenderingContext2D;
  protected rWidth: number;
  protected rHeight: number;
  protected maxX: number;
  protected maxY: number;
  protected pixelSize: number;
  protected centerX: number;
  protected centerY: number;
  
  // Constructor
  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.graphics = g;
    this.rWidth = 6;
    this.rHeight = 4;
    this.maxX = canvas.width - 1;
    this.maxY = canvas.height - 1;
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
    this.centerX = this.maxX / 2;
    this.centerY = this.maxY / 2;
  }
  
  //convertir coordenadas X
  protected iX(x: number): number { return Math.round(this.centerX + x / this.pixelSize); }
  
  //convertir coordenadas Y
  protected iY(y: number): number { return Math.round(this.centerY - y / this.pixelSize); }
  
  //dibujar una línea
  protected drawLine(x1: number, y1: number, x2: number, y2: number): void {
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.closePath();
    this.graphics.stroke();
  }
  
  public paint(): void {
    // Borde del canvas
    this.drawLine(0, 0, 0, 480); // Izquierda
    this.drawLine(0, 0, 640, 0); // Arriba
    this.drawLine(640, 0, 640, 480); // Derecha
    this.drawLine(640, 480, 0, 480); // Abajo
  
    // Parámetros del cuadrado
    let lado = 450;
    let side = 0.95* lado;
    let sideHalf = 0.5 * side;
    let xCenter = 320;
    let yCenter = 240;
  
    // Coordenadas iniciales del cuadrado
    let xA: number, yA: number, xB: number, yB: number, xC: number, yC: number, xD: number, yD: number;
    xA = xCenter - sideHalf;
    yA = yCenter - sideHalf;
    xB = xCenter + sideHalf;
    yB = yCenter - sideHalf;
    xC = xCenter + sideHalf;
    yC = yCenter + sideHalf;
    xD = xCenter - sideHalf;
    yD = yCenter + sideHalf;
  
    let q = 0.05;
    let p = 1 - q;
  
    for (let i = 0; i < 20; i++) {
      // Se dibuja el cuadrado
      this.drawLine(xA, yA, xB, yB);
      this.drawLine(xB, yB, xC, yC);
      this.drawLine(xC, yC, xD, yD);
      this.drawLine(xD, yD, xA, yA);
  
      // Calcular los nuevos puntos del cuadrado
      let xA1 = p * xA + q * xB;
      let yA1 = p * yA + q * yB;
      let xB1 = p * xB + q * xC;
      let yB1 = p * yB + q * yC;
      let xC1 = p * xC + q * xD;
      let yC1 = p * yC + q * yD;
      let xD1 = p * xD + q * xA;
      let yD1 = p * yD + q * yA;
  
      // Actualizar los puntos del cuadrado
      xA = xA1;
      xB = xB1;
      xC = xC1;
      xD = xD1;
      yA = yA1;
      yB = yB1;
      yC = yC1;
      yD = yD1;
    }
  }
}