import * as _vscode from "vscode";



//     export interface Item {
//         id: string;
//         tempId:string;
//         name: string;
//         code: string;
//         innerItems: string;
//         linkedBlocks:[];
//         placeholders:[];
//         color:string;
//         visible:string;
//         tags: [];
// }



export interface FilteredTree {
    id:string,
    path:string,
    name:string,
    size:number,
    type:string,
    color:string,
    tags:[] | string[],
    placeholders:[] | string[],
    code:string,
    language:string,
    visible:boolean,
    open:boolean,
    parentId:string,
    outputx:number,
    outputy:number,
    inputx:number,
    inputy:number,
    children:[],
    extension:string,
    locationX:string,
    locationY:string,
    startLine:string,
    _startCharacter:string,
    _endLine:string,
    _endCharacter:string,
    starred:boolean,
    linkedTargetBlocks: string[]
  }

  export interface Item {
    id: string;
    tempId:string;
    name: string;
    code: string;
    language: string;
    linkedBlocks:[] | never[];
    placeholders:[] | string[];
    color:string;
    visible:string;
    tags:[] | string[];
 }
 
 
 export interface Group {
    groupId:string,
    blockIds:[string],
    color:string,
    name:string,
    visible:boolean,
 }
 
 export interface ActiveWindow {
    path:string,
    id:string,
    block:FilteredTree,
    outline: [{
       children:[],
       containerName:string,
       detail: string,
       kind: number,
       location: {}, 
       name: string,
    }],
 }
 
 export interface CodeMap {
    canvas: FilteredTree,
    flatTree: FilteredTree[],
    pocket: [FilteredTree | Group],
    groups:Array<Group>,
    activeWindow: ActiveWindow,
 }
 
 
 
 export interface DerivedGroup {
    groupId:string,
    blocks:FilteredTree[],
    color:string,
    name:string,
    visible:boolean,
 }
 