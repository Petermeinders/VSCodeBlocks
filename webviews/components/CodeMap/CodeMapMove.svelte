<script lang="ts">
  import {
    codeMap,
    currentZoom,
    currentScaleX,
    currentScaleY,
    perimeterItem,
    currentlySelected,
    items,
    debug,
    activelySelectedText,
    activePath,
    lines,
    activeSelectionMeta,
    rightClickedBlockEvent,
    groupedSquares,
    blockContainerStore,
zoom,
  } from "../../store";
  import Fa from "svelte-fa";
  import type { FilteredTree, Group, BlockContainerInterface } from "../../../src/Models";
  import { OutlineTypeEnum } from "../../../src/Models";
  import Card from "./Card/Card.svelte";
  import { onMount, afterUpdate, beforeUpdate, tick, createEventDispatcher } from "svelte";
  import DragSelect from "dragselect";
  import lodash from "lodash";
  import deepdash from "deepdash";
  import Line from "./Line.svelte";
  import Shared from "../Shared.svelte";
  import { faSave } from "@fortawesome/free-regular-svg-icons";
  import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
  import panzoom from "panzoom";
  import { Sibling, Type } from "../../../src/Models";
  import GroupOfBlocks from "./GroupOfBlocks.svelte";
  import BlockContainer from "./Card/BlockContainer.svelte";
  import MovableBlock from "./Card/MovableBlock.svelte";
  import Moveable from "svelte-moveable";
import { scale } from "svelte/transition";
import { } from "os";
import Selecto from "svelte-selecto";


  let common: Shared;
  let moveable: Moveable;
  let isMoving = false;
  let faketree = [];
  let changedFile = "";

  $: $codeMap?.activeWindow?.path, onWindowChange();
  $: $codeMap
  $: $activelySelectedText, SelectedTextChange();

  onMount(async () => {
    var element = document.querySelector("#canvas-inner");

    // And pass it to panzoom
    var instance = panzoom(element, {
      // zoomSpeed: 0.095,
      smoothScroll: false,
      maxZoom: 1,
      minZoom: 0.1,
      initialZoom: 1,
      beforeMouseDown: function (e) {
        // allow mouse-down panning only if altKey is down. Otherwise - ignore
        var shouldIgnore = !e.altKey;
        return shouldIgnore;
      },
    });

    instance.on("zoom", function (e) {
      console.log(e.getTransform());
      $currentZoom = e.getTransform().scale;
      $currentScaleX = e.getTransform().x;
      $currentScaleY = e.getTransform().y;
      //e.zoomTo(.90);
      // ds.zoom = e.getTransform();
      console.log("LOADED!");
      console.log(instance.getTransform());
      $zoom = instance?.getTransform()?.scale;
      // document.getElementById("area").style.transform = `scale(${e.getTransform()})`;
    });

  });

  beforeUpdate(() => {
    RenderBlocks();
  });

  const RenderBlocks = () => {
    if (!isMoving) {
      if ($debug) {
        console.log("RenderBlocks");
      }

      if ($codeMap?.flatTree) {
        SetVisibility();

        $codeMap.flatTree = [...new Set($codeMap.flatTree)];
        //ColorCode();
        return;
      }

      if ($codeMap?.canvas) {
        if ($codeMap.canvas !== "noAutoMap") {
          faketree = JSON.parse(JSON.stringify($codeMap.canvas.children));
          FlattenTree(faketree);

          // faketree = _.index(faketree)

          $codeMap.flatTree = [...new Set(faketree)];
        } else {
          $codeMap.flatTree = [];
        }
      }
    }
  };

  const OnDragEnded = (target:HTMLDivElement, treeItem: FilteredTree) => {
    console.log(target);
    console.log(treeItem);


    if (treeItem?.id === "generated") {
        if (treeItem?.sibling === Sibling.Self) {
          ConvertGeneratedBlock(target, true);
        } else {
          ConvertGeneratedBlock(target, false);
        }
      }
  }

  function FlattenTree(newTree) {
    newTree.forEach((item) => {
      let c = item.children;
      item.children = null;
      faketree.push(item);
      if (Array.isArray(c)) {
        FlattenTree(c);
      }
    });
  }

  function SetVisibility() {
    $codeMap?.flatTree.forEach((treeItem) => {
      if (typeof treeItem.visible === "undefined") treeItem.visible = true;
    });
  }

  function onWindowChange() {
    if ($codeMap?.flatTree) {
      if (changedFile === $codeMap?.activeWindow?.path) {
        return;
      }

      HideOutline();

      // $codeMap.activeWindow.outline[0].location.uri.path

      // if (typeof $codeMap.activeWindow.block !== "undefined")
      // {
      //   GetOutline();

      // }

      changedFile = $codeMap?.activeWindow?.path;

      $codeMap.flatTree.forEach((flatItem) => {
        if (flatItem?.path === changedFile) {
          console.log(flatItem.name);
          flatItem.visible = true;
          $codeMap.activeWindow.id = flatItem.id.toString();
          $codeMap.activeWindow.block = flatItem;
          common.GetOutline($codeMap.activeWindow.block);
          ShowRecursivelyUPFromFile(flatItem, false);
          //ShowRecursivelyDOWNFromFile(flatItem);

          RenderBlocks();

          // if (treeItem.parentId === 0){
          // $codeMap.flatTree.forEach((innerItem) => {
          //   if (innerItem.parentId === $codeMap.activeWindow.id)
          //   {
          //     innerItem.visible = true;
          //   }
          // });

          // }
        }
      });
      common?.GetOutline($codeMap.activeWindow.block);
    }
  }

  function HideOutline() {
    $codeMap.flatTree.forEach((flatItem) => {
      if (flatItem.type === "outline" && flatItem.starred !== true) {
        flatItem.visible = false;
      }
    });
  }

  function ShowRecursivelyUPFromFile(treeItem, outlineVisible) {
    $codeMap.flatTree.forEach((flatItem) => {
      if (flatItem.id === treeItem.parentId) {
        //If not-outline, check if closed. If outline, check settings chechboxes.
        if (treeItem.type !== "outline" || (flatItem.type === "outline" && outlineVisible === true && isOutlineItemVisible(flatItem.extension))) {
          flatItem.visible = true;
        }

        ShowRecursivelyUPFromFile(flatItem, outlineVisible);
      }
    });
  }

  function wheelHandler(event) {
    console.log(event);
    if (event.deltaY > 0) {
      console.log("wheel backward");
      $zoom =  $zoom +1;
      
    } else {
      console.log("wheel forward");
      $zoom = $zoom +1;

      //moveable.getInstance().zoom = moveable.getInstance().zoom + 0.1;
      //console.log(moveable.getInstance());
    }
  }

  function SaveCodeMapToFile() {
    tsvscode.postMessage({
      type: "saveCodeMap",
      value: $codeMap,
    });
  }

  function SaveASCodeMapToFile() {
    tsvscode.postMessage({
      type: "saveASCodeMap",
      value: $codeMap,
    });
  }

  function LoadCodeMap() {
    tsvscode.postMessage({
      type: "LoadCodeMapFromFile",
      value: true,
    });
  }

  function LoadFROMCodeMap() {
    tsvscode.postMessage({
      type: "LoadFROMCodeMapFromFile",
      value: true,
    });
  }

  function OrganizeSelected() {
    //let selected = ds.getSelection();
    console.log($currentlySelected);

    // let clickedElement = $currentlySelected[0];

    $currentlySelected.reverse();

    let childPos = $currentlySelected[0].getBoundingClientRect();
    let parentPos = $currentlySelected[0].parentElement.getBoundingClientRect();
    let firstX = childPos.x - parentPos.x;
    let firstY = childPos.y - parentPos.y;

    $currentlySelected.forEach((item) => {
      item.getBoundingClientRect();
      let translate = "translate3d(" + firstX + "px, " + firstY + "px, 1px) scale(" + $currentZoom + ")";

      item.style.transform = translate;
      firstY += 56;
      ds.addSelection(item);
    });
  }

  function OnNewContainerClick() {
    let newContainer: BlockContainerInterface = {
      id: common.getNonce(),
      name: "Name Here!",
      blocks: [],
      locationX: 0,
      locationY: 0,
    };
    $blockContainerStore.push(newContainer);
    $blockContainerStore = $blockContainerStore;
    console.log($blockContainerStore);
  }

  function SelectedTextChange() {
    // let existingOutline = ShowActivelySelectedOutline();
    if ($activelySelectedText.length > 0) {
      GenerateCodeBlockFromSelectedText(Sibling.Self, undefined);
    }
  }


  export const GenerateCodeBlockFromSelectedText = (sibling: Sibling, existingTreeItem: FilteredTree | undefined) => {
    if ($codeMap?.flatTree) {
      let ExistingGenerated = $codeMap?.flatTree.find((x) => x.id === "generated");
      let duplicate = $codeMap?.flatTree.find((x) => x.name === $activelySelectedText && existingTreeItem === undefined);

      if (duplicate !== undefined) {
        //TODO: Highlight duplicate Blocks so it is obvious they are duplicates on screen.
        return;
      }

      // Generating Child/Parent
      if (existingTreeItem && sibling !== Sibling.Self) {
        if (Sibling.Parent) existingTreeItem.type = Type.Folder;

        if (ExistingGenerated) {
          let index = $codeMap?.flatTree.indexOf(ExistingGenerated);
          $codeMap.flatTree.splice(index, 1, existingTreeItem);
          $codeMap.flatTree = [...$codeMap.flatTree];
        } else {
          $codeMap.flatTree = [...$codeMap.flatTree, existingTreeItem];
        }
      } else {
        // Generating new block from selected text or file
        if (ExistingGenerated) {
          let index = $codeMap?.flatTree.indexOf(ExistingGenerated);
          let generatedBlock = {};

          generatedBlock.id = "generated";
          generatedBlock.name = $activelySelectedText.substring(0, 25);
          generatedBlock.path = $activeSelectionMeta.path.toString();
          generatedBlock.code = $activelySelectedText;
          generatedBlock.language = undefined;
          generatedBlock.placeholders = [];
          generatedBlock.color = $items.settings.randomizeNewBlockColors ? "#" + Math.floor(Math.random() * 16777215).toString(16) : "#3c3c3ce3";
          generatedBlock.visible = true;
          generatedBlock.linkedBlocks = [];
          generatedBlock.tags = ["custom"];

          generatedBlock.sibling = sibling;
          generatedBlock.size = undefined;
          generatedBlock.type = "custom";
          generatedBlock.open = true;
          generatedBlock.parentId = undefined;
          generatedBlock.outputx = undefined;
          generatedBlock.outputy = undefined;
          generatedBlock.inputx = undefined;
          generatedBlock.inputy = undefined;
          generatedBlock.children = undefined;
          generatedBlock.extension = "custom";
          generatedBlock.locationX = existingTreeItem !== undefined ? existingTreeItem?.locationX : 0;
          generatedBlock.locationY = existingTreeItem !== undefined ? (+existingTreeItem?.locationY - 100).toString() : 0;
          generatedBlock.startLine = $activeSelectionMeta.startLine.toString();
          generatedBlock.startCharacter = $activeSelectionMeta.startCharacter.toString();
          generatedBlock.endLine = $activeSelectionMeta.endLine.toString();
          generatedBlock.endCharacter = $activeSelectionMeta.endCharacter.toString();
          generatedBlock.starred = $activeSelectionMeta.isStarred;
          generatedBlock.linkedTargetBlocks = [];

          $codeMap.flatTree.splice(index, 1, generatedBlock);
        } else {
          let generatedBlock = {};

          generatedBlock.id = "generated";
          generatedBlock.name = $activelySelectedText.substring(0, 25);
          generatedBlock.path = $activeSelectionMeta.path;
          generatedBlock.code = $activelySelectedText;
          generatedBlock.language = undefined;
          generatedBlock.placeholders = [];
          generatedBlock.color = "#3c3c3ce3";
          generatedBlock.visible = true;
          generatedBlock.linkedBlocks = [];
          generatedBlock.tags = ["custom"];

          generatedBlock.sibling = sibling;
          generatedBlock.size = undefined;
          generatedBlock.type = "custom";
          generatedBlock.open = true;
          generatedBlock.parentId = undefined;
          generatedBlock.outputx = undefined;
          generatedBlock.outputy = undefined;
          generatedBlock.inputx = undefined;
          generatedBlock.inputy = undefined;
          generatedBlock.children = undefined;
          generatedBlock.extension = "custom";
          generatedBlock.locationX = existingTreeItem !== undefined ? existingTreeItem?.locationX : 0;
          generatedBlock.locationY = existingTreeItem !== undefined ? (+existingTreeItem?.locationY + 100).toString() : 0;
          generatedBlock.startLine = $activeSelectionMeta.startLine.toString();
          generatedBlock.startCharacter = $activeSelectionMeta.startCharacter.toString();
          generatedBlock.endLine = $activeSelectionMeta.endLine.toString();
          generatedBlock.endCharacter = $activeSelectionMeta.endCharacter.toString();
          generatedBlock.starred = true;
          generatedBlock.linkedTargetBlocks = [];

          $codeMap.flatTree.push(generatedBlock);
        }
      }
    }
  };

  export const ConvertGeneratedBlock = (target: HTMLDivElement, keepOriginal: boolean) => {
    let selected = $codeMap.flatTree.find((x) => x.id === "generated");
    let duplicate = $codeMap.flatTree.find((x) => x.name === selected?.name && x.id !== "generated" && x.type === Type.Custom);

    if (selected && duplicate === undefined) {
      selected.id = common.getNonce();

      target.id = selected.id;

      //Brand New Block
      if (selected.sibling === Sibling.Self) {
        selected.sibling = Sibling.Self;
        $codeMap.flatTree.push(selected);
        $codeMap.flatTree = [...$codeMap.flatTree];
      } else {
        //Child or Parent block
        if (!keepOriginal) {
          //Remove old block
          selected.sibling = Sibling.Self;
          let existingBlock = $codeMap?.flatTree.find((x) => x.id === selected?.parentOrChildId);
          let index = $codeMap?.flatTree.indexOf(existingBlock);
          $codeMap.flatTree.splice(index, 1);
          $codeMap.flatTree = [...$codeMap.flatTree];
        } else {
          //Keep old block
          selected.sibling = Sibling.Self;
          $codeMap.flatTree.push(selected);
          $codeMap.flatTree = [...$codeMap.flatTree];
        }
      }
      // if (document.getElementById("generated") !== null) {
      //   document.getElementById("generated").id = selected.id;
      // }
      //OnMouseUpObject.items[0].id = selected.id;
    }
  };
</script>


<main id="CodeMapMove" style="width:500px; height:500px;" on:wheel={wheelHandler}>
<Shared bind:this={common} />

<Selecto
    container={ document.querySelector("#CodeMapMove")}
    dragContainer={window}
    selectableTargets={[".target"]}
    selectByClick={true}
    selectFromInside={true}
    continueSelect={false}
    toggleContinueSelect={"shift"}
    keyContainer={window}
    hitRate={100}
    on:select={({ detail: e }) => {
        e.added.forEach(el => {
            el.classList.add("selected");
        });
        e.removed.forEach(el => {
            el.classList.remove("selected");
        });
    }}
    />

  <div class="ds-selected" style="display:none" />
  <div style="display:flex; flex-direction: row;      z-index: 10; position: absolute;">
    <!-- <button type="button" on:click={SaveCodeMapToFile} style="display:inline;"> <Fa size="2x" icon={faSave} style="color:white;" /></button> -->
    <button class="codeBlockTopButtons" type="button" on:click={SaveCodeMapToFile} style="display:inline;">Save</button>
    <button class="codeBlockTopButtons" type="button" on:click={SaveASCodeMapToFile} style="display:inline;">Save As</button>
    <button class="codeBlockTopButtons" type="button" on:click={LoadCodeMap} style="display:inline;">Load</button>
    <button class="codeBlockTopButtons" type="button" on:click={LoadFROMCodeMap} style="display:inline;">Load From</button>
    <button class="codeBlockTopButtons" type="button" on:click={OrganizeSelected} style="display:inline;">Cleanup Selected</button>
    <button class="codeBlockTopButtons" type="button" on:click={OnNewContainerClick} style="display:inline;">New Container</button>
  </div>
  <div id="canvas-inner">
    {#if $codeMap?.flatTree}
        <div class="zoom">
          <!-- Card -->
          {#each $codeMap.flatTree as treeItem}
            <!-- && typeof(treeItem.open) === "undefined" || treeItem?.open === true -->

            <!-- //Not file or directory? //Directory and showFolders === true?   //file and showfiles === true? -->
            {#if typeof treeItem.visible === "undefined" || treeItem?.visible === true}
              {#if (treeItem.type !== Type.Folder) || (treeItem.type !== Type.Folder && $items.settings.showFolders === true) || ( $items.settings.showFiles === true)}
                <MovableBlock {treeItem} {OnDragEnded} />
              {/if}
            {/if}
          {/each}
        </div>
        <!-- Line -->
      {/if}
  </div>
</main>
