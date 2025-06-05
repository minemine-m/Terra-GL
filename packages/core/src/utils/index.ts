

import { Object3D, Mesh, Texture, TextureLoader } from "three";
/**
 * 模板字符串替换函数
 * @param str   包含 {variable} 的模板字符串
 * @param data 替换参数对象
 * @returns 
 */
export function strTemplate(str: string, data: Record<string, any>): string {
    return str.replace(/\{(\w+)\}/g, (match, key) => {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            return value !== undefined ? String(value) : match;
        }
        throw new Error(`缺少必要参数: ${key}`);
    });
}


/* eslint-disable @typescript-eslint/ban-types */

export function now() {
    return Date.now();
}

/**
 * @classdesc
 * Utilities methods used internally. It is static and should not be initiated.
 * @class
 * @static
 * @category core
 * @name Util
 */

/**
 * Merges the properties of sources into destination object.
 * @param dest
 * @param source
 * @return
 * @module Util
 */
export function extend<T extends {}, U>(dest: T, source: U): T & U;
export function extend<T extends {}, U, V>(dest: T, source1: U, source2: V): T & U & V;
export function extend<T extends {}, U, V, W>(dest: T, source1: U, source2: V, source3: W): T & U & V & W;
export function extend<T extends {}, U, V, W, X>(dest: T, source1: U, source2: V, source3: W, source4: X): T & U & V & W & X;
export function extend(dest: object, ...args: Array<any>): any;
export function extend(dest: object, ...args: Array<any>) { // (Object[, Object, ...]) ->
    for (let i = 0; i < args.length; i++) {
        const src = args[i];
        for (const k in src) {
            // 为了解决元素隐式具有 "any" 类型的问题，将 dest 和 src 类型断言为 Record<string, any>
            (dest as Record<string, any>)[k] = (src as Record<string, any>)[k];
        }
    }
    return dest;
}

/**
 * Whether the object is null or undefined.
 * @param  obj - object
 * @return
 * @memberOf Util
 */
// 修复类型谓词的类型不可赋给其参数的类型的问题，将参数类型改为 any
export function isNil(obj: any): obj is null | undefined {
    return obj == null;
}

/**
 * Whether val is a number and not a NaN.
 * @param  val - val
 * @return
 * @memberOf Util
 */
export function isNumber(val: Object): val is number {
    return (typeof val === 'number') && !isNaN(val);
}

/**
 * Whether a number is an integer
 * @param  n
 * @return
 * @memberOf Util
 */
export function isInteger(n: number) {
    return (n | 0) === n;
}

/**
 * Whether the obj is a javascript object.
 * @param obj  - object
 * @return
 * @memberOf Util
 */
export function isObject(obj: Object): obj is object {
    return typeof obj === 'object' && !!obj;
}

/**
 * Check whether the object is a string
 * @param obj
 * @return
 * @memberOf Util
 */
export function isString(obj: Object): obj is string {
    if (isNil(obj)) {
        return false;
    }
    return typeof obj === 'string' || (obj.constructor !== null && obj.constructor === String);
}

/**
 * Check whether the object is a function
 * @param {Object} obj
 * @return {Boolean}
 * @memberOf Util
 */
export function isFunction(obj: Object): obj is Function {
    if (isNil(obj)) {
        return false;
    }
    return typeof obj === 'function' || (obj.constructor !== null && obj.constructor === Function);
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Check whether the object owns the property.
 * @param obj - object
 * @param key - property
 * @return
 * @memberOf Util
 */
export function hasOwn(obj: Object, key: string): boolean {
    return hasOwnProperty.call(obj, key);
}

/**
 * Join an array, standard or a typed one.
 * @param  arr       array to join
 * @param  seperator  seperator
 * @return  result string
 * @private
 * @memberOf Util
 */
export function join(arr: Object[], seperator: string): string {
    if (arr.join) {
        return arr.join(seperator || ',');
    } else {
        return Array.prototype.join.call(arr, seperator || ',');
    }
}

/**
 * Determine if an object has any properties.
 * @param object The object to check.
 * @returns The object is empty
 * @memberOf Util
 */
export function isEmpty(object: Object) {
    let property;
    for (property in object) {
        return false;
    }
    return !property;
}

const pi = Math.PI / 180;

export function toRadian(d: number) {
    return d * pi;
}

export function toDegree(r: number) {
    return r / pi;
}

// 类型守卫函数
export function isMesh(object: Object3D): object is Mesh {
    return 'isMesh' in object && object.isMesh === true;
}


export async function loadTextureAsync(textureUrl: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
        new TextureLoader().load(
            textureUrl,
            (texture) => resolve(texture),
            undefined, // 不需要onProgress回调可以设为undefined
            (error) => reject(error)
        );
    });
}



export function formatYYMMDDHHmmss(date: Date = new Date()): string {
    const year = date.getFullYear().toString(); // 4 位年份（如 2025）
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');


    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



