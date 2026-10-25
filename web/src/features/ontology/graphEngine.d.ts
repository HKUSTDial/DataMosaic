export type GraphController={destroy():void;reset():void;zoom(factor:number):void;image(format:'png'|'svg'):string};
export function mountGraph(root:HTMLElement,data:unknown):GraphController;
