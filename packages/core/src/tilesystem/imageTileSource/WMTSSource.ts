import { SourceOptions, TileSource } from "../source";
import { strTemplate } from "../../utils";

export type WMTSSourceOptions = SourceOptions & {
	/** 完整的WMTS请求URL模板（必须包含{x}{y}{z}或等效参数） */
	urlTemplate: string;
	/** 是否使用TMS坐标轴朝向（Y轴反向） */
	isTMS?: boolean;
};

export class WMTSSource extends TileSource {
	public minLevel = 2;
	public maxLevel = 24;
	constructor(options: WMTSSourceOptions) {
		super({
			...options,
			url: options.urlTemplate,
			isTMS: options.isTMS || false
		});
	}


	/**
	 * 直接使用用户提供的URL模板
	 * 支持以下变量替换（自动转换坐标系）：
	 * - {x}, {y}, {z} 
	 * - {tileMatrix}, {tileRow}, {tileCol}
	 */
	public getUrl(x: number, y: number, z: number): string {
		const reverseY = this.isTMS ? Math.pow(2, z) - 1 - y : y;

		return strTemplate(this.url, {
			...this,
			x, y: reverseY, z,
			tileMatrix: z,
			tileRow: reverseY,
			tileCol: x
		});
	}
}