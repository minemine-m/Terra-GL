import { Map } from "./index";


interface DomEventMap {
    // 格式: [事件名]: 回调参数类型
    targrt?: Map; 
    originEvent: Event

}


const eventMaps = [
    'pointermove'
]

declare module "./index" {
    interface Map {
        //@internal
        _removeDomEvents(): void;
        //@internal
        _registerDomEvents(): void;
    }
}


//@internal
Map.prototype._removeDomEvents = function (this: Map) {
    console.log('removeDomEvents', this)
}

//@internal
/**
 * 注册DOM事件
 */
Map.prototype._registerDomEvents = function (this: Map) {
    const domElement = this.viewer.container;
    if (domElement) {
        eventMaps.forEach(eventName => {
            domElement.addEventListener(eventName, (evt) => {
                const eventData:DomEventMap = {
                    targrt: this,
                    originEvent: evt
                };
                this.trigger(eventName, eventData);
            });
        })

    }
},



Map.addOnLoadHook('_registerDomEvents');

// Map.addOnLoadHook(_removeDomEvents);
