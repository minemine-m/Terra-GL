import { EventClass } from '../event';
import { extend } from '../../utils';

type ClassOptions = Record<string, any>;

export function EventMixin<T extends { new(...args: any[]): {} }>(Base: T) {
    return class extends Base {
        eventClass = new EventClass();  // 复用 EventClass

        // 直接代理 EventClass 的方法
        on = this.eventClass.on.bind(this.eventClass);
        trigger = this.eventClass.trigger.bind(this.eventClass);
        off = this.eventClass.off.bind(this.eventClass);
    };
}

/**
 * 为类添加基础状态管理能力（推荐方案）
 * @template T 基类类型
 * @template S 状态类型（默认为 any）
 */
export function BaseMixin<T extends new (...args: any[]) => any, S = any>(
    Base: T
) {
    return class extends Base {
        options: S;

        constructor(...args: any[]) {
            super(...args);
            this.options = {} as S;
        }

        /**
         * 用参数中的options定义扩展默认的options
         *
         * @english
         * Mixin options with the class's default options.
         * @param options - options to merge.
         */
        static mergeOptions(options: ClassOptions) {
            const proto = this.prototype;
            const parentProto = Object.getPrototypeOf(proto);
            if (!proto.options || proto.options === parentProto.options) {
                proto.options = proto.options ? Object.create(proto.options) : {};
            }
            extend(proto.options, options);
            return this;
        }
    };
}