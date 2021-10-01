// @ts-nocheck

import type { CodeMap, FilteredTree, Item, DerivedGroup } from './../src/Models';
import { writable, derived } from "svelte/store";
type currentPanel = "editMode" | "codeBlocks" | "codeMap" | "settings";

let originCodeMap:CodeMap;

let originZoom = 1;

let originperimeterItem = {};

let originCurrentlySelected: string | any[] = [];

let originFlatTree: string | any[] = [];

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
   selectedTags: [""],
   settings:{
      isFuzzy:false,
      codeBlocksSaveLocation:"", 
      codeBlocksSaveLocationBackup:"", 
      codeMapSaveLocationRelative:"", 
      searchCode:false,
      currentPanel:"",
      showFolders:false,
      showFiles:true,
      showDefaultRelationship:true,
      showCustomRelationship:true,
      strictCodeMapOutlineWordMatch:false,
      mapEntireProject:false,
      codeMapFolderExclusion:"node_modules|packages",
      visibleOutlineBlocks: [
         {name: "Array", checked: false},
         {name: "Boolean", checked: false},
         {name: "Class", checked: false},
         {name: "Constant", checked: false},
         {name: "Constructor", checked: false},
         {name: "Enum", checked: false},
         {name: "EnumMember", checked: false},
         {name: "Event", checked: false},
         {name: "Field", checked: false},
         {name: "File", checked: false},
         {name: "Function", checked: false},
         {name: "Interface", checked: false},
         {name: "Key", checked: false},
         {name: "Method", checked: true},
         {name: "Module", checked: false},
         {name: "Namespace", checked: false},
         {name: "Null", checked: false},
         {name: "Number", checked: false},
         {name: "Object", checked: false},
         {name: "Operator", checked: false},
         {name: "Package", checked: false},
         {name: "Property", checked: false},
         {name: "String", checked: false},
         {name: "Struct", checked: false},
         {name: "TypeParameter", checked: false},
         {name: "Variable", checked: false}
      ]
   }

};

let originEditMode = {
      "id": "-1",
      "fileName":"",
      "importType":""
};

let originDebug = false;
let originActivelySelectedText = "";
let originalRightClickedBlock: MouseEvent = new MouseEvent("click");
let originactiveSelectionMeta = {
   startLine: "",
   path:"",
};
let originActivePath = "";
let originLines: string | any[] = [];

let originEditItem = {
   "id": "0", "tempId":"", "name": "test", "code":"if(${1:condition} ||${1:condition}){${2:expression}})", "linkedBlocks": [], "language":"java", "placeholders":["condition","expression"], "color":'white', "visible":"", "tags":["tag1","tag2"] 
}

let originLinkedBlocks:any[] = [];

// [{ "id": "0", "name": "test", "code":"if(${1:condition} ||${1:condition}){${2:expression}})", "placeholders":["condition","expression"], "color":'white', "visible":"", "tags":["tag1","tag2"] },{ "id": "1", "name": "test2", "code":"...2", "color":'white', "visible":"", "tags":["tag1","tag2"] }]
let originTags = [{ id: 1, tagName: "code" }, { id: 2, tagName: "command" }];
let originPage: "code" | "other" = "code";

if (tsvscode.getState()?.i !== undefined) {
   originItems = tsvscode.getState()?.i;
}

if (tsvscode.getState()?.p !== undefined) {
   originPage = tsvscode.getState()?.p;
}

export const currentlySelected = writable(originCurrentlySelected);

export const perimeterItem = writable(originperimeterItem);

export const currentZoom = writable(originZoom);

export const flatTree = writable(originFlatTree);

export const codeMap = writable(originCodeMap);

export const linkedBlocks = writable(originLinkedBlocks);

export const debug = writable(originDebug);

export const activelySelectedText = writable(originActivelySelectedText);

export const rightClickedBlockEvent = writable(originalRightClickedBlock);

export const activeSelectionMeta = writable(originactiveSelectionMeta);

export const activePath = writable(originActivePath);

export const lines = writable(originLines);

export const editItem = writable(originEditItem);

export const editMode = writable(originEditMode, (set) => {
   console.log("Editmode Set!");
   console.log(originEditMode);
   return () => { };
});

export const items = writable(originItems, (set) => {
   console.log("Store Code Block Items Set!");
   console.log(originItems);
   return () => { };
});

export const tags = derived(
   items,
   $items => {
      if (typeof ($items) !== 'undefined') {
         let s = new Set($items.customSnippets.map(item => item.tags).flat());
         let newSet = Array.from(s);
         newSet.forEach(item => {
            if (typeof item === "undefined")
            {
              let index = newSet.indexOf(item);
              newSet.splice(index, 1);
            }
         })
         newSet = newSet.map(x => { return x.toUpperCase().trim();});
         newSet = newSet.sort((a, b) => a.localeCompare(b));
         let setArray = Array.from(new Set(newSet));
         setArray = ["None", ...setArray];
         return setArray;
      }
   }
);

export const derivedGroups = derived(
   codeMap,
   $codeMap => {
      if (typeof ($codeMap?.groups) !== 'undefined') {
         let groupsList: DerivedGroup[] = [];
         $codeMap.groups.forEach(group => {

            let groupItem:DerivedGroup = {
               groupId: '',
               blocks: [],
               color: '',
               name: '',
               visible: false
            };
            groupItem.groupId = group.groupId;
            groupItem.name = group.name;
            groupItem.color = group.color;
            groupItem.blocks = [];
            groupItem.visible = group.visible;

            group.blockIds.forEach(groupId => {
               $codeMap.flatTree.forEach(treeItem => {
                  if (treeItem.id.toString() === groupId.toString())
                  {
                     groupItem.blocks.push(treeItem); 
                  }
               });
            });
            groupsList.push(groupItem);
         });
         return groupsList;
      }
   }
);

export interface item { id: string, name: string, code: string, color: string, placeholders: Array<string>, language: string, visible: string, tempId:string, linkedBlocks:[], tags: Array<string> };

export const page = writable(originPage, (set) => {
   console.log("Store Tags Set!");
   console.log(originPage);

   return () => { };
});
