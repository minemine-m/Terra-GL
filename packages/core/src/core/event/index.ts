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
  // 存储监听器映射 { 类型: { 原始监听器: 包装函数 } }
  private _listenerMap = new Map<string, Map<Function, Function>>();

  on(type: string, listener: (data?: any) => void): this {
    // 创建包装函数
    const wrapper = (e: any) => listener(e.data || e);
    
    // 存储原始监听器和包装函数的映射
    if (!this._listenerMap.has(type)) {
      this._listenerMap.set(type, new Map());
    }
    this._listenerMap.get(type)!.set(listener, wrapper);
    
    // 添加包装函数到事件分发器
    (this._dispatcher as any).addEventListener(type, wrapper);
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
    const wrappers = this._listenerMap.get(type);
    if (!wrappers) return this;

    const wrapper = wrappers.get(listener);
    if (wrapper) {
      // 移除实际的包装函数
      (this._dispatcher as any).removeEventListener(type, wrapper);
      wrappers.delete(listener);
      
      // 清理空类型
      if (wrappers.size === 0) {
        this._listenerMap.delete(type);
      }
    }
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




