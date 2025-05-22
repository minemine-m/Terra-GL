
import { ITileLoader, MeshDateType, TileLoader, TileLoadParamsType } from "../tilesystem/loader";
import { IProjection } from "../projection";

/** 地图瓦片加载器 */
export class TileMapLoader extends TileLoader {
	private _projection: IProjection | undefined;

	public attcth(loader: ITileLoader, projection: IProjection) {
		Object.assign(this, loader);
		this._projection = projection;
		const imgSource = loader.imgSource;
		const demSource = loader.demSource;
		// 计算数据源投影范围
		imgSource.forEach(source => {
			source._projectionBounds = projection.getProjBoundsFromLonLat(source.bounds);
		});
		if (demSource) {
			demSource._projectionBounds = projection.getProjBoundsFromLonLat(demSource.bounds);
		}
	}

	public async load(params: TileLoadParamsType): Promise<MeshDateType> {
		if (!this._projection) {
			throw new Error("projection is undefined");
		}
		const { x, y, z } = params;
		// 计算投影后的瓦片x坐标
		const newX = this._projection.getTileXWithCenterLon(x, z);
		// 计算瓦片投影范围
		const bounds = this._projection.getProjBoundsFromXYZ(x, y, z);
		// 计算瓦片经纬度范围
		const lonLatBounds = this._projection.getLonLatBoundsFromXYZ(x, y, z);

		return super.load({ x: newX, y, z, bounds, lonLatBounds });
	}
}
