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

export enum Sibling {
      "Parent",
      "Child",
      "Self"

}

export enum Type {
   "File",
   "Folder",
   "Custom",
   "Container"
}

export interface BlockContainerInterface {
   id: string;
   name: string;
   blocks: Array<FilteredTree>;
   locationX: number;
   locationY: number;
   width: number;
   height: number;
   
}

export interface GroupedSquare {
   groupId: string;
   blocks: Array<FilteredTree>;
   minX: number;
   minY: number;
   maxX: number;
   maxY: number;
}



export interface FilteredTree {
    id:string,
    path:string,
    name:string,
    size:number,
    type:Type,
    sibling:Sibling,
    color:string,
    image:string,
    imageHeight:number,
    imageWidth:number,
    parentOrChildId:string,
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
    startCharacter:string,
    endLine:string,
    endCharacter:string,
    starred:boolean,
    linkedTargetBlocks: string[]
    codeDiff: boolean;
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
    blockIds:string[],
    color:string,
    name:string,
    visible:boolean,
 }
 
 export interface ActiveWindow {
    path:string,
    id:string,
    block:FilteredTree,
    activelySelectedBlocks:FilteredTree[],
    outline: [{
       children:[],
       containerName:string,
       detail: string,
       kind: number,
       location: {}, 
       name: string,
    }],
    flatOutline:FilteredTree[], 
    code:string
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
 

 export enum OutlineTypeEnum {
   Array = 17,
   Boolean = 16,
   Class = 4,
   Constant = 13,
   Constructor = 8,
   Enum = 9,
   EnumMember = 21,
   Event = 23,
   Field = 7,
   File = 0,
   Function = 11,
   Interface = 10,
   Key = 19,
   Method = 5,
   Module = 1,
   Namespace = 2,
   Null = 20,
   Number = 15,
   Object = 18,
   Operator = 24,
   Package = 3,
   Property = 6,
   String = 14,
   Struct = 22,
   TypeParameter = 25,
   Variable = 12,
 }