export class CanvasManager {
    private canvasDict: Record<string, HTMLCanvasElement> = {};

    getCanvas(width: number = 40, height: number = 30, keySuffix?: string): HTMLCanvasElement {
        const key = keySuffix ? `${width}_${height}_${keySuffix}` : `${width}_${height}`;

        if (!this.canvasDict[key]) {
            this.canvasDict[key] = document.createElement('canvas');
            this.canvasDict[key].width = width;
            this.canvasDict[key].height = height;
        } else {
            const canvas = this.canvasDict[key];
            const ctx = canvas.getContext('2d')!;
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);
        }

        return this.canvasDict[key];
    }

    clearCache(width: number, height: number, keySuffix?: string): void {
        const key = keySuffix ? `${width}_${height}_${keySuffix}` : `${width}_${height}`;
        delete this.canvasDict[key];
    }
}