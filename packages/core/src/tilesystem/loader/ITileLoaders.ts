

import { BufferGeometry, Material, Mesh, Texture } from "three";
import { ISource } from "../source";
import { TileLoadingManager } from "./LoaderFactory";

/** Tile Mesh Data Type */
export type MeshDateType = {
	/** Tile materials */
	materials: Material[];
	/** Tile geometry */
	geometry: BufferGeometry;
};
export interface ITileMaterial extends Material {
	map?: Texture | null;
}
/**
 * Tile Load Params Type
 */
export type TileLoadParamsType = {
	/** Tile X Coordinate */
	x: number;
	/** Tile Y Coordinate */
	y: number;
	/** Tile Z Coordinate */
	z: number;
	/** Tile projection Bounds */
	bounds: [number, number, number, number];
	/** Tile lonlat Bounds */
	lonLatBounds?: [number, number, number, number];
};

/**
 * Tile Source Load Params Type
 */
export type TileSourceLoadParamsType<TSource extends ISource = ISource> = TileLoadParamsType & {
	/** Tile Data Source */
	source: TSource;
};

/** Tile Loader Interface */
export interface ITileLoader<TMeshData extends MeshDateType = MeshDateType> {
	/** Load Tile Data */
	manager: TileLoadingManager;
	/** Image Loader */
	imgSource: ISource[];
	/** Terrain Loader */
	demSource: ISource | undefined;
	/** Load Tile Data */
	load(params: TileLoadParamsType): Promise<TMeshData>;
	/** Unload Tile Data */
	unload?(tileMesh: Mesh): void;
}

/** Tile Loader Info Interface */
export interface ITileLoaderInfo {
	/** Loader Version */
	version: string;
	/** Loader Author */
	author?: string;
	/** Loader Description */
	description?: string;
}

/** Material Loader Interface */
export interface ITileMaterialLoader<TMaterial extends Material = Material> {
	isMaterialLoader?: true;
	/** Loader Info */
	info: ITileLoaderInfo;
	/** Tile Data Type */
	dataType: string;
	/** Load Image Data From Source */
	load(params: TileSourceLoadParamsType): Promise<TMaterial>;
	/** Unload material Data */
	unload?(material: TMaterial): void;
}

/** Geometry Loader Interface */
export interface ITileGeometryLoader<TGeometry extends BufferGeometry = BufferGeometry> {
	isMaterialLoader?: false;
	/** Loader Info */
	info: ITileLoaderInfo;
	/** Tile Data Type */
	dataType: string;
	/** Load Terrain Data From Source */
	load(params: TileSourceLoadParamsType): Promise<TGeometry>;
	/** Unload geometry Data */
	unload?(geometry: TGeometry): void;
}
