// @ts-nocheck
import type { CodeMap, Item, DerivedGroup, GroupedSquare, BlockContainerInterface } from "./../src/Models";
import { writable, derived } from "svelte/store";

let customSnippets: Item[] = [
  {
    id: "0",
    tempId: "",
    name: "test",
    code: "if(${1:condition} ||${1:condition}){${2:expression}})",
    language: "typescript",
    placeholders: ["condition", "expression"],
    color: "white",
    visible: "",
    linkedBlocks: [],
    tags: ["tag1", "tag2"],
  },
];

export let originItems = {
  customSnippets,
  vsSnippets: ["vsSnippets1", "vsSnippets2"],
  selectedTags: [""],
  settings: {
    isFuzzy: false,
    codeBlocksSaveLocation: "",
    codeBlocksSaveLocationBackup: "",
    codeMapSaveLocationRelative: "",
    searchCode: false,
    currentPanel: "",
    hideBlocksBar: false,
    showFolders: false,
    showFiles: true,
    showDefaultRelationship: true,
    showCustomRelationship: true,
    alwaysShowCodeBlockButtons: true,
    strictCodeMapOutlineWordMatch: false,
    mapEntireProject: false,
    colorCodetoMatchCodeBlocks: true,
    randomizeNewBlockColors: false,
    defaultBlockColor: "blue",
    codeMapFolderExclusion: "node_modules|packages",
    visibleOutlineBlocks: [
      { name: "Array", checked: false },
      { name: "Boolean", checked: false },
      { name: "Class", checked: false },
      { name: "Constant", checked: false },
      { name: "Constructor", checked: false },
      { name: "Enum", checked: false },
      { name: "EnumMember", checked: false },
      { name: "Event", checked: false },
      { name: "Field", checked: false },
      { name: "File", checked: false },
      { name: "Function", checked: false },
      { name: "Interface", checked: false },
      { name: "Key", checked: false },
      { name: "Method", checked: true },
      { name: "Module", checked: false },
      { name: "Namespace", checked: false },
      { name: "Null", checked: false },
      { name: "Number", checked: false },
      { name: "Object", checked: false },
      { name: "Operator", checked: false },
      { name: "Package", checked: false },
      { name: "Property", checked: false },
      { name: "String", checked: false },
      { name: "Struct", checked: false },
      { name: "TypeParameter", checked: false },
      { name: "Variable", checked: false },
    ],
  },
};

let originMoveAbles = Array<Moveable>();
let originLinkedBlocks: any[] = [];
let originPage: "code" | "other" = "code";

export const currentlySelected: string | any[] = writable([]);
export const currentZoom = writable(1);
export const flatTree: string | any[] = writable([]);
export const linkedBlocks = writable(originLinkedBlocks);
export const debug = writable(false);
export const blockContainerStore: BlockContainerInterface[] = writable([]);
export const activelySelectedText = writable("");
export const rightClickedBlockEvent: MouseEvent = writable(new MouseEvent("click"));
export const activePath = writable("");
export const lines: string | any[] = writable([]);
export const groupedSquares: GroupedSquare[] = writable([]);
export const searchTerm = writable("");
export const moveAbles = writable(originMoveAbles);
export const items = writable(originItems);
export const zoom = writable(0);

if (tsvscode.getState()?.i !== undefined) {
  originItems = tsvscode.getState()?.i;
}

if (tsvscode.getState()?.p !== undefined) {
  originPage = tsvscode.getState()?.p;
}

export const codeMap: CodeMap = writable({
  canvas: {},
  flatTree: [],
  pocket: [],
  groups: [],
  activeWindow: {},
});

export const activeSelectionMeta = writable({
  startLine: "",
  startCharacter: "",
  endLine: "",
  endCharacter: "",
  path: "",
  isStarred: false,
});

export const editItem = writable({
  id: "0",
  tempId: "",
  name: "test",
  code: "if(${1:condition} ||${1:condition}){${2:expression}})",
  linkedBlocks: [],
  language: "java",
  placeholders: ["condition", "expression"],
  color: "white",
  visible: "",
  tags: ["tag1", "tag2"],
});

export const editMode = writable({
  id: "-1",
  fileName: "",
  importType: "",
});

export const tags = derived(items, ($items) => {
  if (typeof $items !== "undefined") {
    let s = new Set($items?.customSnippets?.map((item) => item.tags).flat());
    let newSet = Array.from(s);
    newSet.forEach((item) => {
      if (typeof item === "undefined") {
        let index = newSet.indexOf(item);
        newSet.splice(index, 1);
      }
    });
    newSet = newSet.map((x) => {
      return x.toUpperCase().trim();
    });
    newSet = newSet.sort((a, b) => a.localeCompare(b));
    let setArray = Array.from(new Set(newSet));
    setArray = ["None", ...setArray];
    return setArray;
  }
});

export const derivedGroups = derived(codeMap, ($codeMap) => {
  if (typeof $codeMap?.groups !== "undefined") {
    let groupsList: DerivedGroup[] = [];
    $codeMap.groups.forEach((group) => {
      let groupItem: DerivedGroup = {
        groupId: "",
        blocks: [],
        color: "",
        name: "",
        visible: false,
      };
      groupItem.groupId = group.groupId;
      groupItem.name = group.name;
      groupItem.color = group.color;
      groupItem.blocks = [];
      groupItem.visible = group.visible;

      group.blockIds.forEach((groupId) => {
        $codeMap.flatTree.forEach((treeItem) => {
          if (treeItem.id.toString() === groupId.toString()) {
            groupItem.blocks.push(treeItem);
          }
        });
      });
      groupsList.push(groupItem);
    });
    return groupsList;
  }
});

export interface item {
  id: string;
  name: string;
  code: string;
  color: string;
  placeholders: Array<string>;
  language: string;
  visible: string;
  tempId: string;
  linkedBlocks: [];
  tags: Array<string>;
}

export const page = writable(originPage, (set) => {
  console.log("Store Tags Set!");
  console.log(originPage);

  return () => {};
});
