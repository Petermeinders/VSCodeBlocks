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
  import type {ZoomElement } from "../../../src/Models";
  import { newBlock } from "../../../src/Models";
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
  import HelperGroupBlocks from "./HelperGroupBlocks.svelte";

  let common: Shared;
  let helperGroupBlocks: HelperGroupBlocks;

  let moveable: Moveable;
  let isMoving = false;
  let faketree = [];
  let changedFile = "";
  let selecto: Selecto;
  let zoomElements: ZoomElement[] = [];
  let hasCanvasRenderedYet;

  let isScrolling = false;

  //FrameMap is needed for Movable and Selecto
  const frameMap = new Map();
  let targets = [];

  $: $codeMap?.activeWindow?.path, onWindowChange();
  $: $codeMap;
  $: $activelySelectedText, SelectedTextChange();

  onMount(async () => {
    // var element = document.querySelector("#canvas-inner");
    // var selectoElement = document.querySelector("#canvas-inner");

    hasCanvasRenderedYet = document.getElementById("canvas-inner");
    if (hasCanvasRenderedYet) {
      PanZoomFunction();
    }
  });

  beforeUpdate(() => {
    RenderBlocks();
  });

  afterUpdate(() => {
    isScrolling = false;
  });

  const PanZoomFunction = () => {
    zoomElements = zoomElements.filter((element) => {
      return element !== null;
    });

    const container = document.getElementById("CodeMapMove");
    const el = document.getElementById("selecto1");
    zoomElements.push(el);

    zoomElements = zoomElements.filter((element) => {
      return element.element !== null;
    });

    //const elBoxo = document.getElementsByClassName("moveable-control-box");
    const zoomPan = renderer({ scaleSensitivity: 5, minScale: 0.1, maxScale: 30, element: el });
    if (container) {
      container.addEventListener("wheel", (event) => {
        event.preventDefault();
        zoomPan.zoom({
          deltaScale: Math.sign(event.deltaY) > 0 ? -1 : 1,
          x: event.pageX,
          y: event.pageY,
        });
      });

      container.addEventListener("mousemove", (event) => {
        if (event.buttons !== 2) {
          return;
        }

        zoomPan.panBy({
          originX: event.movementX,
          originY: event.movementY,
        });
      });

      container.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        console.log("right lcicked;");
        if (event?.target?.classList?.contains("moveable-area")) {
          common.expand(event, moveable);
        }
      });

      container.addEventListener("mouseup", (event) => {
        if (event.button !== 2) {
          return;
        }
        //$zoom = $zoom + 1;
      });

      container.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
          //TODO: Move this to constant;
          if (event?.target?.id === "background-grid") {
            common.CloseAllRadials();
          }
          console.log("left down");
        }

        if (event.button === 2) {
          //TODO: Move this to constant;
          if (event?.target?.id === "background-grid") {
            common.CloseAllRadials();
          }
          console.log("Right down");
        }

        // $zoom = $zoom - 1;
        if (event.buttons !== 2) {
          return;
        }
      });
    }
  };

  const RenderBlocks = () => {
    if (!isMoving) {
      if ($debug) {
        console.log("RenderBlocks");
      }

      if ($codeMap?.flatTree) {
        SetVisibility();

        $codeMap.flatTree = [...new Set($codeMap.flatTree)];

        return;
      }

      if ($codeMap?.canvas) {
        if ($codeMap.canvas !== "noAutoMap") {
          faketree = JSON.parse(JSON.stringify($codeMap.canvas.children));
          FlattenTree(faketree);

          $codeMap.flatTree = [...new Set(faketree)];
        } else {
          $codeMap.flatTree = [];
        }
      }
    }
  };

  function HideGroupNameAndBorderOnMove() {
    if (selecto) {
      document.querySelectorAll(".groupName").forEach((element) => {
        element.style.visibility = "hidden";
      });

      document.querySelectorAll(".groupBorder").forEach((element) => {
        element.style.visibility = "hidden";
      });
    }
  }

  function ShowGroupNameAndBorderAfterMove() {
    if (selecto) {
      document.querySelectorAll(".groupName").forEach((element) => {
        element.style.visibility = "visible";
      });

      document.querySelectorAll(".groupBorder").forEach((element) => {
        element.style.visibility = "visible";
      });
    }
  }

  function getTranslateX(myElement) {
    var style = window.getComputedStyle(myElement);
    var matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
  }

  function getTranslateY(myElement) {
    var style = window.getComputedStyle(myElement);
    var matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m42;
  }

  const OnSingleDragEnded = (target: HTMLDivElement) => {
    var generatedTree;
    if (target && target.children.length > 0 && target.children[0].id === "generated") {
      generatedTree = HandleGeneratedBlock(target);
    }

    let treeItem = $codeMap.flatTree.find((item) => item.id == target.children[0].id);

    if (generatedTree) {
      treeItem = generatedTree;
    }

    if (treeItem) {
      treeItem.locationX = getTranslateX(target).toString();
      treeItem.locationY = getTranslateY(target).toString();
      treeItem.imageHeight = target.clientHeight;
      treeItem.imageWidth = target.clientWidth;

      let index = $codeMap?.flatTree.indexOf(treeItem);
      $codeMap.flatTree.splice(index, 1, treeItem);
      $codeMap.flatTree = [...$codeMap.flatTree];
    }
  };

  const HandleGeneratedBlock = (target: HTMLDivElement) => {
    console.log(target);
    let treeItem = $codeMap.flatTree.find((item) => item.id === "generated");
    console.log(treeItem);

    if (treeItem?.id === "generated") {
      if (treeItem?.sibling === Sibling.Self) {
        ConvertGeneratedBlockToPermanent(target, true);
      } else {
        ConvertGeneratedBlockToPermanent(target, false);
      }
      return treeItem;
    }
    return null;
  };

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
      if (treeItem) {
        if (typeof treeItem.visible === "undefined") treeItem.visible = true;
      }
    });
  }

  function onWindowChange() {
    if ($codeMap?.flatTree) {
      if (changedFile === $codeMap?.activeWindow?.path) {
        return;
      }

      HideOutline();

      changedFile = $codeMap?.activeWindow?.path;

      $codeMap.flatTree.forEach((flatItem) => {
        if (flatItem?.path === changedFile) {
          console.log(flatItem.name);
          flatItem.visible = true;
          $codeMap.activeWindow.id = flatItem.id.toString();
          $codeMap.activeWindow.block = flatItem;
          common.GetOutline($codeMap.activeWindow.block);
          ShowRecursivelyUPFromFile(flatItem, false);

          RenderBlocks();
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
    $zoom = $zoom + 1;
  }

  //Calls to the server typescript files
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

  function SelectedTextChange() {
    // let existingOutline = ShowActivelySelectedOutline();
    if ($activelySelectedText.length > 0) {
      GenerateCodeBlockFromSelectedText(Sibling.Self, undefined);
    }
  }

  export const GenerateCodeBlockFromSelectedText = (sibling: Sibling, existingTreeItem, folder = {}) => {
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
        let index = $codeMap?.flatTree.indexOf(ExistingGenerated);
        let generatedBlock = {
    id: "",
    path: "",
    name: "",
    size: undefined,
    type: Type.Custom,
    sibling: Sibling.Self,
    color: "",
    image: "",
    imageHeight: 0,
    imageWidth: 0,
    parentOrChildId: "",
    tags: [],
    placeholders: [],
    code: "",
    language: undefined,
    visible: false,
    open: false,
    parentId: undefined,
    outputx: undefined,
    outputy: undefined,
    inputx: undefined,
    inputy: undefined,
    children: undefined,
    extension: "",
    locationX: "",
    locationY: "",
    startLine: "",
    startCharacter: "",
    endLine: "",
    endCharacter: "",
    starred: false,
    linkedTargetBlocks: [],
    codeDiff: false
 }

 
        generatedBlock.id = "generated";
        generatedBlock.name = $activelySelectedText.substring(0, 25);
        generatedBlock.path = $activeSelectionMeta.path.toString();
        generatedBlock.code = $activelySelectedText;
        generatedBlock.placeholders = [];
        generatedBlock.color = $items.settings.randomizeNewBlockColors ? "#" + Math.floor(Math.random() * 16777215).toString(16) : "#3c3c3ce3";
        generatedBlock.visible = true;
        generatedBlock.tags = ["custom"];

        generatedBlock.sibling = sibling;
        generatedBlock.open = true;
        generatedBlock.extension = "custom";
        generatedBlock.locationX = existingTreeItem !== undefined ? existingTreeItem?.locationX : 0;
        generatedBlock.locationY = existingTreeItem !== undefined ? (+existingTreeItem?.locationY - 100).toString() : 0;
        generatedBlock.startLine = $activeSelectionMeta.startLine.toString();
        generatedBlock.startCharacter = $activeSelectionMeta.startCharacter.toString();
        generatedBlock.endLine = $activeSelectionMeta.endLine.toString();
        generatedBlock.endCharacter = $activeSelectionMeta.endCharacter.toString();
        generatedBlock.starred = $activeSelectionMeta.isStarred;
        generatedBlock.linkedTargetBlocks = [];

        if (folder?.files?.length > 0) {
          //FUTURE IMPLEMENTATION OF FOLDER. ADD EACH FILE IN IT TO THE TREEOBJECT AND GENERATE THEM IN A GROUP

          // folder.forEach((filePath) => {

          // });

          generatedBlock.type = Type.Folder;
          generatedBlock.path = folder.folderPath;
          generatedBlock.name = folder.folderName;
          generatedBlock.starred = true;
        }

        if (ExistingGenerated) {
          $codeMap.flatTree.splice(index, 1, generatedBlock);
        } else {
          generatedBlock.color = "#3c3c3ce3";
          generatedBlock.starred = true;

          $codeMap.flatTree.push(generatedBlock);
        }
        RenderBlocks();
      }
    }
  };

  export const ConvertGeneratedBlockToPermanent = (target: HTMLDivElement, keepOriginal: boolean) => {
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
    }
  };

  const UpdateActivelySelected = (targets: HTMLElement[]) => {
    if (targets !== undefined && targets.length > 0) {
      $codeMap.activeWindow.activelySelectedBlocks = [];
      targets.forEach((target) => {
        let treeItem = $codeMap.flatTree.find((treeItem) => treeItem.id === target.children[0].id);

        if (treeItem) {
          $codeMap.activeWindow.activelySelectedBlocks.push(treeItem);
          $codeMap.activeWindow.activelySelectedBlocks = [...$codeMap.activeWindow.activelySelectedBlocks];
        }
      });
    }
  };

  const SelectAllBlocksInAGroup = (targets: HTMLElement[]) => {
    let firstBlock = targets[0];
    let selectedBlocks: HTMLElement[] = [];

    if (targets.length < 1) {
      return targets;
    }

    $codeMap.groups.forEach((group) => {
      if (group.blockIds.indexOf(firstBlock.children[0].id) !== -1) {
        console.log("group found");
        console.log(group);

        group.blockIds.forEach((id) => {
          selectedBlocks.push(document.querySelector("[id='" + id + "']"));
        });
      }
    });
    if (selectedBlocks.length > 0) {
      //       if (targets.length > 1){
      //   setTimeout(() => AddEventListenerForClick(), 50)
      // }
      return selectedBlocks;
    } else return targets;
  };

  function GetSelectoBorderAndSetActiveStore() {
    if (!$codeMap.activeWindow.selectionBorder) $codeMap.activeWindow.selectionBorder = {};

    if (document.querySelector(".moveable-area")?.getBoundingClientRect()?.top) {
      $codeMap.activeWindow.selectionBorder.top = new WebKitCSSMatrix(document.querySelector(".moveable-area")?.parentElement?.style.transform).m42; //document.querySelector(".moveable-area")?.parentElement?.getBoundingClientRect()?.top;

      // $codeMap.activeWindow.selectionBorder.bottom = document.querySelector(".moveable-area")?.parentElement?.getBoundingClientRect()?.bottom;
      $codeMap.activeWindow.selectionBorder.left = new WebKitCSSMatrix(document.querySelector(".moveable-area")?.parentElement?.style.transform).m41; //document.querySelector(".moveable-area")?.parentElement?.getBoundingClientRect()?.left;
      // $codeMap.activeWindow.selectionBorder.right = document.querySelector(".moveable-area")?.getBoundingClientRect()?.right;
      $codeMap.activeWindow.selectionBorder.width = +document.querySelector(".moveable-area").style.width.replace("px", "");
      $codeMap.activeWindow.selectionBorder.height = +document.querySelector(".moveable-area").style.height.replace("px", "");
    }
  }

  function UpdateActiveBorder(elements: HTMLElement[]) {
    console.log("dragGroupEnd");
    GetSelectoBorderAndSetActiveStore();
    let eGroupId = elements[0]?.getAttribute("data-groupId");
    if (eGroupId) {
      $codeMap.groups.find((x) => x.groupId === eGroupId).width = $codeMap.activeWindow.selectionBorder.width;
      $codeMap.groups.find((x) => x.groupId === eGroupId).height = $codeMap.activeWindow.selectionBorder.height;
      $codeMap.groups.find((x) => x.groupId === eGroupId).top = $codeMap.activeWindow.selectionBorder.top;
      $codeMap.groups.find((x) => x.groupId === eGroupId).left = $codeMap.activeWindow.selectionBorder.left;
    }
  }

  function UpdateGroupName() {
    $codeMap.groups.forEach((group) => {
      let foundZoomGroup = zoomElements.find((f) => f?.element?.id === group.groupId);

      if (foundZoomGroup) {
        //Do nothing
      } else {
        zoomElements.push({ element: document.getElementById(group.groupId), transformationType: "matrix" });
      }
    });
  }
</script>

<main id="CodeMapMove" style="width:100%; height:95vh;" on:wheel={wheelHandler}>
  <Shared bind:this={common} />
  <HelperGroupBlocks bind:this={helperGroupBlocks} />

  <div class="ds-selected" style="display:none" />
  <div style="display:flex; flex-direction: row;      z-index: 10; position: absolute;">
    <!-- <button type="button" on:click={SaveCodeMapToFile} style="display:inline;"> <Fa size="2x" icon={faSave} style="color:white;" /></button> -->
    <button class="codeBlockTopButtons" type="button" on:click={SaveCodeMapToFile} style="display:inline;">Save</button>
    <button class="codeBlockTopButtons" type="button" on:click={SaveASCodeMapToFile} style="display:inline;">Save As</button>
    <button class="codeBlockTopButtons" type="button" on:click={LoadCodeMap} style="display:inline;">Load</button>
    <button class="codeBlockTopButtons" type="button" on:click={LoadFROMCodeMap} style="display:inline;">Load From</button>
    <!-- <button class="codeBlockTopButtons" type="button" on:click={OrganizeSelected} style="display:inline;">Cleanup Selected</button>
    <button class="codeBlockTopButtons" type="button" on:click={OnNewContainerClick} style="display:inline;">New Container</button> -->
  </div>

  {#if hasCanvasRenderedYet}
    <Moveable
      bind:this={moveable}
      draggable={true}
      container={document.getElementById("selecto1")}
      rootContainer={document.getElementById("CodeMapMove")}
      target={targets}
      useResizeObserver={true}
      resizable={true}
      throttleResize={0}
      throttleDrag={0}
      on:clickGroup={({ detail: e }) => {
        selecto.clickTarget(e.inputEvent, e.inputTarget);
        UpdateActivelySelected(e.currentTarget.selectedTargets);
        // AddEventListenerForClick();
      }}
      on:click={({ detail: e }) => {
        console.log("Clicked");
        UpdateActivelySelected([e.target]);
        //  AddEventListenerForClick();
        //UpdateControlBoxBorder()
      }}
      on:drag={({ detail: e }) => {
        const target = e.target;
        const frame = frameMap.get(target);

        frame.translate = e.beforeTranslate;
        target.style.transform = `translate(${frame.translate[0]}px, ${frame.translate[1]}px)`;
      }}
      on:dragStart={({ detail: e }) => {
        const target = e.target;
        console.log("dragstart");
        console.log(e);
        if (!frameMap.has(target)) {
          frameMap.set(target, {
            translate: [0, 0],
          });
        }
        const frame = frameMap.get(target);
        const treeItem = $codeMap.flatTree.find((x) => x.id === target.children[0].id);

        if (treeItem) {
          frame.translate[0] = parseInt(treeItem.locationX);
          frame.translate[1] = parseInt(treeItem.locationY);
        }

        e.set(frame.translate);
      }}
      on:dragEnd={({ detail: e }) => {
        const target = e.target;
        OnSingleDragEnded(target);
        e.target.style.width;
        e.target.style.height;

        //   const blueBorder = document.querySelector("div[data-styled-id='rCS19atnxs']");
        //  if (!zoomElements.find(x => x.element === blueBorder)){
        //     zoomElements.push({element: blueBorder, transformationType: "translate3d"});
        //   }
        //   else {
        //     let el = zoomElements.find(x => x.element === blueBorder);
        //     zoomElements.splice(zoomElements.indexOf(el), 1, {element: blueBorder, transformationType: "translate3d"})
        //   }
      }}
      on:dragGroupStart={({ detail: e }) => {
        e.events.forEach((ev) => {
          const target = ev.target;

          if (!frameMap.has(target)) {
            frameMap.set(target, {
              translate: [0, 0],
            });
          }
          const frame = frameMap.get(target);

          const treeItem = $codeMap.flatTree.find((x) => x.id === ev.target.children[0].id);

          if (treeItem) {
            frame.translate[0] = parseInt(treeItem.locationX);
            frame.translate[1] = parseInt(treeItem.locationY);
          }

          ev.set(frame.translate);
        });
        HideGroupNameAndBorderOnMove();
      }}
      on:dragGroup={({ detail: e }) => {
        e.events.forEach((ev) => {
          const target = ev.target;
          const frame = frameMap.get(target);

          frame.translate = ev.beforeTranslate;
          target.style.transform = `translate(${frame.translate[0]}px, ${frame.translate[1]}px)`;
        });
      }}
      on:dragGroupEnd={({ detail: e }) => {
        e.events.forEach((ev) => {
          const target = ev.target;
          OnSingleDragEnded(target);
        });
        //UpdateControlBoxBorder();
        GetSelectoBorderAndSetActiveStore();
        UpdateActivelySelected(e.targets);
        UpdateActiveBorder(e.targets);

        UpdateGroupName();
        ShowGroupNameAndBorderAfterMove();
        // UpdateGroupBorder();
      }}
      on:resizeStart={({ detail: e }) => {
        e.setOrigin(["%", "%"]);
        const target = e.target;
        const frame = frameMap.get(target);
        e.dragStart && e.dragStart.set(frame.translate);
      }}
      on:resize={({ detail: e }) => {
        const beforeTranslate = e.drag.beforeTranslate;
        const target = e.target;
        const frame = frameMap.get(target);

        frame.translate = beforeTranslate;
        e.target.style.width = `${e.width}px`;
        e.target.style.height = `${e.height}px`;
        e.target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
      }}
    />

    <Selecto
      class="selecto2"
      bind:this={selecto}
      container={document.getElementById("canvas-inner")}
      dragContainer={document.querySelector("#canvas-inner")}
      selectableTargets={[".selecto-area .cube"]}
      hitRate={0}
      selectByClick={true}
      selectFromInside={false}
      toggleContinueSelect={["shift"]}
      ratio={0}
      on:dragStart={({ detail: e }) => {
        //  e.added.forEach(el => {
        //     el.classList.add("selected");
        // });
        // e.removed.forEach(el => {
        //     el.classList.remove("selected");
        // });
        // onBlockSelectStart(e);
        if (!e.inputEvent.altKey) {
          console.log("selecto drag start");
          const target = e.inputEvent.target;
          if (moveable.isMoveableElement(target) || targets.some((t) => t === target || t.contains(target))) {
            e.stop();
          }
        }

        if (e.inputEvent.target.classList.contains("menu")) {
          e.stop();
        }
      }}
      on:dragEnd={({ detail: e }) => {
        UpdateActivelySelected(e.currentTarget.selectedTargets);
        console.log("onDragEnd; Selected Blocks: ");
        console.log($codeMap.activeWindow.activelySelectedBlocks);

        // AddEventListenerForClick();
        UpdateActivelySelected(e.currentTarget.selectedTargets);
        UpdateActiveBorder(e.currentTarget.selectedTargets);
        //UpdateControlBoxBorder();
        //UpdateGroupBorder();
      }}
      on:select={({ detail: e }) => {
        element: HTMLDivElement = e;
        // e.added.forEach(el => {
        //     el.classList.add("selected");
        // });
        // e.removed.forEach(el => {
        //     el.classList.remove("selected");
        // });
        // OnBlockDragOVERSelect(e);
        if ($codeMap.groups) targets = [].slice.call(SelectAllBlocksInAGroup(e.selected));

        //targets = [].slice.call(document.querySelectorAll(".cube"));
      }}
      on:selectEnd={({ detail: e }) => {
        // e.afterAdded.forEach(el => {
        //     el.classList.add("selected");
        // });
        // e.afterRemoved.forEach(el => {
        //     el.classList.remove("selected");
        // });

        // onBlockSelectEnd(e);

        //OnBlockSelected(e.selectedTargets);

        //$codeMap.activeWindow.selectionBorder.top = e.topleft;

        if (e.isDragStart) {
          e.inputEvent.preventDefault();
          //console.log("selecto drag stopped");
          setTimeout(() => {
            moveable.dragStart(e.inputEvent);
          });
        }
      }}
    />
  {/if}

  <!-- <div class="empty elements"></div> -->

  <div id="canvas-inner">
    <div class="zoom elements">
      {#if $codeMap?.flatTree}
        <div class="elements selecto-area" id="selecto1">
          <div id="background-grid" class="background-grid" />

          {#if $codeMap?.groups}
            {#each $codeMap?.groups as group}
              {#if group.visible}
                <div id={group.groupId}>
                  <input
                    class="groupName"
                    type="text"
                    bind:value={group.name}
                    style="background:none; font-size: x-large; width: auto; position:absolute; {'transform: translate(' +
                      common.GetLeftMostPixelFromGroup(group) +
                      'px,' +
                      (common.GetTopMostPixelFromGroup(group) - 42) +
                      'px);'}"
                  />
                  <div
                    class="groupBorder"
                    style="border: red solid; position:absolute; {'height:' +
                      (group.height + 10) +
                      'px;' +
                      ' width:' +
                      (group.width + 6) +
                      'px;'} {'transform: translate(' +
                      (common.GetLeftMostPixelFromGroup(group) - 6) +
                      'px,' +
                      (common.GetTopMostPixelFromGroup(group) - 4) +
                      'px);'} "
                  />
                </div>
              {/if}
            {/each}
          {/if}

          <RadialMenu />

          {#each $codeMap.flatTree as treeItem}
            <!-- && typeof(treeItem.open) === "undefined" || treeItem?.open === true -->

            <!-- //Not file or directory? //Directory and showFolders === true?   //file and showfiles === true? -->
            {#if typeof treeItem.visible === "undefined" || treeItem?.visible === true}
              {#if treeItem.type !== Type.Folder || (treeItem.type !== Type.Folder && $items.settings.showFolders === true) || $items.settings.showFiles === true}
                <Card {moveable} {selecto} {treeItem} />
              {/if}
            {/if}
          {/each}
        </div>
        <!-- This is the container for the draggable/selecto -->
        <div class="empty elements" />

        <!-- Card -->

        <!-- Line -->
      {/if}
    </div>
  </div>
</main>

<style>
  :root {
    --color: rgb(15, 18, 25);
  }

  body {
    overflow: hidden;
  }

  .background-grid {
    background: url(../../media/tile-grid-png-6.png);
    width: 100000px;
    height: 100001px;
    position: absolute;
    left: -9999px;
    top: -9999px;
    z-index: -99;
  }

  .container {
    max-width: 800px;
  }

  .logo {
    position: relative;
    width: 150px;
    height: 150px;
    margin: 0px auto;
    font-size: 0;
    text-align: left;
  }

  .logo.logos {
    width: 320px;
    text-align: center;
  }

  .logos .selecto {
    padding: 16px;
  }

  .logo img {
    position: relative;
    height: 100%;
    box-sizing: border-box;
  }

  .button {
    border: 1px solid #333;
    color: #333;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    box-sizing: border-box;
    cursor: pointer;
    width: 120px;
    height: 42px;
    font-size: 14px;
    letter-spacing: 1px;
    transition: all ease 0.2s;
    margin: 0px 5px;
  }

  .button:hover {
    background: #333;
    color: white;
  }

  .block {
    display: inline-block;
    border-radius: 5px;
    width: 40px;
    height: 40px;
    margin: 4px;
    background: #eee;
    --color: #4af;
  }

  /* .elements {
        margin-top: 40px;
        border: 2px solid #eee;
    } */

  .selecto-area {
    padding: 20px;
  }

  :global(.single-block .selected) {
    color: #fff;
    background: var(--color);
  }

  .empty.elements {
    border: none;
  }

  /* THis is the select box */
  :global(.rCS19atnxs) {
    z-index: 20 !important;
  }

  .cube {
    display: inline-block;
    border-radius: 5px;
    width: 40px;
    height: 40px;
    margin: 4px;
    background: #eee;
    --color: #4af;
  }

  .selecto-area {
    padding: 20px;
  }

  .selecto-area :global(.selected) {
    color: #fff;
    background: var(--color);
  }

  .empty.elements {
    border: none;
  }
</style>
