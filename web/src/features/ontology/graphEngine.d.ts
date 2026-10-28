export type GraphController={selectNode(id:string):void;highlight(ids:string[]):void;focusNodes(ids:string[]):void;destroy():void;reset():void;zoom(factor:number):void;image(format:'png'|'svg'):string};
export function mountGraph(root:HTMLElement,data:unknown,options?:{onSelect?:(id:string)=>void}):GraphController;
