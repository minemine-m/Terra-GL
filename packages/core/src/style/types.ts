import type { Feature } from '../feature/Feature';
export type BaseStyle = {
    visible?: boolean;
    opacity?: number;
    zIndex?: number;
  };
  
  export type PointStyle = BaseStyle & {
    type: 'point';
    color?: string | number;
    size?: number;
    icon?: string;
    // ...其他点样式属性
  };
  
  export type LineStyle = BaseStyle & {
    type: 'line';
    color?: string | number;
    width?: number;
    // ...其他线样式属性
  };
  
  export type StyleConfig = PointStyle | LineStyle;
  export type StyleFunction<T extends StyleConfig> = (feature: Feature, zoom?: number) => T;