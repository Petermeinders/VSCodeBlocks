import { dbClickedItem, FilteredTreeasCodeMap, filteredTree } from './store';
import { writable, derived } from "svelte/store";

// export const items = writable([{id:0,name:""}]);
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

export interface FilteredTree {
  id:string,
  path:string,
  name:string,
  size:number,
  type:string,
  parentId:string,
  outputx:number,
  outputy:number,
  inputx:number,
  inputy:number,
  children:[],
  extension:string,
  locationX:string,
  locationY:string,
}

export interface CodeMap {
   canvas: FilteredTree,
   flatTree: [FilteredTree],
   pocket: [FilteredTree]
}


type currentPanel = "editMode" | "codeBlocks" | "codeMap" | "settings";

let originNewRender = 0;

let originCodeMap:CodeMap;

let originZoom = 1;

let originDbClickedItem = {};

let originCurrentlySelected = [];

let originFlatTree = [];

let customSnippets:Item[] =
[
   {
      id: "0",
      tempId:"",
      name: "test",
      code: "if(${1:condition} ||${1:condition}){${2:expression}})",
      language: "typescript",
      placeholders: [
         "condition",
         "expression"
      ],
      color: "white",
      visible: "",
      linkedBlocks: [],
      tags: [
         "tag1",
         "tag2"
      ]
   }
]

let originItems = {
   customSnippets,
   "vsSnippets": [
      "vsSnippets1",
      "vsSnippets2"
   ],
   selectedTags: [],
   settings:{
      isFuzzy:false,
      searchCode:false,
      currentPanel:"codeBlocks"
   }

};

let originEditMode = {
      "id": "-1",
      "fileName":"",
      "importType":""
};

let originDebug = false;

let originEditItem = {
   "id": "0", "tempId":"", "name": "test", "code":"if(${1:condition} ||${1:condition}){${2:expression}})", "linkedBlocks": [], "language":"java", "placeholders":["condition","expression"], "color":'white', "visible":"", "tags":["tag1","tag2"] 
}


let originLinkedBlocks:any[] = [];

// [{ "id": "0", "name": "test", "code":"if(${1:condition} ||${1:condition}){${2:expression}})", "placeholders":["condition","expression"], "color":'white', "visible":"", "tags":["tag1","tag2"] },{ "id": "1", "name": "test2", "code":"...2", "color":'white', "visible":"", "tags":["tag1","tag2"] }]
let originTags = [{ id: 1, tagName: "code" }, { id: 2, tagName: "command" }];
let originPage: "code" | "other" = "code";
// eslint-disable-next-line @typescript-eslint/naming-convention


if (tsvscode.getState()?.i !== undefined) {
   originItems = tsvscode.getState()?.i;
}
// if (tsvscode.getState()?.t.length > 0){
//   originTags = tsvscode.getState()?.t;
//   originTags = ["None", ...originTags];
// }
if (tsvscode.getState()?.p !== undefined) {
   originPage = tsvscode.getState()?.p;
}

//tsvscode.setState(originItems, originTags, originPage);


// if (tsvscode.getState()?.t !== undefined) {
//   originTags =  tsvscode.getState()?.t;
//   tsvscode.setState(originTags);
// }


export const currentlySelected = writable(originCurrentlySelected, (set) => {
   console.log("debug: " + originCurrentlySelected);

   //set([{id:0, name:""}]);
   return () => { };
});

export const dbClickedItem = writable(originDbClickedItem, (set) => {
   console.log("debug: " + originDbClickedItem);

   //set([{id:0, name:""}]);
   return () => { };
});

export const currentZoom = writable(originZoom, (set) => {
   console.log("debug: " + originZoom);

   //set([{id:0, name:""}]);
   return () => { };
});

export const newRender = writable(originNewRender, (set) => {
   console.log("debug: " + originNewRender);

   //set([{id:0, name:""}]);
   return () => { };
});

export const flatTree = writable(originFlatTree, (set) => {
   console.log("debug: " + originFlatTree);

   //set([{id:0, name:""}]);
   return () => { };
});

export const codeMap = writable(originCodeMap, (set) => {
   console.log("debug: " + originCodeMap);

   //set([{id:0, name:""}]);
   return () => { };
});

export const linkedBlocks = writable(originLinkedBlocks, (set) => {
   console.log("debug: " + originLinkedBlocks);

   //set([{id:0, name:""}]);
   return () => { };
});

export const debug = writable(originDebug, (set) => {
   console.log("debug: " + originDebug);

   //set([{id:0, name:""}]);
   return () => { };
});

export const editItem = writable(originEditItem, (set) => {
   console.log(originEditItem);

   //set([{id:0, name:""}]);
   return () => { };
});

export const editMode = writable(originEditMode, (set) => {
   console.log("Editmode Set!");
   console.log(originEditMode);

   //set([{id:0, name:""}]);
   return () => { };
});



export const items = writable(originItems, (set) => {
   console.log("Store Code Block Items Set!");
   console.log(originItems);

   //set([{id:0, name:""}]);
   return () => { };
});

// export const tags = writable(originTags, (set) => {
//   console.log("Store Tags Set!");
//   console.log(originTags);

//   return () => {};
// });

export const tags = derived(
   items,
   $items => {
      if (typeof ($items) !== 'undefined') {
         let s = new Set($items.customSnippets.map(item => item.tags).flat());
         let newSet = Array.from(s);
         newSet = newSet.map(x => { return x.toUpperCase().trim();});
         newSet = newSet.sort((a, b) => a.localeCompare(b));
         let setArray = Array.from(new Set(newSet));
         setArray = ["None", ...setArray];
         return setArray;
      }
   }


);

export interface item { id: string, name: string, code: string, color: string, placeholders: Array<string>, language: string, visible: string, tempId:string, linkedBlocks:[], tags: Array<string> };


export const page = writable(originPage, (set) => {
   console.log("Store Tags Set!");
   console.log(originPage);

   return () => { };
});
