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
moveAbles,
  } from "../../store";
  import Fa from "svelte-fa";
  import type { FilteredTree, Group, BlockContainerInterface } from "../../../src/Models";
  import { OutlineTypeEnum } from "../../../src/Models";
  import Card from "./Card/Card.svelte";
  import { onMount, afterUpdate, beforeUpdate, tick, createEventDispatcher } from "svelte";
  import DragSelect from "dragselect";
  import lodash, { find, flatMap } from "lodash";
  import deepdash from "deepdash";
  import Line from "./Line.svelte";
  import Shared from "../Shared.svelte";
  import { faSave } from "@fortawesome/free-regular-svg-icons";
  import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
  // import panzoom from 'svg-pan-zoom'
  import { Sibling, Type } from "../../../src/Models";
  import GroupOfBlocks from "./GroupOfBlocks.svelte";
  import BlockContainer from "./Card/BlockContainer.svelte";
  import MovableBlock from "./Card/MovableBlock.svelte";
  import Moveable from "svelte-moveable";
import { scale } from "svelte/transition";
import { } from "os";
import Selecto from "svelte-selecto";
import type { OnSelectEnd } from "svelte-selecto";
import { element } from "svelte/internal";
import { renderer } from "../../renderer";
import CodeMapGroupsContainer from "./CodeMapGroupsContainer.svelte";


  let common: Shared;
  let moveable: Moveable;
  let isMoving = false;
  let faketree = [];
  let changedFile = "";
  let selecto: Selecto;

//FrameMap is needed for Movable and Selecto
  const frameMap = new Map();
  let targets = [];

  $: $codeMap?.activeWindow?.path, onWindowChange();
  $: $codeMap
  $: $activelySelectedText, SelectedTextChange();

  onMount(async () => {
    var element = document.querySelector("#canvas-inner");
    var selectoElement = document.querySelector("#canvas-inner");

    // And pass it to panzoom
    // var instance = panzoom(element, {
    //   // zoomSpeed: 0.095,
    //   smoothScroll: false,
    //   maxZoom: 1,
    //   minZoom: 0.1,
    //   initialZoom: 1,
    //   beforeMouseDown: function (e) {
    //     // allow mouse-down panning only if altKey is down. Otherwise - ignore
    //     var shouldIgnore = !e.altKey;
    //     if (!shouldIgnore) {
    //       if (selecto) {
    //         selecto.selectableTargets = document.querySelectorAll(".selecto-area .cube");
    //         console.log(selecto?.selectableTargets); 
    //         document.querySelector(".moveable-control-box").style.display = "none";
    //       }
    //     }
    //     return shouldIgnore;
    //   },
    // });

    // element?.parentElement?.addEventListener('wheel', instance.zoomWithWheel)







 

  const container = document.getElementById("CodeMapMove");
  const el = document.getElementById("selecto1");
   //const elBoxo = document.getElementsByClassName("moveable-control-box");
  const zoomPan = renderer({ scaleSensitivity: 5, minScale: .1, maxScale: 30, element: el });
  container.addEventListener("wheel", (event) => {
      // if (!event.ctrlKey) {
      //     return;
      // }
      event.preventDefault();
      zoomPan.zoom({
          deltaScale: Math.sign(event.deltaY) > 0 ? -1 : 1,
          x: event.pageX,
          y: event.pageY
      });
     
  });
  // container.addEventListener("dblclick", () => {
  //     zoomPan.panTo({
  //         originX: 0,
  //         originY: 0,
  //         scale: 1,
  //     });
  // });

  container.addEventListener("mousemove", (event) => {
        if (event.buttons !== 2) {
            return;
        }

        zoomPan.panBy({
            originX: event.movementX,
            originY: event.movementY
        });

       
    })

    container.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    })




    container.addEventListener("mouseup", (event) => {
      if (event.button !== 2) {
            return;
        }
        //ShowBorderAfterMove();

    })

    container.addEventListener("mousedown", (event) => {
      if (event.buttons !== 2) {
            return;
        }
      HideBorderOnMove();

    })


   

     //container.addEventListener("mousedown", onMousedown); 





    // instance.on('panend', function(e) {
    //   if (selecto) {
    //       selecto.selectableTargets = document.querySelectorAll(".selecto-area .cube");
    //       document.querySelector(".moveable-control-box").style.display = "block";
    //       let selected = selecto.getSelectableElements();
    //       //selected[0].style.width = "99px";
    //       selecto.getInstance().trigger("scroll");
    //       //selecto.clickTarget(e, selected);
    //       //selecto.setSelectedTargets(selected);


    //     }
    // });

    // panzoom.add.add("zoom", function (e) {
    //   console.log(e.getTransform());
    //   $currentZoom = e.getTransform().scale;
    //   $currentScaleX = e.getTransform().x;
    //   $currentScaleY = e.getTransform().y;
    //   //e.zoomTo(.90);
    //   // ds.zoom = e.getTransform();
    //   console.log("LOADED!");
    //   console.log(instance.getTransform());
    //   //$zoom = instance?.getTransform()?.scale;
    //   // document.getElementById("area").style.transform = `scale(${e.getTransform()})`;
    // });

    //instance.on("pan", function(e){

      // let controlBoxX = getTranslateX(document.querySelector(".moveable-control-box"));
      // let controlBoxY = getTranslateY(document.querySelector(".moveable-control-box"));

      // let canvasX = getTranslateX(document.querySelector("#canvas-inner"));
      // let canvasY = getTranslateY(document.querySelector("#canvas-inner"));

      // let controlBox = document.querySelector(".moveable-control-box");
      // let resultX = controlBoxX + canvasX;
      // let resultY = controlBoxY + canvasY;
      // controlBox.style.transform = `translate3d(${resultX}px, ${resultY}px, 0px)`;

      // console.log(controlBox.style.transform);

      
    //})

  });














function HideBorderOnMove() {
  if (selecto) {
            selecto.selectableTargets = document.querySelectorAll(".selecto-area .cube");
            console.log(selecto?.selectableTargets); 
            document.querySelector(".moveable-control-box").style.display = "none";
          }
}

function ShowBorderAfterMove() {
  if (selecto) {
            selecto.selectableTargets = document.querySelectorAll(".selecto-area .cube");
            console.log(selecto?.selectableTargets); 
            document.querySelector(".moveable-control-box").style.display = "block";
          }
}



  beforeUpdate(() => {
    RenderBlocks();

  });

  function getTranslateX(myElement) {
  var style = window.getComputedStyle(myElement);
  var matrix = new WebKitCSSMatrix(style.transform);
  //console.log('translateX: ', matrix.m41);
  return matrix.m41;
}

function getTranslateY(myElement) {
  var style = window.getComputedStyle(myElement);
  var matrix = new WebKitCSSMatrix(style.transform);
  //console.log('translateY: ', matrix.m42);
  return matrix.m42;
}

  afterUpdate(() => {
    
    //NewSelecto();


    // if (selecto) {
    //   selecto?.selectableTargets = document.querySelectorAll(".selecto-area .cube");
    //   console.log(selecto?.selectableTargets); 
    // }

      
  });

  // const NewSelecto = () => {
  //   if (document.querySelector(".cube") && document.querySelector(".selecto2"))
  //   {
  //     if (selecto === undefined)
  //     {
  //       return;
  //     }

  //     if (selecto.toggleContinueSelect === "shift")
  //     {
  //       return;
  //     }
  //     selecto.target = document.querySelector("#CodeMapMove");
  //     selecto = new Selecto({
  //       container:document.body,
  //   dragContainer:".elements",
  //   selectableTargets:[".selecto-area .cube"],
  //   selectByClick:true,
  //   selectFromInside:true,
  //   continueSelect:false,
  //   toggleContinueSelect:"shift",
  //   keyContainer:window,
  //   hitRate:100,
  //   ratio:0
  // }
  //   );
  //   selecto.$on("select", ({ detail: e }) => {
  //       console.log("SELECTED!");
  //       e.added.forEach(el => {
  //                   el.classList.add("selected");
  //               });
  //               e.removed.forEach(el => {
  //                   el.classList.remove("selected");
  //               });
  //   });
  //   selecto.$on("selectStart", ({ detail: e }) => {
  //       console.log("SELECTED Start!");
  //       e.added.forEach(el => {
  //                   el.classList.add("selected");
  //               });
  //               e.removed.forEach(el => {
  //                   el.classList.remove("selected");
  //               });
  //   });
  //   selecto.$on("selectEnd", ({ detail: e }) => {
  //       console.log("SELECTED End!");
  //       e.afterAdded.forEach(el => {
  //                   el.classList.add("selected");
  //               });
  //               e.afterRemoved.forEach(el => {
  //                   el.classList.remove("selected");
  //               });
  //   });
  //   console.log("new Selecto");
  //   }
    
  // }

  const OnBlockDragOVERSelect =  ({detail: e}) => {
    console.log("SELECTED!");
    console.log(selecto.getSelectedTargets());
  }  

  const onBlockSelectStart =  ({detail: e}) => {
    
  } 

  const onBlockSelectEnd =  (e: OnSelectEnd) => {
    console.log("blocks selected");
    console.log(e);
    HideShowLinesForSelectedBlocks(e);
  } 

  const HideShowLinesForSelectedBlocks =  (e: OnSelectEnd) => {
    let elementList;
    let selectedBlock = new Array<FilteredTree>();

      $moveAbles.forEach((moveable) => {
        let move = moveable.getInstance();
        if (move.target.classList.contains("selected"))
        {
          
          move.renderDirections = ["n", "nw", "ne", "s", "se", "sw", "e", "w"];
        }
        else
        {
          move.renderDirections = [];
        }
      });





    // e.selected.forEach((element) => {
    //   if (element.classList.contains("selected"))
    //   {
    //     //elementList.push(element);
    //     let selected = $codeMap.flatTree.find(x => x.id === element.id)

    //     if (selected)
    //     {
    //       selectedBlock.push(selected);
    //       console.log($moveAbles);
    //       $moveAbles.forEach((moveAble) => {
    //         let move = moveAble.getInstance();
    //         if (move.target.id === selected.id)
    //         {
    //           move.renderDirections = ["n", "nw", "ne", "s", "se", "sw", "e", "w"];
    //         }
    //         else
    //         {
    //           move.renderDirections = [];
    //         }
    //       });
    //       // Moveable movable = Moveable.getinstance(e.selected[0]);
    //       // console.log(movable);
    //     }
    //   }
    // });

    //let selected = $codeMap.flatTree.find(x => x.id === e.id)
  }



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

  const OnSingleDragEnded = (target:HTMLDivElement) => {

    var generatedTree = HandleGeneratedBlock(target);

    let treeItem = $codeMap.flatTree.find((item) =>  item.id == target.children[0].id)

    if (generatedTree)
    {
      treeItem = generatedTree;
    }

    if (treeItem)
    {
      treeItem.locationX = getTranslateX(target).toString();
      treeItem.locationY = getTranslateY(target).toString();

      let index = $codeMap?.flatTree.indexOf(treeItem);
    $codeMap.flatTree.splice(index, 1, treeItem);
    $codeMap.flatTree = [...$codeMap.flatTree];
    }

    
    //treeItem = $codeMap.flatTree.find((item) =>  item.id == target.id)

    let elements;
    if (selecto)
    {
      console.log(selecto?.selectableTargets); 
      console.log("after update selecto");
    }
  }


  const HandleGeneratedBlock = (target:HTMLDivElement) => {
    console.log(target);
    let treeItem = $codeMap.flatTree.find((item) =>  item.id === "generated")
    console.log(treeItem);

    if (treeItem?.id === "generated") {
        if (treeItem?.sibling === Sibling.Self) {
          ConvertGeneratedBlock(target, true);
        } else {
          ConvertGeneratedBlock(target, false);
        }
        return treeItem;
      }
      return null;
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
      if (treeItem){
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
     // NewSelecto();

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




<main id="CodeMapMove" style="width:100%; height:95vh;" on:wheel={wheelHandler}>
<Shared bind:this={common} />



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



  <Moveable
  bind:this={moveable}
  draggable={true}
  rootContainer={document.getElementById("CodeMapMove")}
  target={targets}
  useResizeObserver={true}
  resizable={true}
  throttleResize={0}
  throttleDrag={0}

  
  on:clickGroup={({ detail: e }) => {
      selecto.clickTarget(e.inputEvent, e.inputTarget);
  }}
  on:click={({ detail: e }) => {
     console.log("Clicked");
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

    if (treeItem){
      frame.translate[0] = parseInt(treeItem.locationX);
      frame.translate[1] = parseInt(treeItem.locationY);
    }
      
    e.set(frame.translate);
  }}
  on:dragEnd={({ detail: e }) => {
    const target = e.target;
    OnSingleDragEnded(target);

  }}
  on:dragGroupStart={({ detail: e }) => {
      e.events.forEach(ev => {
          const target = ev.target;
  
          if (!frameMap.has(target)) {
              frameMap.set(target, {
                  translate: [0, 0],
              });
          }
          const frame = frameMap.get(target);

          const treeItem = $codeMap.flatTree.find((x) => x.id === ev.target.children[0].id);

          if (treeItem){
            frame.translate[0] = parseInt(treeItem.locationX);
            frame.translate[1] = parseInt(treeItem.locationY);
          }
  
          ev.set(frame.translate);
      });
  }}
  on:dragGroup={({ detail: e }) => {
      e.events.forEach(ev => {
          const target = ev.target;
          const frame = frameMap.get(target);
  
          frame.translate = ev.beforeTranslate;
          target.style.transform = `translate(${frame.translate[0]}px, ${frame.translate[1]}px)`;
      });
  }}
  on:dragGroupEnd={({ detail: e }) => {
      e.events.forEach(ev => {
          const target = ev.target;
          OnSingleDragEnded(target);
      });
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
></Moveable>





  <Selecto class="selecto2" 
  bind:this={selecto}
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
   if (!e.inputEvent.altKey){
    console.log("selecto drag start");
   const target = e.inputEvent.target;
                if (
                    moveable.isMoveableElement(target)
                    || targets.some(t => t === target || t.contains(target))
                ) {
                    e.stop();
                }
   }
   else{
    e.stop();
   }

  }}

  on:select={({ detail: e }) => {
    element:HTMLDivElement  = e;
      // e.added.forEach(el => {
      //     el.classList.add("selected");
      // });
      // e.removed.forEach(el => {
      //     el.classList.remove("selected");
      // });
      // OnBlockDragOVERSelect(e);
      if (!e.inputEvent.altKey)
      targets = e.selected;
  }}

  on:selectEnd={({ detail: e }) => {
      // e.afterAdded.forEach(el => {
      //     el.classList.add("selected");
      // });
      // e.afterRemoved.forEach(el => {
      //     el.classList.remove("selected");
      // });

      // onBlockSelectEnd(e);

      if (e.isDragStart) {
                    // e.inputEvent.preventDefault();
            
                    setTimeout(() => {
                         moveable.dragStart(e.inputEvent);
                    });
                }
    }}>
  </Selecto>


  


<!-- <div class="empty elements"></div> -->


  <div id="canvas-inner">
   
        <div class="zoom elements">
 {#if $codeMap?.flatTree}
          <div class="elements selecto-area" id="selecto1">
            {#each $codeMap.flatTree as treeItem}
            <!-- && typeof(treeItem.open) === "undefined" || treeItem?.open === true -->

            <!-- //Not file or directory? //Directory and showFolders === true?   //file and showfiles === true? -->
            {#if typeof treeItem.visible === "undefined" || treeItem?.visible === true}
              {#if (treeItem.type !== Type.Folder) || (treeItem.type !== Type.Folder && $items.settings.showFolders === true) || ( $items.settings.showFiles === true)}

                <MovableBlock {moveable}  {treeItem}  />

              {/if}
            {/if}
          {/each}
        </div>
        <!-- This is the container for the draggable/selecto -->
        <div class="empty elements"></div>

     

       
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

    .container {
        max-width: 800px;
        ;
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