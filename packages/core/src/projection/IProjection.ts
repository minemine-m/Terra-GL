

// projection ID, only support 3857 and 4326
export type ProjectionType = "3857" | "4326";

/**
 * Porjection interface
 */
export interface IProjection {
	readonly ID: ProjectionType;
	readonly mapWidth: number; // W-E scale
	readonly mapHeight: number; // N-S scale
	readonly mapDepth: number; // height scale
	readonly lon0: number; // central meridian

	project(lon: number, lat: number): { x: number; y: number };
	unProject(x: number, y: number): { lon: number; lat: number };
	getTileXWithCenterLon(x: number, z: number): number;
	getProjBoundsFromLonLat(bounds: [number, number, number, number]): [number, number, number, number];
	getProjBoundsFromXYZ(x: number, y: number, z: number): [number, number, number, number];
	getLonLatBoundsFromXYZ(x: number, y: number, z: number): [number, number, number, number];
}
