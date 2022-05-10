<script lang="ts">
  import { codeMap, currentlySelected, debug, editItem, editMode, items } from "../store";
  import type { DerivedGroup, FilteredTree, Group, Item } from "../../src/Models";
  import { OutlineTypeEnum } from "../../src/Models";
  import lodash from "lodash";
  import deepdash from "deepdash";

  const _ = deepdash(lodash);

  //Shared functions for other files

  export const ImportCode = () => {
    if ($debug) console.log("Import Data Start!");
    tsvscode.postMessage({
      type: "ImportDataFromFile",
      value: true,
    });
  };

  export const getNonce = () => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  export const changedName = (item: Item, isEditItem: boolean) => {
    if (!isEditItem) {
      let i = $items.customSnippets.filter((x) => {
        if (x.id === item.id) {
          x.name = item.name;
          if ($debug) console.log(x);
        } else {
          x = x;
        }
        return x;
      });
      //tsvscode.setState({ i });
      $items.customSnippets = [...i];
    } else {
      let i: Item = $editItem;
      i.name = item.name;
      //tsvscode.setState({ i });
      $editItem = i;
    }
  };

  export const ChangeLanguage = (e: any) => {
    $editItem.language = e.target.value;
  };

  export const changeColor = (e: any, item: Item, isEditItem: boolean) => {
    if ($debug) {
      console.log(e);
      console.log(item);
    }
    item.color = e.target.value;

    if (isEditItem) {
      $items.customSnippets = $items.customSnippets.map((i) => {
        if (i.id === item.id) {
          i.color = item.color;
        }
        return i;
      });
    } else {
      let i = $editItem;
      i.color = item.color;
      $editItem = i;
    }
  };

  export const changeTags = (e: any, item: Item, isEditItem: boolean) => {
    if ($debug) {
      console.log(e);
      console.log(item);
    }

    if (!isEditItem) {
      $items.customSnippets = $items.customSnippets.map((i) => {
        if (i.id === item.id) {
          var array = e.target.value.split(",");
          i.tags = array;
        } else {
          i = i;
        }
        return i;
      });
    } else {
      let i = $editItem;
      var array = e.target.value.split(",");
      i.tags = array;
      $editItem = i;
    }
  };

  export const updateTagView = () => {
    let selectedTags = $items.selectedTags ?? [];

    let i = $items.customSnippets.filter((item) => {
      let found = 0;

      if (typeof item.tags !== "undefined" && typeof $items.selectedTags !== "undefined") {
        if (selectedTags.length === 0) {
          //EMTPY
          item.visible = "";
          return item;
        } else {
          //NOT EMTPY

          selectedTags.forEach((selectedTag) => {
            if (item.tags.findIndex((tagName) => tagName.toUpperCase().includes(selectedTag)) !== -1) {
              // x.visible = "";
              found = ++found;
            } else {
              //x.visible = "None";
            }
          });
        }
      }

      if (found > 0) {
        item.visible = "";
      } else {
        item.visible = "None";
      }

      return item;
    });

    $items.customSnippets = [...i];
  };

  export const onGroupNameChange = (derivedGroup, e: any) => {
    let group = $codeMap.groups.find((group) => group.groupId === derivedGroup.groupId);

    if (group) {
      group.name = e.target.value;
      let index = $codeMap.groups.indexOf(group);
      $codeMap.groups.splice(index, 1, group);
    }
  };

  export const HideGroup = (derivedGroup: DerivedGroup) => {
    let group: any = $codeMap.groups.find((group) => group.groupId === derivedGroup.groupId);

    if (group) {
      if (typeof derivedGroup.visible === "undefined" || derivedGroup.visible === true) {
        group.visible = false;
      } else {
        group.visible = true;
      }

      derivedGroup.blocks.forEach((block) => {
        $codeMap.flatTree.forEach((treeItem) => {
          if (block.id.toString() === treeItem.id.toString()) {
            treeItem.visible = group.visible;
          }
        });
      });
      ReRenderBlocks();
      // let index = $codeMap.groups.indexOf(group);
      // $codeMap.groups.splice(index, 1);
    }
  };

  export const ParentHasClass = (element: HTMLElement, classname: string): boolean | null => {
    if (element.classList.contains(classname) === true) return true;
    return element.parentNode && ParentHasClass(<HTMLElement>element.parentNode, classname);
  };

  export const ParentHasId = (element: HTMLElement, id: string): boolean | null => {
    if (element?.id?.indexOf(id) >= 0) return true;
    return element.parentNode && ParentHasId(<HTMLElement>element.parentNode, id);
  };

  export const MoveToCanvasFromPocket = (e: any) => {
    $codeMap.pocket.forEach((block) => {
      if (block.id.toString() === e.target.id) {
        if (typeof $codeMap.flatTree.find((b) => b.id === block.id) === "undefined") {
          let index = $codeMap.pocket.indexOf(block);
          $codeMap.pocket.splice(index, 1);
          block.visible = true;
          $codeMap.flatTree.push(block);
          $codeMap = $codeMap;
        } else {
          let existingBlock = $codeMap.flatTree.find((b) => b.id === block.id);
          let index = $codeMap.pocket.indexOf(block);
          $codeMap.pocket.splice(index, 1);
          existingBlock.visible = true;
          $codeMap.pocket = $codeMap.pocket;
        }
      }
    });
  };

  export const MoveToCanvasFromOutline = (e: any) => {
    $codeMap.activeWindow.flatOutline.forEach((block) => {
      if (block.id.toString() === e.target.id) {
        if (typeof $codeMap.flatTree.find((b) => b.id === block.id) === "undefined") {
          let index = $codeMap.activeWindow.flatOutline.indexOf(block);
          $codeMap.activeWindow.flatOutline.splice(index, 1);
          block.visible = true;
          $codeMap.flatTree.push(block);
          $codeMap = $codeMap;
        } else {
          let existingBlock = $codeMap.flatTree.find((b) => b.id === block.id);
          let index = $codeMap.activeWindow.flatOutline.indexOf(block);
          $codeMap.activeWindow.flatOutline.splice(index, 1);
          existingBlock.visible = true;
          $codeMap.activeWindow.flatOutline = $codeMap.activeWindow.flatOutline;
        }
      }
    });
  };

  const ReRenderBlocks = () => {
    if ($debug) {
      console.log("RenderBlocks");
    }

    if ($codeMap?.flatTree) {
      SetVisibility();

      $codeMap.flatTree = [...new Set($codeMap.flatTree)];

      return;
    }
  };

  function SetVisibility() {
    $codeMap?.flatTree.forEach((treeItem) => {
      if (typeof treeItem.visible === "undefined") treeItem.visible = true;
    });
  }

  export function GetOutline(currentParentBlock) {
    let OutlineArray = [];

    if ($codeMap?.activeWindow?.outline) {
      let outline = $codeMap.activeWindow.outline;
      if (outline.length > 0) {
        if ($debug) {
          console.log("OUTLINE: ");
          console.log(outline);
        }
        $codeMap.activeWindow.flatOutline = [];
        // let currentParentBlock = $codeMap.activeWindow.block;

        _.eachDeep(outline, (value, key, parentValue, context) => {
          if (typeof value === "object" && typeof value.name !== "undefined") {
            // console.log(`${key} : ${outline[key]}`);
            let defaultVisibility = false;
            // if (value.kind !== 5) {
            //   vis = false;
            // }

            let newTreeItem = {
              id: value.id,
              parentId: currentParentBlock?.id ?? -99,
              path: value.location.uri.path,
              name: value.name,
              size: 0,
              type: "outline",
              color: "",
              visible: defaultVisibility,
              open: null,
              children: [],
              extension: OutlineTypeEnum[value.kind],
              locationX: currentParentBlock?.locationX ?? "0",
              locationY: currentParentBlock?.locationY ?? "0",
              startLine: value.location.range._start._line,
              startCharacter: value.location.range._start._character,
              endLine: value.location.range._end._line,
              endCharacter: value.location.range._end._character,
              linkedTargetBlocks: [],
            };
            let hit = 0;
            if ($codeMap.activeWindow.flatOutline.length > 0) {
              $codeMap.activeWindow.flatOutline.forEach((flatItem) => {
                if (
                  flatItem.id === newTreeItem.id ||
                  (typeof flatItem?.uri?.path !== "undefined" && flatItem.name === newTreeItem.name && flatItem.uri.path === newTreeItem.uri.path)
                ) {
                  hit += 1;
                }
              });
            }

            if (hit === 0) {
              if ($debug) {
                console.log("New Outline item added:");
                console.log(newTreeItem);
              }
              // $codeMap.flatTree.push(newTreeItem);
              $codeMap.activeWindow.flatOutline.push(newTreeItem);
            }
          }
        });
        //$codeMap.flatTree = [...$codeMap.flatTree, ...OutlineArray];
      }
    }

    return OutlineArray;
  }

  export function ColorCode(path) {
    let colorBlocks = [];
    $codeMap?.flatTree?.forEach((block) => {
      if (block.visible && block.path === path && block.id !== "generated") {
        colorBlocks.push(block);
      }
    });

    if ($items?.settings?.colorCodetoMatchCodeBlocks && colorBlocks.length > 0) {
      tsvscode.postMessage({
        type: "colorActiveCode",
        value: colorBlocks,
      });
    }
  }


  export function expand(e: any, moveable:any = null) 
  {
    console.log(e);
    let menu = document.querySelector(".menu");
    let selctedTreeItem = $codeMap.flatTree.find(x => x.id === e.currentTarget.id);

    if(selctedTreeItem)
    {
      //Phase this out...
      $currentlySelected = [];
      $currentlySelected.push(selctedTreeItem.id);
      //Keep these...
      $codeMap.activeWindow.activelySelectedBlocks = [];
      $codeMap.activeWindow.activelySelectedBlocks.push(selctedTreeItem);

    }

    if (!selctedTreeItem){

    }

 

    if (menu !== null && menu !== undefined) {
      if (menu.classList.contains("opened")) {
        menu.style.transform = "scale(0)";
        
        menu.classList.remove("opened");
        //New stuff here!!!
      } else {
        menu.style.transform = "scale(3)";
        menu.style.background = "#23568a38";
        menu.style.left = $codeMap.activeWindow.activelySelectedBlocks[0].locationX + "px";
        menu.style.top = $codeMap.activeWindow.activelySelectedBlocks[0].locationY + "px";
        //New stuff here!!!
        menu.classList.add("opened");
      }
    }
    e.preventDefault();
  }


  export function GetLeftMostPixelFromGroup(group: any){
    let blocks: FilteredTree[] = [];
    group.blockIds.forEach(blockId => {
      blocks.push($codeMap.flatTree.find(x => x.id === blockId));
    });
    
    let leftMostPixel = 99999;
    blocks.forEach((block) => {
      if (+block.locationX < leftMostPixel) {
        leftMostPixel = +block.locationX;
      }
    });
    return leftMostPixel;
  }

  export function GetTopMostPixelFromGroup(group: any){
    let blocks: FilteredTree[] = [];
    group.blockIds.forEach(blockId => {
      blocks.push($codeMap.flatTree.find(x => x.id === blockId));
    });
    
    let topMostPixel = 99999;
    blocks.forEach((block) => {
      if (+block.locationY < topMostPixel) {
        topMostPixel = +block.locationY;
      }
    });
    return topMostPixel;
  }

  export const ErrorMessageVSCall = (message: any) => {
    tsvscode.postMessage({
      type: "onError",
      value: message,
    });
  };

  // export function GetLeftMostPixelFromBlock(blocks: FilteredTree[]) {
  //   let leftMostPixel = 99999;
  //   blocks.forEach((block) => {
  //     if (+block.locationX < leftMostPixel) {
  //       leftMostPixel = +block.locationX;
  //     }
  //   });
  //   return leftMostPixel;
  // }

  // export function GetToptMostPixelFromBlock(blocks: FilteredTree[]) {
  //   let topMostPixel = 99999;
  //   blocks.forEach((block) => {
  //     if (+block.locationY < topMostPixel) {
  //       topMostPixel = +block.locationY;
  //     }
  //   });
  //   return topMostPixel;
  // }

  export function GetBottomMostPixelFromGroup(group: any){
    let blocks: FilteredTree[] = [];
    group.blockIds.forEach(blockId => {
      blocks.push($codeMap.flatTree.find(x => x.id === blockId));
    });
    
    let bottomMostPixel = -99999;
    blocks.forEach((block) => {
      if (+block.locationY > bottomMostPixel) {
        bottomMostPixel = +block.locationY;
      }
    });
    return bottomMostPixel;
  }

  export function GetRightMostPixelFromGroup(group: any){
    let blocks: FilteredTree[] = [];
    group.blockIds.forEach(blockId => {
      blocks.push($codeMap.flatTree.find(x => x.id === blockId));
    });
    
    let rightMostPixel = -99999;
    blocks.forEach((block) => {
      if (+block.locationX > rightMostPixel) {
        rightMostPixel = +block.locationX;
      }
    });
    return rightMostPixel;
  }

    //Pin/Unpin block
  export function StarClicked(treeItem: FilteredTree) {
    if (treeItem.starred) {
      treeItem.starred = false;
    } else {
      treeItem.starred = true;
    }

    let index = $codeMap.flatTree.indexOf(treeItem);
    $codeMap.flatTree.splice(index, 1, treeItem);
    $codeMap.flatTree = $codeMap.flatTree;

    StarSelectedBlocks();
  }

  
  function StarSelectedBlocks() { 
    let selectedBlocks = $codeMap.activeWindow.activelySelectedBlocks;
    let setVisibility = false;

    if (selectedBlocks[0].visible === false) 
      setVisibility = true;
    selectedBlocks.forEach(selectedBlock => {
      selectedBlock.visible = setVisibility;
    });
  }
</script>

<main />

<style>
</style>
