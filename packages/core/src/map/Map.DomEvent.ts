import { Map } from "./index";
import { Coordinate } from '../types';
import { getLocalFromMouse } from '../utils/tilemaputils';

interface DomEventMap {
    // 格式: [事件名]: 回调参数类型
    targrt?: Map; 
    originEvent: Event;
    coordiante?: Coordinate;
    eventName?: string; // 鼠标事件对象，如 click、mouseover 等

}


const eventMaps = [
    'click',        // 点击
    'dblclick',     // 双击
    'mousedown',    // 鼠标按下
    'mouseup',      // 鼠标释放
    'mousemove',    // 鼠标移动
    'mouseenter',   // 鼠标进入元素（不冒泡）
    'mouseleave',   // 鼠标离开元素（不冒泡）
    'mouseover',    // 鼠标进入元素（冒泡）
    'mouseout',     // 鼠标离开元素（冒泡）
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
            domElement.addEventListener(eventName, (evt:any) => {
                let  latlnt = getLocalFromMouse(evt, this.tilemap, this.viewer.camera);
                // console.log(latlnt,'latlnt')
                let eventData:DomEventMap = {
                    targrt: this,
                    originEvent: evt,
                    eventName: eventName,

                };
                if(latlnt) {
                     let coordiante:Coordinate = [latlnt.x, latlnt.y, latlnt.z];
                    eventData = {
                        targrt: this,
                        originEvent: evt,
                        coordiante: coordiante,
                        eventName: eventName,
                    }
                    
                }
              
                this.trigger(eventName, eventData);
            });
        })

    }
},



Map.addOnLoadHook('_registerDomEvents');

// Map.addOnLoadHook(_removeDomEvents);
