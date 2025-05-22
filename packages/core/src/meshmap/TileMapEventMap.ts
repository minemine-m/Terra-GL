

import { BaseEvent } from "three";

export interface MeshMapEventMap {
	"loading-start": BaseEvent & { url: string; itemsLoaded: number; itemsTotal: number };
	"loading-progress": BaseEvent & { url: string; itemsLoaded: number; itemsTotal: number };
	"loading-complete": BaseEvent & { url: string; itemsLoaded: number; itemsTotal: number };
	"loading-error": BaseEvent & { url: string; itemsLoaded: number; itemsTotal: number };
}
