

import { parse } from "./parse";

type MessageType = {
	demData: ArrayBuffer;
	z: number;
	clipBounds: [number, number, number, number];
};

self.onmessage = (msg: MessageEvent<MessageType>) => {
	const data = msg.data;
	const mesh = parse(data.demData, data.z, data.clipBounds);
	self.postMessage(mesh);
};
