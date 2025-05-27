import { version } from '../package.json';

console.log(
    '%c✨ terra.gl V' + version + ' ',
    'color:rgb(255, 255, 255); font-weight: bold; background: linear-gradient(90deg, #ffb6c1, #ff69b4); padding: 5px; border-radius: 5px;'
  );

export * from "./viewer";
export * from "./map";
export * from "./tilesystem/imageTileSource";
export * from "./layer";
export * from "./feature";
export * from './core';
