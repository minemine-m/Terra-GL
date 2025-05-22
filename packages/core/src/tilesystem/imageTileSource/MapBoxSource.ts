import { SourceOptions, TileSource } from "../source";

export type MapBoxSourceOptions = SourceOptions & {
	style?: string;
	token: string;
};

/**
 * MapBox datasource
 */
export class MapBoxSource extends TileSource {
	public token: string = "";
	public format: string = "webp";
	public style: string = "cm2myr6qx001t01pi0sf7estf";
	public attribution = "MapBox";
	public maxLevel: number = 25;
	public url = "https://api.mapbox.com/styles/v1/criska/cm2myr6qx001t01pi0sf7estf/tiles/256/{z}/{x}/{y}?access_token={token}&format={format}";
//mapbox://styles/criska/cm2myr6qx001t01pi0sf7estf
	constructor(options?: MapBoxSourceOptions) {
		super(options);
		Object.assign(this, options);
	}
}
