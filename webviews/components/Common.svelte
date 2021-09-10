<script lang="ts">
  import { codeMap, debug, editItem, editMode, items } from "../store";
  import type { Item } from "../store";


  export const ImportCode = () => {
    if ($debug) console.log("Import Data Start!");
    tsvscode.postMessage({
      type: "ImportDataFromFile",
      value: true,
    });
  }

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

  export const ChangeLanguage = (e) => {
    $editItem.language = e.target.value;
  }

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
  }

  export const onGroupNameChange = (derivedGroup, e) => {
    let group = $codeMap.groups.find((group) => group.groupId === derivedGroup.groupId);

    if (group) {
      group.name = e.target.value;
      let index = $codeMap.groups.indexOf(group);
      $codeMap.groups.splice(index, 1, group);
    }
  }

  export const HideGroup = (derivedGroup) => {
    let group = $codeMap.groups.find((group) => group.groupId === derivedGroup.groupId);

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
  }

  export const ParentHasClass = (element: HTMLElement, classname: string): boolean | null => {
    if (element.classList.contains(classname) === true) return true;
    return element.parentNode && ParentHasClass(<HTMLElement>element.parentNode, classname);
  };

  export const ParentHasId = (element: HTMLElement, id: string): boolean | null => {
    if (element?.id?.indexOf(id) >= 0) return true;
    return element.parentNode && ParentHasId(<HTMLElement>element.parentNode, id);
  };

  export const MoveToCanvas = (e) => {
    $codeMap.pocket.forEach((block) => {
      if (block.id.toString() === e.target.id) {
        if (typeof $codeMap.flatTree.find(b => b.id === block.id) === "undefined")
        {
          let index = $codeMap.pocket.indexOf(block);
          $codeMap.pocket.splice(index, 1);
          block.visible = true;
          $codeMap.flatTree.push(block);
          $codeMap = $codeMap;
        }
        else
        {
         let existingBlock = $codeMap.flatTree.find(b => b.id === block.id);
         let index = $codeMap.pocket.indexOf(block);
         $codeMap.pocket.splice(index, 1);
         existingBlock.visible = true;
         $codeMap.pocket = $codeMap.pocket;
        }
      }
    });
  }

  const ReRenderBlocks = () => {

      if ($debug) {
        console.log("RenderBlocks");
      }

      if ($codeMap?.flatTree) {
        SetVisibility();

        $codeMap.flatTree = [...new Set($codeMap.flatTree)];

        return;
      }
    }


    function SetVisibility() {
    $codeMap?.flatTree.forEach((treeItem) => {
      if (typeof treeItem.visible === "undefined") treeItem.visible = true;
    });
  }
  
</script>

<main>

</main>

<style>
</style>
