export class CanvasLocal {
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
    this.rWidth = 12;
    this.rHeight = 8;
    this.maxX = canvas.width - 1;
    this.maxY = canvas.height - 1;
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
    this.centerX = this.maxX / 12;
    this.centerY = this.maxY / 8 * 7;
  }

  iX(x: number): number { return Math.round(this.centerX + x / this.pixelSize); }
  iY(y: number): number { return Math.round(this.centerY - y / this.pixelSize); }

  fx(x: number): number {
    return Math.sin(x * 2.5);
  }

  maxH(h: number[]): number {
    let max = h[0];
    for (let i = 1; i < h.length; i++) {
      if (max < h[i])
        max = h[i];
    }
    let res: number;
    let pot: number = 10;
    while (pot < max) {
      pot *= 10;
    }
    pot /= 10;
    res = Math.ceil(max / pot) * pot;
    return res;
  }


  barra(x: number, y: number, alt: number, color: string): void {
    this.graphics.fillStyle = color;
    this.graphics.beginPath();
    this.graphics.moveTo(this.iX(x), this.iY(0));
    this.graphics.lineTo(this.iX(x - 0.5), this.iY(0.5));
    this.graphics.lineTo(this.iX(x - 0.5), this.iY(y + alt));
    this.graphics.lineTo(this.iX(x), this.iY(y + alt - 0.5));
    this.graphics.moveTo(this.iX(x), this.iY(0));
    this.graphics.lineTo(this.iX(x), this.iY(y + alt - 0.5));
    this.graphics.lineTo(this.iX(x + 0.5), this.iY(y + alt));
    this.graphics.lineTo(this.iX(x + 0.5), this.iY(0.5));
    this.graphics.closePath();
    this.graphics.fill();
    this.graphics.stroke();

    this.graphics.fillStyle = 'rgba(90,90,90, 0.3)';
    this.graphics.beginPath();
    this.graphics.moveTo(this.iX(x - 0.5), this.iY(0.5));
    this.graphics.lineTo(this.iX(x - 0.5), this.iY(this.rHeight - 2));
    this.graphics.lineTo(this.iX(x), this.iY(this.rHeight - 2.5));
    this.graphics.lineTo(this.iX(x), this.iY(0));
    this.graphics.closePath();
    this.graphics.fill();
    this.graphics.stroke();

    this.graphics.fillStyle = 'rgba(230,230,230, 0.4)';
    this.graphics.beginPath();
    this.graphics.moveTo(this.iX(x + 0.5), this.iY(0.5));
    this.graphics.lineTo(this.iX(x + 0.5), this.iY(this.rHeight - 2));
    this.graphics.lineTo(this.iX(x), this.iY(this.rHeight - 2.5));
    this.graphics.lineTo(this.iX(x), this.iY(0));
    this.graphics.closePath();
    this.graphics.fill();
    this.graphics.stroke();

    this.graphics.fillStyle = 'rgba(220, 220, 220, 1)';
    this.graphics.beginPath();
    this.graphics.moveTo(this.iX(x - 0.5), this.iY(this.rHeight - 2));
    this.graphics.lineTo(this.iX(x), this.iY(this.rHeight - 1.5));
    this.graphics.lineTo(this.iX(x + 0.5), this.iY(this.rHeight - 2));
    this.graphics.lineTo(this.iX(x), this.iY(this.rHeight - 2.5));
    this.graphics.closePath();
    this.graphics.fill();
    this.graphics.stroke();
  }

  paint(colors: string[] = ['#3b9ae2', '#9eb400', '#ca0f6c', '#e47d08']) {
    this.graphics.clearRect(0, 0, this.maxX + 1, this.maxY + 1);
    let h: number[] = [10, 30, 80, 50]; 
    let maxEsc: number;
    maxEsc = this.maxH(h);

    let i = 0;
    for (let x = 0; x < 8; x += (8 / (h.length * 1))) {
      const barColor = colors[i % colors.length] || 'black';
      this.graphics.strokeStyle = 'rgba(0,0,0,0)'; 
      if (i < h.length) {
        this.barra(x, 0, h[i] * (this.rHeight - 2) / maxEsc, barColor);
      }
      i++;
    }
    i = 0;
    for (let x = 0; x < 8; x += (8 / (h.length * 1))) {
      const textColor = colors[i % colors.length] || 'black';
      this.graphics.fillStyle = textColor;
      if (i < h.length)
        this.graphics.fillText(h[i++] + "", this.iX(x), this.iY(-0.5));
    }
  }
}