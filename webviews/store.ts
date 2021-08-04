import { xlink_attr } from "svelte/internal";
import { writable, derived } from "svelte/store";

// export const items = writable([{id:0,name:""}]);
export interface Item {
   id: string;
   tempId:string;
   name: string;
   code: string;
   innerItems: string;
   linkedBlocks:[] | never[];
   placeholders:[] | string[];
   color:string;
   visible:string;
   tags:[] | string[];
}

let vsSnippets1 = {
   "Constructor": {
      "prefix": "ctor",
      "body": [
         "/**",
         " *",
         " */",
         "constructor() {",
         "\tsuper();",
         "\t$0",
         "}"
      ],
      "description": "Constructor"
   },
   "Class Definition": {
      "prefix": "class",
      "body": [
         "class ${1:name} {",
         "\tconstructor(${2:parameters}) {",
         "\t\t$0",
         "\t}",
         "}"
      ],
      "description": "Class Definition"
   }
};

let vsSnippets2 = {
   "Public Method Definition": {
      "prefix": "public method",
      "body": [
         "/**",
         " * ${1:name}",
         " */",
         "public ${1:name}() {",
         "\t$0",
         "}"
      ],
      "description": "Public Method Definition"
   },
   "Private Method Definition": {
      "prefix": "private method",
      "body": [
         "private ${1:name}() {",
         "\t$0",
         "}"
      ],
      "description": "Private Method Definition"
   }
}


// let originItems = {
//   "customSnippets":[
//     { "id": "0", "name": "test", "code":"if(${1:condition} ||${1:condition}){${2:expression}})", "innerItems":"items3", "placeholders":["condition","expression"], "color":'white', "visible":"", "tags":["tag1","tag2"] },
//     { "id": "1", "name": "test2", "innerItems":"items4", "code":"...2", "color":'white', "visible":"", "tags":["tag1","tag2"] }
//   ],
//   vsSnippets:[
//     vsSnippets1, vsSnippets2
//   ]};

let customSnippets:Item[] =
[
   {
      id: "0",
      tempId:"",
      name: "test",
      code: "if(${1:condition} ||${1:condition}){${2:expression}})",
      innerItems: "items3",
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
   selectedTags: []

};

let originEditMode = {
      "state": "false",
      "id": "-1",
      "fileName":""
};

let originDebug = false;

let originEditItem = {
   "id": "0", "tempId":"", "name": "test", "code":"if(${1:condition} ||${1:condition}){${2:expression}})", "linkedBlocks": [], "innerItems":"items3", "placeholders":["condition","expression"], "color":'white', "visible":"", "tags":["tag1","tag2"] 
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

const addItem = () => {

}

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

export interface item { id: string, name: string, code: string, color: string, placeholders: Array<string>, innerItems: string, visible: string, tempId:string, linkedBlocks:[], tags: Array<string> };


export const page = writable(originPage, (set) => {
   console.log("Store Tags Set!");
   console.log(originPage);

   return () => { };
});
