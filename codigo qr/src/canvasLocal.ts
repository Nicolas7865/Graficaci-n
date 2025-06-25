class FiniteFieldMath {
  protected exponentTable: number[];
  protected logarithmTable: number[];
  protected primitivePoly: number;

  constructor(primitivePoly: number = 0x11D) {
      this.primitivePoly = primitivePoly;
      this.exponentTable = new Array(256).fill(0);
      this.logarithmTable = new Array(256).fill(0);
      let currentVal: number = 1;
      for (let i = 0; i < 255; i++) {
          this.exponentTable[i] = currentVal;
          this.logarithmTable[currentVal] = i;
          currentVal <<= 1;
          if (currentVal & 0x100) {
              currentVal ^= this.primitivePoly;
          }
      }
      this.exponentTable[255] = 1;
  }

  gfMultiply(valA: number, valB: number): number {
      if (valA === 0 || valB === 0) {
          return 0;
      }
      const logA: number = this.logarithmTable[valA];
      const logB: number = this.logarithmTable[valB];
      let sumLogs: number = logA + logB;
      if (sumLogs >= 255) {
          sumLogs -= 255;
      }
      return this.exponentTable[sumLogs];
  }

  gfInverse(val: number): number {
      if (val === 0) throw new Error("Inverse of zero is undefined");
      return this.exponentTable[255 - this.logarithmTable[val]];
  }

  polyMultiply(poly1: number[], poly2: number[]): number[] {
      const product: number[] = new Array(poly1.length + poly2.length - 1).fill(0);
      for (let j = 0; j < poly2.length; j++) {
          for (let i = 0; i < poly1.length; i++) {
              product[i + j] ^= this.gfMultiply(poly1[i], poly2[j]);
          }
      }
      return product;
  }

  polyDivide(dividendPoly: number[], divisorPoly: number[]): number[] {
      let tempDividend: number[] = [...dividendPoly];
      const divisorLead: number = divisorPoly[0];
      const divisorLen: number = divisorPoly.length;

      for (let i = 0; i <= tempDividend.length - divisorLen; i++) {
          const factor: number = this.gfMultiply(tempDividend[i], this.gfInverse(divisorLead));
          for (let j = 0; j < divisorLen; j++) {
              tempDividend[i + j] ^= this.gfMultiply(divisorPoly[j], factor);
          }
      }

      const eccLength: number = divisorLen - 1;
      return tempDividend.slice(tempDividend.length - eccLength);
  }

  static generateRsPoly(gfInstance: FiniteFieldMath, numEccBytes: number): number[] {
      let genPoly: number[] = [1];
      for (let i = 0; i < numEccBytes; i++) {
          genPoly = gfInstance.polyMultiply(genPoly, [1, gfInstance.exponentTable[i]]);
      }
      return genPoly;
  }
}

export class CanvasLocal {
  protected graphics: CanvasRenderingContext2D;
  protected qrSize: number;
  protected canvasWidth: number;
  protected canvasHeight: number;
  protected modulePxSize: number;
  protected offsetX: number;
  protected offsetY: number;
  protected fieldMath: FiniteFieldMath;
  protected alwaysZeroCoords: number[];
  protected alwaysOneCoord: number[];
  protected formatBitsPositions: number[];
  protected dataModuleIndices: { [key: string]: number[] };
  protected eccModuleIndices: { [key: string]: number[] };
  protected allMaskableIndices: Set<number>;
  protected versionInfoLocations: number[];

  constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      this.graphics = g;
      this.qrSize = 25; 
      this.canvasWidth = canvas.width;
      this.canvasHeight = canvas.height;
      this.modulePxSize = Math.floor(Math.min(this.canvasWidth, this.canvasHeight) / this.qrSize);
      this.offsetX = (this.canvasWidth - this.modulePxSize * this.qrSize) / 2;
      this.offsetY = (this.canvasHeight - this.modulePxSize * this.qrSize) / 2;

      this.fieldMath = new FiniteFieldMath();

      this.alwaysZeroCoords = [
          7, 32, 57, 82, 107, 132, 157, 182,
          175, 176, 177, 178, 179, 180, 181,
          17, 42, 57, 92, 117, 142, 157, 192,
          193, 194, 195, 196, 197, 198, 199,
          425, 426, 427, 428, 429, 430, 431, 432,
          457, 482, 507, 532, 557, 582, 607,
          159, 161, 163, 165, 167, 231, 281, 331, 381
      ];
      this.alwaysOneCoord = [433]; 

      this.formatBitsPositions = [
          200, 201, 202, 203, 204, 205, 207, 208,
          183, 199, 108, 83, 58, 33, 8,
          217, 218, 219, 220, 221, 222, 223, 224,
          458, 483, 508, 533, 558, 583, 608
      ];

      this.dataModuleIndices = {
          blockA: [624, 623, 599, 598, 574, 573, 549, 548], blockB: [524, 523, 499, 498, 474, 473, 449, 448],
          blockC: [424, 423, 399, 398, 374, 373, 349, 348], blockD: [324, 323, 299, 298, 274, 273, 249, 248],
          blockE: [247, 246, 272, 271, 297, 296, 322, 321], blockF: [347, 346, 372, 371, 397, 396, 422, 421],
          blockG: [447, 446, 472, 471, 497, 496, 522, 521], blockH: [547, 546, 572, 571, 597, 596, 622, 621],
          blockI: [620, 619, 595, 594, 570, 569, 545, 544], blockJ: [395, 394, 370, 369, 345, 344, 320, 319],
          blockK: [295, 294, 270, 269, 245, 244, 243, 242], blockL: [268, 267, 293, 292, 318, 317, 343, 342],
          blockM: [368, 367, 393, 392, 543, 542, 568, 567], blockN: [593, 592, 618, 617, 616, 615, 591, 590],
          blockO: [566, 565, 541, 540, 515, 490, 465, 440], blockP: [415, 391, 390, 366, 365, 341, 340, 316],
          blockQ: [315, 291, 290, 266, 265, 241, 240, 216], blockR: [215, 191, 190, 141, 140, 116, 115, 91],
          blockS: [90, 66, 65, 41, 40, 16, 15, 14], blockT: [13, 39, 38, 64, 63, 89, 88, 114],
          blockU: [113, 139, 138, 189, 188, 214, 213, 239], blockV: [238, 264, 263, 289, 288, 314, 313, 339],
          blockW: [338, 364, 363, 389, 388, 414, 413, 439], blockX: [438, 464, 463, 489, 488, 514, 513, 539],
          blockY: [538, 564, 563, 589, 588, 614, 613, 612], blockZ: [611, 587, 586, 562, 561, 537, 536, 512],
          blockAA: [511, 487, 486, 462, 461, 437, 436, 412], blockBB: [411, 387, 386, 362, 361, 337, 336, 312]
      };
      this.eccModuleIndices = {
          eccA: [311, 287, 286, 262, 261, 237, 236, 212], eccB: [211, 187, 186, 137, 136, 112, 111, 87],
          eccC: [86, 62, 61, 37, 36, 12, 11, 10], eccD: [9, 35, 34, 60, 59, 85, 84, 110],
          eccE: [109, 135, 134, 185, 184, 210, 209, 235], eccF: [234, 260, 259, 285, 284, 310, 309, 335],
          eccG: [334, 360, 359, 385, 384, 410, 409, 435], eccH: [434, 460, 459, 485, 484, 510, 509, 535],
          eccI: [534, 560, 559, 585, 584, 610, 609, 408], eccJ: [407, 383, 382, 358, 357, 333, 332, 308],
          eccK: [307, 283, 282, 258, 257, 233, 232, 230], eccL: [229, 255, 254, 280, 279, 305, 304, 330],
          eccM: [329, 355, 354, 380, 379, 405, 404, 403], eccN: [402, 378, 377, 353, 352, 328, 327, 303],
          eccO: [302, 278, 277, 253, 252, 228, 227, 226], eccP: [225, 251, 250, 276, 275, 301, 300, 326]
      };

      this.allMaskableIndices = new Set<number>();
      Object.values(this.dataModuleIndices).forEach(arr => arr.forEach(idx => this.allMaskableIndices.add(idx)));
      Object.values(this.eccModuleIndices).forEach(arr => arr.forEach(idx => this.allMaskableIndices.add(idx)));

      this.versionInfoLocations = [325, 351, 350, 376, 375, 401, 400];
  }

  getModuleX(col: number): number { return this.offsetX + col * this.modulePxSize; }
  getModuleY(row: number): number { return this.offsetY + row * this.modulePxSize; }

  drawQrModule(col: number, row: number, isBlack: boolean, color: string = '#000'): void {
      this.graphics.fillStyle = isBlack ? color : '#fff';
      this.graphics.fillRect(this.getModuleX(col), this.getModuleY(row), this.modulePxSize, this.modulePxSize);
  }

  clearCanvasArea(): void {
      this.graphics.fillStyle = '#fff';
      this.graphics.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  setupBaseQrGrid(): number[][] {
      const N: number = this.qrSize;
      let qrMatrix: number[][] = Array.from({ length: N }, () => Array(N).fill(2)); // Use 2 as a temporary state

      const finder: number[][] = [
          [1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1]
      ];

      const placeFinderWithSeparators = (colStart: number, rowStart: number): void => {
          for (let r = 0; r < 7; r++) {
              for (let c = 0; c < 7; c++) {
                  qrMatrix[rowStart + r][colStart + c] = finder[r][c];
              }
          }
          // Separators
          for (let i = -1; i < 8; i++) {
              if (rowStart > 0 && colStart + i >= 0 && colStart + i < N) qrMatrix[rowStart - 1][colStart + i] = 0; // Top
              if (rowStart + 7 < N && colStart + i >= 0 && colStart + i < N) qrMatrix[rowStart + 7][colStart + i] = 0; // Bottom
          }
          for (let i = 0; i < 7; i++) {
              if (colStart > 0 && rowStart + i >= 0 && rowStart + i < N) qrMatrix[rowStart + i][colStart - 1] = 0; // Left
              if (colStart + 7 < N && rowStart + i >= 0 && rowStart + i < N) qrMatrix[rowStart + i][colStart + 7] = 0; // Right
          }
      };

      placeFinderWithSeparators(0, 0);
      placeFinderWithSeparators(N - 7, 0);
      placeFinderWithSeparators(0, N - 7);

     
      for (let i = 8; i < N - 8; i++) {
          qrMatrix[6][i] = (i % 2 === 0) ? 1 : 0;
          qrMatrix[i][6] = (i % 2 === 0) ? 1 : 0;
      }

      const alignPattern: number[][] = [
          [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]
      ];
      const alignTopLeft: number = N - 7 - 2; 
      if (N >= 25) { 
          for (let r = 0; r < 5; r++) {
              for (let c = 0; c < 5; c++) {
                  qrMatrix[alignTopLeft + r][alignTopLeft + c] = alignPattern[r][c];
              }
          }
      }

      
      for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
              if (qrMatrix[r][c] === 2) qrMatrix[r][c] = 0;
          }
      }
      return qrMatrix;
  }

  applyFixedWhitespace(grid: number[][]): void {
      const N: number = this.qrSize;
      this.alwaysZeroCoords.forEach(linearIdx => {
          grid[Math.floor(linearIdx / N)][linearIdx % N] = 0;
      });
  }

  applyFixedBlackPixel(grid: number[][]): void {
      const N: number = this.qrSize;
      this.alwaysOneCoord.forEach(linearIdx => {
          grid[Math.floor(linearIdx / N)][linearIdx % N] = 1;
      });
  }

  getFormatInfoString(): number[] {
      
      return "111011110101110".split('').map(b => +b);
  }

  insertFormatInformation(grid: number[][], formatBitValues: number[]): void {
      const N: number = this.qrSize;
      for (let k = 0; k < 15; k++) {
          
          const pos1: number = this.formatBitsPositions[k];
          grid[Math.floor(pos1 / N)][pos1 % N] = formatBitValues[k];

          
          const pos2: number = this.formatBitsPositions[k + 15];
          grid[Math.floor(pos2 / N)][pos2 % N] = formatBitValues[k];
      }
  }

  generateErrorCorrection(dataBytes: number[], eccCount: number): number[] {
      const generatorPoly: number[] = FiniteFieldMath.generateRsPoly(this.fieldMath, eccCount);
      let messagePoly: number[] = [...dataBytes];
      for (let i = 0; i < eccCount; i++) {
          messagePoly.push(0);
      }
      return this.fieldMath.polyDivide(messagePoly, generatorPoly);
  }

  applyMaskPattern(qrMatrix: number[][]): void {
      const N: number = this.qrSize;
      for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
              const currentLinearIdx: number = r * N + c;
              
              if (this.allMaskableIndices.has(currentLinearIdx)) {
                 
                  if ((r + c) % 2 === 0) {
                      qrMatrix[r][c] = qrMatrix[r][c] === 1 ? 0 : 1; 
                  }
              }
          }
      }
  }

  generateQRCode(inputData: string): void {
      this.clearCanvasArea();
      const N: number = this.qrSize;
      let qrGridResult: number[][] = this.setupBaseQrGrid();

      let bitPayload: number[] = [];

      
      bitPayload.push(0, 1, 0, 0);

      const charCount: number = inputData.length;
      for (let i = 7; i >= 0; i--) bitPayload.push((charCount >> i) & 1);

      for (let char of inputData) {
          const charCode: number = char.charCodeAt(0);
          for (let i = 7; i >= 0; i--) bitPayload.push((charCode >> i) & 1);
      }

      const totalDataBitsCapacity: number = Object.keys(this.dataModuleIndices).length * 8; 

      if (bitPayload.length > totalDataBitsCapacity) {
          console.error("Error: Data exceeds QR Code Version 2-L capacity.");
          
          for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) this.drawQrModule(x, y, (x+y)%2===0, 'red');
          return;
      }

      
      if (bitPayload.length + 4 <= totalDataBitsCapacity) bitPayload.push(0, 0, 0, 0);
      
      while (bitPayload.length % 8 !== 0) bitPayload.push(0);

      
      const padByte1: number[] = [1, 1, 1, 0, 1, 1, 0, 0];
      const padByte2: number[] = [0, 0, 0, 1, 0, 0, 0, 1];
      let currentPad: number = 0;
      while (bitPayload.length < totalDataBitsCapacity) {
          bitPayload.push(...(currentPad % 2 === 0 ? padByte1 : padByte2));
          currentPad++;
      }

      let processedDataCodewords: number[] = [];
      for (let i = 0; i < bitPayload.length; i += 8) {
          let byteValue: number = 0;
          for (let j = 0; j < 8; j++) {
              if (bitPayload[i + j] === 1) {
                  byteValue |= (1 << (7 - j)); 
              }
          }
          processedDataCodewords.push(byteValue);
      }

      const eccCodewordsCount: number = Object.keys(this.eccModuleIndices).length; 
      const generatedEccBytes: number[] = this.generateErrorCorrection(processedDataCodewords, eccCodewordsCount);

      let eccBitstream: number[] = [];
      generatedEccBytes.forEach(byteVal => {
          for (let i = 7; i >= 0; i--) {
              eccBitstream.push((byteVal >> i) & 1);
          }
      });

      let dataBitPtr: number = 0;
      for (const blockKey in this.dataModuleIndices) {
          const blockPositions: number[] = this.dataModuleIndices[blockKey];
          for (const linearIndex of blockPositions) {
              if (dataBitPtr < bitPayload.length) {
                  qrGridResult[Math.floor(linearIndex / N)][linearIndex % N] = bitPayload[dataBitPtr];
                  dataBitPtr++;
              } else {
                  qrGridResult[Math.floor(linearIndex / N)][linearIndex % N] = 0; 
              }
          }
      }

      let eccBitPtr: number = 0;
      for (const blockKey in this.eccModuleIndices) {
          const blockPositions: number[] = this.eccModuleIndices[blockKey];
          for (const linearIndex of blockPositions) {
              if (eccBitPtr < eccBitstream.length) {
                  qrGridResult[Math.floor(linearIndex / N)][linearIndex % N] = eccBitstream[eccBitPtr];
                  eccBitPtr++;
              } else {
                  qrGridResult[Math.floor(linearIndex / N)][linearIndex % N] = 0; 
              }
          }
      }

      this.applyMaskPattern(qrGridResult);

     
      const formatBits: number[] = this.getFormatInfoString();
      this.insertFormatInformation(qrGridResult, formatBits);

      this.versionInfoLocations.forEach(linearIdx => {
          qrGridResult[Math.floor(linearIdx / N)][linearIdx % N] = 0;
      });


      this.applyFixedWhitespace(qrGridResult);
      this.applyFixedBlackPixel(qrGridResult);


      for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
              this.drawQrModule(c, r, qrGridResult[r][c] === 1);
          }
      }
  }

  paint(): void {
      this.clearCanvasArea();
      const initialGrid: number[][] = this.setupBaseQrGrid();
      const formatInfo: number[] = this.getFormatInfoString();
      this.insertFormatInformation(initialGrid, formatInfo);
      this.versionInfoLocations.forEach(idx => {
           initialGrid[Math.floor(idx / this.qrSize)][idx % this.qrSize] = 0; 
      });
      this.applyFixedWhitespace(initialGrid);
      this.applyFixedBlackPixel(initialGrid);

      for (let y = 0; y < this.qrSize; y++) {
          for (let x = 0; x < this.qrSize; x++) {
              this.drawQrModule(x, y, initialGrid[y][x] === 1);
          }
      }
  }

  paintAnatomy(): void {
      this.clearCanvasArea();
      const N: number = this.qrSize;
      let qrMatrix: string[][] = Array.from({ length: N }, () => Array(N).fill('white'));

      const colorFinder: string = 'blue';
      const colorSeparator: string = 'lightblue';
      const colorAlignment: string = 'purple';
      const colorTiming: string = 'orange';
      const colorFormatInfo: string = 'red';
      const colorVersionInfo: string = 'darkgreen';
      const colorFixedBlack: string = 'grey';
      const colorData: string = 'yellow';
      const colorECC: string = 'pink';


      const finder: number[][] = [
          [1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 1, 1, 0, 1], [1, 0, 1, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1]
      ];

      const placeFinder = (colStart: number, rowStart: number): void => {
          for (let r = 0; r < 7; r++) {
              for (let c = 0; c < 7; c++) {
                  if (finder[r][c] === 1) qrMatrix[rowStart + r][colStart + c] = colorFinder;
                  else qrMatrix[rowStart + r][colStart + c] = 'white';
              }
          }
      };

      placeFinder(0, 0);
      placeFinder(N - 7, 0);
      placeFinder(0, N - 7);

      const placeSeparator = (colStart: number, rowStart: number): void => {
          for (let i = -1; i < 8; i++) {
              if (rowStart > 0 && colStart + i >= 0 && colStart + i < N) qrMatrix[rowStart - 1][colStart + i] = colorSeparator;
              if (rowStart + 7 < N && colStart + i >= 0 && colStart + i < N) qrMatrix[rowStart + 7][colStart + i] = colorSeparator;
          }
          for (let i = 0; i < 7; i++) {
              if (colStart > 0 && rowStart + i >= 0 && rowStart + i < N) qrMatrix[rowStart + i][colStart - 1] = colorSeparator;
              if (colStart + 7 < N && rowStart + i >= 0 && rowStart + i < N) qrMatrix[rowStart + i][colStart + 7] = colorSeparator;
          }
      };
      placeSeparator(0, 0);
      placeSeparator(N - 7, 0);
      placeSeparator(0, N - 7);

      for (let i = 8; i < N - 8; i++) {
          qrMatrix[6][i] = colorTiming;
          qrMatrix[i][6] = colorTiming;
      }

      const alignPattern: number[][] = [
          [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]
      ];
      const alignTopLeft: number = N - 7 - 2;
      if (N >= 25) {
          for (let r = 0; r < 5; r++) {
              for (let c = 0; c < 5; c++) {
                  if (alignPattern[r][c] === 1) qrMatrix[alignTopLeft + r][alignTopLeft + c] = colorAlignment;
                  else qrMatrix[alignTopLeft + r][alignTopLeft + c] = 'white';
              }
          }
      }

      this.alwaysOneCoord.forEach(linearIdx => {
          const r: number = Math.floor(linearIdx / N);
          const c: number = linearIdx % N;
          qrMatrix[r][c] = colorFixedBlack;
      });

      this.formatBitsPositions.forEach(linearIdx => {
          const r: number = Math.floor(linearIdx / N);
          const c: number = linearIdx % N;
          if (qrMatrix[r][c] === 'white') {
              qrMatrix[r][c] = colorFormatInfo;
          }
      });

      this.versionInfoLocations.forEach(linearIdx => {
          const r: number = Math.floor(linearIdx / N);
          const c: number = linearIdx % N;
          if (qrMatrix[r][c] === 'white') {
              qrMatrix[r][c] = colorVersionInfo;
          }
      });
      for (const blockKey in this.dataModuleIndices) {
          const blockPositions: number[] = this.dataModuleIndices[blockKey];
          for (const linearIndex of blockPositions) {
              const r: number = Math.floor(linearIndex / N);
              const c: number = linearIndex % N;
              if (qrMatrix[r][c] === 'white') {
                  qrMatrix[r][c] = colorData;
              }
          }
      }
      for (const blockKey in this.eccModuleIndices) {
          const blockPositions: number[] = this.eccModuleIndices[blockKey];
          for (const linearIndex of blockPositions) {
              const r: number = Math.floor(linearIndex / N);
              const c: number = linearIndex % N;
              if (qrMatrix[r][c] === 'white') {
                  qrMatrix[r][c] = colorECC;
              }
          }
      }
      for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
              this.graphics.fillStyle = qrMatrix[r][c];
              this.graphics.fillRect(this.getModuleX(c), this.getModuleY(r), this.modulePxSize, this.modulePxSize);
          }
      }
  }
}