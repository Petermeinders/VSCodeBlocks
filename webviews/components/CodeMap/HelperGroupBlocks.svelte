<script lang="ts">
      import {
    codeMap,
    currentZoom,
    currentlySelected,
    items,
    debug,
    activelySelectedText,
    activeSelectionMeta,
    rightClickedBlockEvent,
    groupedSquares,
    zoom,
  } from "../../store";
  import type { FilteredTree, Group, ZoomElement } from "../../../src/Models";
  import Shared from "../Shared.svelte";
  import { onMount, afterUpdate, beforeUpdate } from "svelte";
  import { Sibling, Type } from "../../../src/Models";
  import Card from "./Card/Card.svelte";
  import RadialMenu from "./Card/CardRadial.svelte";
  import Moveable from "svelte-moveable";
  import {} from "os";
  import Selecto from "svelte-selecto";
  import type { OnSelectEnd } from "svelte-selecto";
  import { renderer } from "../../renderer";
  import FutureFeatures from "./FutureFeatures.svelte";

  let common: Shared;
  let moveable: Moveable;
  let isMoving = false;
  let faketree = [];
  let changedFile = "";
  let selecto: Selecto;
  let zoomElements: ZoomElement[] = [];
  let hasCanvasRenderedYet;


  export function GroupBlocks(e: MouseEvent) {
    let blocks = GetSelectedCodeBlocks($codeMap.activeWindow.activelySelectedBlocks);

    //No blocks selected
    if (blocks.length === 0) {
      let radialItemId = CheckforRadialItemClick(e.target);
      let tempArray = new Array();
      tempArray.push($rightClickedBlockEvent.target);
      blocks = GetSelectedCodeBlocks(tempArray);
      if (blocks.length === 0) return;
    }

    let foundGroup: Group = undefined;
    let problemFound = 0;
    let lastItem = $codeMap?.groups?.slice(-1)[0]; //Check if any groups exist
    let newGroup;
    let singleBlockNotInGroup = false;

    //Get first block selected and check if it's in a group (make sure only 1).
    if ($codeMap?.groups?.length > 0) {
      $codeMap?.groups.forEach((group: Group) => {
        group.blockIds.forEach((id) => {
          if (id === blocks[0].id) {
            foundGroup = group;
          }
        });
      });

      //Make sure other selected blocks are in the same group
      if (foundGroup) {
        foundGroup.blockIds.forEach((id) => {
          if (blocks.findIndex((block) => block.id === id) === -1) {
            problemFound += 1;
          }
        });
      }

      //Throw error message if no group found but other blocks are in a group;
      if (foundGroup && problemFound > 0) {
        common.expand(e);
        common.ErrorMessageVSCall("You can't group a group with a single block. Ungroup first.");
        return;
      }

      if (foundGroup) {
        RemoveColor(foundGroup);
        let index = $codeMap.groups.indexOf(foundGroup);
        $codeMap.groups.splice(index, 1);
        foundGroup.blockIds.forEach((blockId) => {
          document.querySelector("[id='" + blockId + "']")?.removeAttribute("data-groupId");
        });
        // RenderBlocks();
      } else {
        AddGroup(blocks);
      }
    } else {
      $codeMap.groups = Array<Group>();
      AddGroup(blocks);
    }

    common.expand(e);
  }

  function GetSelectedCodeBlocks(selectedBlocks) {
    let blocksList = [];
    selectedBlocks.forEach((block) => {
      $codeMap.flatTree.forEach((flatBlock) => {
        if (flatBlock.id.toString() === block.id.toString()) {
          blocksList.push(flatBlock);
        }
      });
    });

    return blocksList;
  }

  function CheckforRadialItemClick(target) {
    let radialItemId;
    if (target?.nodeName === "path") {
      radialItemId = target.parentElement.parentElement.parentElement.id;
      $currentlySelected.push(target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement);
      return radialItemId;
    }
    if (target?.nodeName === "svg") {
      radialItemId = target.id;
      $currentlySelected.push(target.parentElement.parentElement.parentElement);
      return radialItemId;
    }
  }

  function AddGroup(blocks: FilteredTree[]) {
    let newGroup = { groupId: common.getNonce(), blockIds: [], name: "New Group", visible: true, width: 0, height: 0, top: 0, left: 0 };
    $groupedSquares.push({
      groupId: common.getNonce(),
      blocks: blocks,
    });

    $groupedSquares = $groupedSquares;
    newGroup.color = "#" + Math.floor(Math.random() * 16777215).toString(16);

    blocks.forEach((block) => {
      newGroup.blockIds.push(block.id);
      block.color = newGroup.color;
      let blockIndex = $codeMap.flatTree.indexOf(block);
      if (blockIndex !== -1) {
        $codeMap.flatTree.splice(blockIndex, 1, block);
      }

      //Add groupid to element
      document.querySelector("[id='" + block.id + "']")?.setAttribute("data-groupId", newGroup.groupId);
    });

    let newSet = [...new Set(newGroup.blockIds)];
    newGroup.blockIds = newSet;
    newGroup.width = $codeMap.activeWindow.selectionBorder.width;
    newGroup.height = $codeMap.activeWindow.selectionBorder.height;
    newGroup.top = $codeMap.activeWindow.selectionBorder.top;
    newGroup.left = $codeMap.activeWindow.selectionBorder.left;

    // newGroup = RenderGroupRectangle(newGroup);
    $codeMap.groups.push(newGroup);
  }

  function RemoveColor(group) {
    $codeMap.flatTree.forEach((treeItem) => {
      group.blockIds.forEach((blockId) => {
        if (treeItem.id.toString() === blockId.toString()) {
          treeItem.color = null;
        }
      });
    });
  }



</script>

<Shared bind:this={common} />