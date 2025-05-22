// Event类（事件的收发功能）
// export class EventClass {
//     private eventListeners: { [event: string]: Function[] } = {};  // 事件监听器

//     // 订阅事件
//     on(event: string, listener: Function): void {
//       if (!this.eventListeners[event]) {
//         this.eventListeners[event] = [];
//       }
//       this.eventListeners[event].push(listener);
//     }

//     // 触发事件
//     trigger(event: string, ...args: any[]): void {
//       const listeners = this.eventListeners[event] || [];
//       listeners.forEach(listener => listener(...args));
//     }

//     // 取消订阅事件
//     off(event: string, listener: Function): void {
//       const listeners = this.eventListeners[event];
//       if (listeners) {
//         const index = listeners.indexOf(listener);
//         if (index !== -1) {
//           listeners.splice(index, 1);
//         }
//       }
//     }
//   }




import { EventDispatcher } from 'three';
// import { EventDispatcher } from 'three';

export class EventClass {
  private _dispatcher = new EventDispatcher();

  // 完全绕过类型检查的版本
  on(type: string, listener: (data?: any) => void): this {
    (this._dispatcher as any).addEventListener(type, (e: any) => {
      listener(e.data || e);
    });
    return this;
  }

  once(type: string, listener: (data?: any) => void): this {
    const wrapper = (e: any) => {
      this.off(type, wrapper);
      listener(e.data || e);
    };
    return this.on(type, wrapper);
  }

  off(type: string, listener: (...args: any[]) => void): this {
    (this._dispatcher as any).removeEventListener(type, listener);
    return this;
  }

  trigger(type: string, data?: any): this {
    const event = { type, data };
    (this._dispatcher as any).dispatchEvent(event);
    return this;
  }

  // 原生 Three.js 事件接入点
  get threeEventDispatcher(): EventDispatcher {
    return this._dispatcher as EventDispatcher;
  }
}




