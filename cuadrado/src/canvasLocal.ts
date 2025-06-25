export class CanvasLocal {
  // Atributos
  protected graphics: CanvasRenderingContext2D;
  protected rWidth: number;
  protected rHeight: number;
  protected maxX: number;
  protected maxY: number;
  protected pixelSize: number;
  protected centerX: number;
  protected centerY: number;

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
ª
  iX(x: number): number { return Math.round(this.centerX + x / this.pixelSize); }
  iY(y: number): number { return Math.round(this.centerY - y / this.pixelSize); }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.closePath();
    this.graphics.stroke();
  }

  paint() {
    let lado = 200;
    let p = 0.85;
    let q = 1 - p;

    let xA = 250, yA = 250;
    let xB = xA + lado, yB = yA;
    let xC = xB, yC = yB + lado;
    let xD = xA, yD = yA + lado;

    for (let i = 0; i < 30; i++) {
      this.drawLine(xA, yA, xB, yB);
      this.drawLine(xB, yB, xC, yC);
      this.drawLine(xC, yC, xD, yD);
      this.drawLine(xD, yD, xA, yA);

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
}