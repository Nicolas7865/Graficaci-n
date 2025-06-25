let canvas: HTMLCanvasElement;
let graphics: CanvasRenderingContext2D ; 
let myQrCanvasHandler: CanvasLocal; 

document.addEventListener('DOMContentLoaded', () => {
    canvas = <HTMLCanvasElement>document.getElementById('circlechart');
    graphics = canvas.getContext('2d');

    if (graphics) {
        myQrCanvasHandler = new CanvasLocal(graphics, canvas);

        myQrCanvasHandler.paint();

        const urlInput = document.getElementById('url') as HTMLInputElement;
        const generateButton = document.getElementById('boton') as HTMLButtonElement;

        if (generateButton && urlInput) {
            generateButton.addEventListener('click', () => {
                const enteredUrl: string = urlInput.value;
                if (enteredUrl && enteredUrl.trim() !== "") {
                    myQrCanvasHandler.generateQRCode(enteredUrl.trim());
                } else {
                    myQrCanvasHandler.clearCanvasArea();
                    console.warn(".");
                }
            });
        } else {
            console.error(".");
        }

    } else {
        console.error('.');
    }
});