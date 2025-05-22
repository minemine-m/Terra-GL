
import { CanvasTexture } from "three";
import { ITileMaterialLoader, TileSourceLoadParamsType } from "../loader";
import { TileMaterial } from "../material";

/**
 * Canvas material laoder abstract base class
 */
export abstract class TileCanvasLoader implements ITileMaterialLoader {
	public readonly info = {
		version: "0.10.0",
		description: "Canvas tile abstract loader",
	};

	public dataType = "";

	/**
	 * Asynchronously load tile material
	 * @param params Tile loading parameters
	 * @returns Returns the tile material
	 */
	public async load(params: TileSourceLoadParamsType): Promise<TileMaterial> {
		const ctx = this._creatCanvasContext(256, 256);
		this.drawTile(ctx, params);
		const texture = new CanvasTexture(ctx.canvas.transferToImageBitmap());
		const material = new TileMaterial({
			transparent: true,
			map: texture,
			opacity: params.source.opacity,
		});
		return material;
	}

	private _creatCanvasContext(width: number, height: number): OffscreenCanvasRenderingContext2D {
		const canvas = new OffscreenCanvas(width, height);
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("create canvas context failed");
		}
		ctx.scale(1, -1);
		ctx.translate(0, -height);
		return ctx;
	}

	/**
	 * Draw tile on canvas, protected
	 * @param ctx Tile canvas context
	 * @param params Tile load params
	 */
	protected abstract drawTile(ctx: OffscreenCanvasRenderingContext2D, params: TileSourceLoadParamsType): void;
}
