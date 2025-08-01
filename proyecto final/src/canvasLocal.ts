export class CanvasLocal {
  //atributos
  protected graphics: CanvasRenderingContext2D;
  protected canvas: HTMLCanvasElement;
  protected rWidth: number;
  protected rHeight: number;
  protected maxX: number;
  protected maxY: number;
  protected pixelSize: number;
  protected centerX: number;
  protected centerY: number;

  // Parallax and Sprite animation properties
  protected gameSpeed: number;
  protected backgroundLayers: Layer[];
  protected playerImage: HTMLImageElement;
  protected spriteWidth: number;
  protected spriteHeight: number;
  protected frameX: number;
  protected frameY: number;
  protected gameFrame: number;
  protected staggerFrames: number;
  protected maxFrames: number;
  protected currentAction: string; // Nueva propiedad para rastrear la acción actual

  // Mapeo de acciones a fila y cantidad de frames
  protected actions: { [key: string]: { row: number, frames: number } } = {
    idle:  { row: 0, frames: 7 },
    jump:  { row: 1, frames: 7 },
    fall:  { row: 2, frames: 7 },
    run:   { row: 3, frames: 9 },
    dizzy: { row: 4, frames: 11 },
    sit:   { row: 5, frames: 5 },
    roll:  { row: 6, frames: 7 },
    bite:  { row: 7, frames: 7 },
    ko:    { row: 8, frames: 12 }
  };

  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.graphics = g;
    this.canvas = canvas;
    this.rWidth = 6;
    this.rHeight = 4;
    this.maxX = canvas.width - 1;
    this.maxY = canvas.height - 1;
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
    this.centerX = this.maxX / 2;
    this.centerY = this.maxY / 2;

    // Initialize Parallax and Sprite properties
    this.gameSpeed = 8;
    this.backgroundLayers = [];
    this.playerImage = new Image();
    this.spriteWidth = 575;
    this.spriteHeight = 523;
    this.frameX = 0;
    this.frameY = 0;
    this.gameFrame = 0;
    this.staggerFrames = 5;
    this.maxFrames = 7; 
    this.currentAction = 'idle'; 


    this.canvas.width = 800;
    this.canvas.height = 700;
  }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.closePath();
    this.graphics.stroke();
  }

  protected createLayer(image: HTMLImageElement, speedModifier: number): Layer {
    return new Layer(image, speedModifier, this.canvas.width, this.canvas.height, () => this.gameSpeed);
  }

  protected animate = () => {
    this.graphics.clearRect(0, 0, this.canvas.width, this.canvas.height);

 
    if (this.currentAction === 'roll' || this.currentAction === 'run') {
      this.backgroundLayers.forEach(object => {
        object.update();
        object.draw(this.graphics);
      });
    } else {
 
      this.backgroundLayers.forEach(object => {
        object.draw(this.graphics);
      });
    }

    // 2. Draw the animated sprite
    const scaledSpriteWidth = this.spriteWidth * 0.5;
    const scaledSpriteHeight = this.spriteHeight * 0.5;


    let playerY = this.canvas.height - scaledSpriteHeight - 20;
    if (this.currentAction === 'jump') {
  
      const jumpHeight = 100;
      const jumpSpeed = 0.1;
      playerY -= Math.abs(Math.sin(this.gameFrame * jumpSpeed)) * jumpHeight;
    }

    this.graphics.drawImage(
      this.playerImage,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      (this.canvas.width / 2) - (scaledSpriteWidth / 2),
      playerY,
      scaledSpriteWidth,
      scaledSpriteHeight
    );


    if (this.gameFrame % this.staggerFrames == 0) {
      if (this.frameX < this.maxFrames - 1) this.frameX++;
      else this.frameX = 0;
    }
    this.gameFrame++;

    requestAnimationFrame(this.animate);
  }


  public setAction(action: string) {
    this.currentAction = action; 
    const act = this.actions[action];
    if (act) {
      this.frameY = act.row;
      this.maxFrames = act.frames;
      this.frameX = 0; 
    } else {
      this.frameY = 0;
      this.maxFrames = 7;
      this.frameX = 0;
    }
    
    
    this.toggleSpeedControls(action === 'roll' || action === 'run');
  }

  private toggleSpeedControls(show: boolean): void {
    const slider = document.getElementById('slider') as HTMLInputElement;
    const showGameSpeed = document.getElementById('showGameSpeed') as HTMLSpanElement;
    
    if (slider) {
      slider.style.display = show ? 'block' : 'none';
    }
    if (showGameSpeed) {
      showGameSpeed.style.display = show ? 'block' : 'none';
    }
  }

  public paint() {
    Promise.all([
      this.loadImage('layer-1.png'),
      this.loadImage('layer-2.png'),
      this.loadImage('layer-3.png'),
      this.loadImage('layer-4.png'),
      this.loadImage('layer-5.png'),
      this.loadImage('shadow_dog.png')
    ]).then(images => {
      this.backgroundLayers.push(this.createLayer(images[0], 0.2));
      this.backgroundLayers.push(this.createLayer(images[1], 0.4));
      this.backgroundLayers.push(this.createLayer(images[2], 0.6));
      this.backgroundLayers.push(this.createLayer(images[3], 0.8));
      this.backgroundLayers.push(this.createLayer(images[4], 1));
      this.playerImage = images[5];

      // Setup slider
      const slider = <HTMLInputElement>document.getElementById('slider');
      const showGameSpeed = <HTMLSpanElement>document.getElementById('showGameSpeed');

      if (slider && showGameSpeed) {
        slider.value = this.gameSpeed.toString();
        showGameSpeed.innerHTML = this.gameSpeed.toString();
        slider.addEventListener('change', (e: Event) => {
          this.gameSpeed = parseInt((e.target as HTMLInputElement).value);
          showGameSpeed.innerHTML = (e.target as HTMLInputElement).value;
        });
      }

      
      const actionSelect = document.getElementById('actionSelect') as HTMLSelectElement;
      if (actionSelect) {
        actionSelect.addEventListener('change', (e: Event) => {
          const value = (e.target as HTMLSelectElement).value;
          this.setAction(value);
        });
        
        this.setAction(actionSelect.value);
      } else {
        
        this.setAction('idle');
      }



      this.animate();
    }).catch(error => {
      console.error("Error loading images:", error);
    });
  }

  protected loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `./dist/src/${src}`;
    });
  }
}

class Layer {
  protected x: number;
  protected y: number;
  protected layerWidth: number;
  protected layerHeight: number;
  protected image: HTMLImageElement;
  protected speedModifier: number;
  protected getGameSpeed: () => number;

  constructor(image: HTMLImageElement, speedModifier: number, canvasWidth: number, canvasHeight: number, getGameSpeed: () => number) {
    this.x = 0;
    this.y = 0;
    this.layerWidth = 2400;
    this.layerHeight = canvasHeight;
    this.image = image;
    this.speedModifier = speedModifier;
    this.getGameSpeed = getGameSpeed;
  }

  update() {
    const currentSpeed = this.getGameSpeed() * this.speedModifier;
    if (this.x <= -this.layerWidth) {
      this.x = 0;
    }
    this.x = this.x - currentSpeed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x, this.y, this.layerWidth, this.layerHeight);
    ctx.drawImage(this.image, this.x + this.layerWidth, this.y, this.layerWidth, this.layerHeight);
  }
}