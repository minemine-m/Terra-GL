
import { parse } from "./parse";

type MessageType = {
	imgData: ImageData;
};

self.onmessage = (msg: MessageEvent<MessageType>) => {
	const geometry = parse(msg.data.imgData);
	self.postMessage(geometry);
	// self.close();
};
