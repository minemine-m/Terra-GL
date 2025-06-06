import { Map } from "./index";
import { Coordinate } from '../types';
import { getLocalFromMouse } from '../utils/tilemaputils';

interface DomEventMap {
    // 格式: [事件名]: 回调参数类型
    targrt?: Map;  // 触发事件的目标对象
    originEvent: Event; // 原始的dom事件对象
    coordiante?: Coordinate; // 事件的坐标
    eventName?: string; // 事件名称
    screenXY: {
        X: number; // 屏幕X坐标
        Y: number; // 屏幕Y坐标
    }; // 场景对象

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
                    screenXY: {
                        X: evt.screenX,
                        Y: evt.screenY,
                    }

                };
                if(latlnt) {
                     let coordiante:Coordinate = [latlnt.x, latlnt.y, latlnt.z];
                    eventData = {
                        targrt: this,
                        originEvent: evt,
                        coordiante: coordiante,
                        eventName: eventName,
                        screenXY: {
                            X: evt.screenX,
                            Y: evt.screenY,
                        }
                    }
                    
                }
              
                this.trigger(eventName, eventData);
            });
        })

    }
},



Map.addOnLoadHook('_registerDomEvents');

// Map.addOnLoadHook(_removeDomEvents);
