<script lang="ts">
  import {
    codeMap,
    newRender,
    currentZoom,
    perimeterItem,
    currentlySelected,
    derivedGroups,
    items,
    debug,
    activelySelectedText,
    activePath,
    lines,
    activeSelectionMeta,
  } from "../../store";
  import type { Group } from "../../store";
  import Card from "./Card.svelte";
  import { onMount, afterUpdate, beforeUpdate, tick } from "svelte";
  import DragSelect from "dragselect";
  import lodash, { cloneDeep, flatMap } from "lodash";
  import deepdash from "deepdash";
  import Line from "./Line.svelte";
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import Common from ".././Common.svelte";
  import Fa from "svelte-fa";
  import { faCog, faCubes, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
  import Pocket from "./Pocket.svelte";
  import CodeMapGroups from "./CodeMapGroups.svelte";

  let common: Common;

  function RenderPocket() {
    if ($codeMap) {
      if ($codeMap.pocket.length < 0) {
        $codeMap.pocket = [];
      }
    }
  }

  enum OutlineTypeEnum {
    Array = 17,
    Boolean = 16,
    Class = 4,
    Constant = 13,
    Constructor = 8,
    Enum = 9,
    EnumMember = 21,
    Event = 23,
    Field = 7,
    File = 0,
    Function = 11,
    Interface = 10,
    Key = 19,
    Method = 5,
    Module = 1,
    Namespace = 2,
    Null = 20,
    Number = 15,
    Object = 18,
    Operator = 24,
    Package = 3,
    Property = 6,
    String = 14,
    Struct = 22,
    TypeParameter = 25,
    Variable = 12,
  }

  const _ = deepdash(lodash);
  let ds;



  let newLink = {};
  let isMoving = false;
  let selectedBlocks;
  let changedFile;
  let linkLineDragging = false;

  // Order:------------------
  // . OnMount()
  // . GetFiles() -> Panel -> Extension
  // ---removed . $FilteredTree is updated
  // . RenderBlocks()
  // . BeforeUpdate() -> RenderBlocks(), RenderLines()
  // . ?
  // ---removed . $FilteredTree is updated
  // . BeforeUpdate() -> RenderBlocks(), RenderLines()
  // . Afterupdate() -> BlocksToTreeStyleLayout(), AddCardsToDrag()
  // ---removed . $FilteredTree is updated
  // . RenderBlocks()
  // . BeforeUpdate() -> RenderBlocks(), RenderLines()

  //$: selectedBlocks, RenderLinesAfterMove();

  let zoom = 1;
  const ZOOM_SPEED = 0.1;
  let faketree = [];

  $: isMoving;

  $: {
    $lines;
    $currentZoom;
  }

  $: {
    $newRender;
    $codeMap;
  }

  $: $codeMap?.activeWindow?.path, onWindowChange();

  $: $perimeterItem, onDoubleClicked();

  $: $activelySelectedText, SelectedTextChange();

  function SaveCodeMapToFile() {
    tsvscode.postMessage({
      type: "saveCodeMap",
      value: $codeMap,
    });
  }

  function onDoubleClicked() {
    if (typeof $perimeterItem.id !== "undefined") {
      console.log("DOUBLE CLICK YO");

      let cards = document.querySelectorAll(".card");
      let selectedList = [];

      cards.forEach((card) => {
        if (
          card.getAttribute("data-parentId").toString() === $perimeterItem.id.toString() ||
          $perimeterItem.parentId.toString() === card.id.toString()
        ) {
          selectedList.push(card);
          card.classList.add("highlight");
        }
      });

      let id = $perimeterItem.id;
      let thisCard = document.getElementById(id);
      selectedList.push(thisCard);
      $currentlySelected = selectedList;

      ds.setSelection(selectedList);
      $perimeterItem = {};
    }
  }

  onMount(async () => {
    // GetFiles();

   

    ds = new DragSelect({
      selectables: document.getElementsByClassName("card"),
      callback: (e) => e,
      // area: document.getElementById("area"),
    });

    ds.subscribe("callback", (OnMouseUpObject) => {
      let buttonClick;

      if (OnMouseUpObject.event.target.nodeName === "BUTTON") buttonClick = true;
      else buttonClick = false;

      // if (buttonClick)
      // {
      //   ds.addSelection($currentlySelected);
      // }

      if (OnMouseUpObject?.items[0]?.id === "generated") {
        let selected = $codeMap.flatTree.find((x) => x.id === "generated");

        if (selected) selected.id = common.getNonce();
      }

      if (OnMouseUpObject.items.length === 1 && !buttonClick) {
        //DragStartObject.items[0].

        let cards = document.querySelectorAll(".card");

        cards.forEach((card) => {
          card.classList.remove("highlight");
        });

        OnMouseUpObject.items[0].classList.add("highlight");

        $currentlySelected = [];

        cards.forEach((card) => {
          if (
            card.getAttribute("data-parentId") === OnMouseUpObject.items[0].id ||
            OnMouseUpObject.items[0].getAttribute("data-parentId") === card.id
          ) {
            card.classList.add("highlight");
            // $currentlySelected.push(card);
          }
        });

        $currentlySelected.push(OnMouseUpObject.items[0]);
        console.log("highlightme");
        //SelectGroup(OnMouseUpObject.event.target.id);
      }

      if (OnMouseUpObject.items.length === 1 && buttonClick && $currentlySelected.length === 1) {
        $currentlySelected = [];
        $currentlySelected.push(OnMouseUpObject.items[0]);
      }

      if (
        OnMouseUpObject.items.length === 0 &&
        (OnMouseUpObject.event.target.id === "GroupBlocks" || OnMouseUpObject.event.target.id === "UngroupBlocks")
      ) {
      } else if (OnMouseUpObject.items.length === 0 && OnMouseUpObject.event.target.nodeName !== "BUTTON") {
        $currentlySelected = [];
      }

      if (OnMouseUpObject.items.length > 1) {
        $currentlySelected = [];
        OnMouseUpObject.items.forEach((card) => {
          $currentlySelected.push(card);
        });
      }

      //Check if it's a button
      let buttonName = CheckForButton(OnMouseUpObject);

      //Check if it's a radial item
      let radialItemId = CheckforRadialItemClick(OnMouseUpObject)
      
      

      if (radialItemId === "MoveToPocketMenu")
      {
        MoveToPocket($currentlySelected, OnMouseUpObject.event);
      }

      if (buttonName === "MoveToPocket") {
        MoveToPocket($currentlySelected, OnMouseUpObject.event);
      }

      if (buttonName === "SelectPerimeter") {
      }

      let pointerX = OnMouseUpObject.event.clientX ?? 0;
      let pointerY = OnMouseUpObject.event.clientY ?? 0;

      OnMouseUpObject.event.srcElement.style.display = "none";
      let bottomElement = document.elementFromPoint(pointerX, pointerY);

      if ($debug) console.log(bottomElement);

      if (bottomElement && (OnMouseUpObject?.event?.target?.nodeName !== "BUTTON" || OnMouseUpObject?.event?.srcElement?.nodeName !== "BUTTON")) {
        let isPocketHovered = common.ParentHasId(bottomElement, "pocketAndMapGroups");
        if (isPocketHovered) {
          let pocketAndGroup = document.getElementById("pocketAndMapGroups");
          if ($debug) console.log("Moving to pocket");
          MoveToPocket($currentlySelected, OnMouseUpObject.event);
        }

        if (!isPocketHovered) {
          let isCodeBlockHovered = common.ParentHasId(bottomElement, "code-container");
          if (isCodeBlockHovered) {
            if ($debug) console.log("Moving to Blocks");
            MoveToCodeBlocks($currentlySelected, OnMouseUpObject.event);
          }
        }
      }

      OnMouseUpObject.event.srcElement.style.display = "block";
    });

    ds.subscribe("dragstart", (DragStartObject) => {
      let buttonClick;

      if (DragStartObject.event.target.nodeName === "BUTTON") buttonClick = true;
      else buttonClick = false;

      if (DragStartObject.isDragging) {
        isMoving = true;

        let childPos = DragStartObject.items[0].getBoundingClientRect();
        let parentPos = DragStartObject.items[0].parentElement.getBoundingClientRect();
        let x = childPos.x - parentPos.x;
        let y = childPos.y - parentPos.y;

        let translate = "translate3d(" + x + "px, " + y + "px, 1px) scale(" + $currentZoom + ")";

        DragStartObject.items[0].style.transform = translate;
      }
      if (DragStartObject.items.length === 1 && !buttonClick) {
        let groupItems = SelectGroup(DragStartObject.event.target.id);
        DragStartObject.items.concat(groupItems);
      }
    });

    ds.subscribe("dragmove", (DragMovedObject) => {
      //console.log("moving");
      let id = DragMovedObject.event.target.id;

      DragMovedObject.event.preventDefault();

      if (DragMovedObject.isDragging) {
        let childPos = DragMovedObject.items[0].getBoundingClientRect();
        let parentPos = DragMovedObject.items[0].parentElement.getBoundingClientRect();
        let x = childPos.x - parentPos.x;
        let y = childPos.y - parentPos.y;
        // let translate = "translate3d("+x+"px, "+y+"px, 1px) scale(2)";
        // DragMovedObject.items[0].style.transform = translate;

        //let transform = DragMovedObject.items[0].style.transform
      }
    });

    ds.subscribe("callback", (DragEndedObject) => {
      // let x = DragEndedObject.event.screenX;
      // let y = DragEndedObject.event.screenY;

      if (typeof DragEndedObject?.items[0] !== "undefined" && DragEndedObject.isDragging) {
        //let itemArray
        // DragEndedObject.items.forEach(item => {

        // })
        // let x = DragEndedObject.event.layerX;
        // let y = DragEndedObject.event.layerY;

        let childPos = DragEndedObject.items[0].getBoundingClientRect();
        let parentPos = DragEndedObject.items[0].parentElement.getBoundingClientRect();
        let x = childPos.x - parentPos.x;
        let y = childPos.y - parentPos.y;

        //console.log("x2:" + x + " y2:" + y);
        let id = DragEndedObject.event.target.id;
        isMoving = false;
        console.log("drag ended");

        //RenderLines(DragEndedObject);

        $codeMap.flatTree;

        DragEndedObject.items.forEach((block) => {
          let childPos2 = block.getBoundingClientRect();
          let parentPos2 = block.parentElement.getBoundingClientRect();
          let x2 = childPos2.x - parentPos2.x;
          let y2 = childPos2.y - parentPos2.y;
          let translate = "translate3d(" + x2 + "px, " + y2 + "px, 1px) scale(" + $currentZoom + ")";
          block.style.transform = translate;

          let tempvalues;
          let fakeMap = $codeMap.flatTree;

          $codeMap.flatTree.forEach((flatBlock) => {
            if (flatBlock.id.toString() === block.id) {
              let indexOfFlatBlock = $codeMap.flatTree.indexOf(flatBlock);
              tempvalues = flatBlock;
              tempvalues.locationX = x2.toString();
              tempvalues.locationY = y2.toString();
              fakeMap.splice(indexOfFlatBlock, 1, tempvalues);
            }
          });
          $codeMap.flatTree = [...new Set(fakeMap)];
        });
      }

      RenderPocket();
    });
  });

  beforeUpdate(() => {
    if (!linkLineDragging) {
      if ($debug) console.log("update lines!");
      RenderBlocks();
      RenderLines();
    }
  });

  afterUpdate(() => {
    if (!linkLineDragging) {
      BlocksToTreeStyleLayout();
      AddCardsToDrag();
    }
  });

  function CheckforRadialItemClick(OnMouseUpObject){
    let radialItemId;
    if (OnMouseUpObject?.event?.target?.nodeName === "path")
      {
        radialItemId = OnMouseUpObject.event.target.parentElement.parentElement.parentElement.id;
        $currentlySelected.push(OnMouseUpObject.event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement);
        return radialItemId;
      }
      if (OnMouseUpObject?.event?.target?.nodeName === "svg")
      {
        radialItemId = OnMouseUpObject.event.target.id;
        $currentlySelected.push(OnMouseUpObject.event.target.parentElement.parentElement.parentElement);
        return radialItemId;
      }
  }

  function CheckForButton(OnMouseUpObject) {
    if (OnMouseUpObject?.event?.target?.parentElement?.parentElement?.parentElement?.parentElement?.nodeName === "BUTTON") {
      return OnMouseUpObject.event.target.parentElement.parentElement.parentElement.parentElement.id;
    } else if (OnMouseUpObject?.event?.target?.parentElement?.nodeName === "BUTTON") {
      return OnMouseUpObject.event.target.parentElement.id;
    }
  }

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
        faketree = JSON.parse(JSON.stringify($codeMap.canvas.children));
        FlattenTree(faketree);

        // faketree = _.index(faketree)

        $codeMap.flatTree = [...new Set(faketree)];
      }
    }
  };

  function GetOutline(currentParentBlock) {
    let OutlineArray = [];

    if ($codeMap?.activeWindow?.outline) {
      let outline = $codeMap.activeWindow.outline;
      if (outline.length > 0) {
        if ($debug) {
          console.log("OUTLINE: ");
          console.log(outline);
        }
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
              parentId: currentParentBlock.id,
              path: value.location.uri.path,
              name: value.name,
              size: 0,
              type: "outline",
              color: "",
              visible: defaultVisibility,
              open: null,
              children: [],
              extension: OutlineTypeEnum[value.kind],
              locationX: currentParentBlock.locationX,
              locationY: currentParentBlock.locationY,
              _startLine: value.location.range._start._line,
              _startCharacter: value.location.range._start._character,
              _endLine: value.location.range._end._line,
              _endCharacter: value.location.range._end._character,
              linkedTargetBlocks: [],
            };
            let hit = 0;
            $codeMap.flatTree.forEach((flatItem) => {
              if (
                flatItem.id === newTreeItem.id ||
                (typeof flatItem?.uri?.path !== "undefined" && flatItem.name === newTreeItem.name && flatItem.uri.path === newTreeItem.uri.path)
              ) {
                hit += 1;
              }
            });
            if (hit === 0) {
              if ($debug) {
                console.log("New Outline item added:");
                console.log(newTreeItem);
              }
              $codeMap.flatTree.push(newTreeItem);
            }
          }
        });
        //$codeMap.flatTree = [...$codeMap.flatTree, ...OutlineArray];
      }
    }

    return OutlineArray;
  }

  function SetVisibility() {
    $codeMap?.flatTree.forEach((treeItem) => {
      if (typeof treeItem.visible === "undefined") treeItem.visible = true;
    });
  }

  function AddCardsToDrag() {
    let cardsCheck = document.getElementsByClassName("card");

    if (cardsCheck.length > 0) {
      let cards = document.getElementsByClassName("card");
      let newCarsArray = [...new Set(cards)];
      ds.setSelectables(newCarsArray);
    }
  }

  function BlocksToTreeStyleLayout() {
    let cards = document.getElementsByClassName("card");
    let fileY = 0;
    let dirY = 0;

    // for (var i = 0; i < cards.length; i++) {
    //   if ((cards.item(i).style.transform === "")) {
    //     if (cards.item(i)?.getAttribute("data-fileType") === "file") {
    //       fileY += 50;
    //       let trans =  "translate(200.32px,"+fileY+"px)"
    //       cards.item(i).style.transform = trans;
    //     } else {
    //       dirY += 50;
    //       let trans =  "translate(0px,"+dirY+"px)"
    //       cards.item(i).style.transform =trans;
    //     }
    //   }
    // }
  }

  function RenderLines() {
    if (!$codeMap?.flatTree) {
      return;
    }

    let visibleBlocks = $codeMap.flatTree.filter((x) => x.visible);

    LineCheck();

    visibleBlocks.forEach((item1) => {
      visibleBlocks.forEach((item2) => {
        //   if (!item2.visible || !item1.visible){
        //   return;
        // }

        if (item1.parentId === item2.id) {
          if (item1.visible && item2.visible) {
            //lines.forEach((line) => {
            let id1 = "line" + item1.id;
            let id2 = "line" + item2.id;

            if (item1.name === "NestedStore.js") console.log("testhere");

            let lineExists = $lines.find(
              (line) =>
                (line.sourceId.toString() === item1.id.toString() && line.destId.toString() === item2.id.toString()) ||
                (line.sourceId.toString() === item2.id.toString() && line.destId.toString === item1.id.toString())
            );
            let indexOfLine = $lines.indexOf(lineExists);

            if (lineExists && indexOfLine !== -1) {
              lineExists.x1 = item1.locationX;
              lineExists.y1 = item1.locationY;

              lineExists.x2 = item2.locationX;
              lineExists.y2 = item2.locationY;

              if (!item1.visible || !item2.visible) {
                $lines.splice(indexOfLine, 1);
              } else {
                $lines.splice(indexOfLine, 1, lineExists);
              }
            } else {
              let line = {
                color: "#ff0000",
                customLine: false,
                sourceId: item1.id,
                destId: item2.id,
                x1: item1.x2,
                y1: item1.y2,
                x2: item2.x2,
                y2: item2.y2,
              };
              $lines.push(line);
            }
          } else {
            //One or both blocks are invisible
            let lineExists = $lines.find(
              (line) =>
                (line.sourceId.toString() === item1.id.toString() && line.destId.toString() === item2.id.toString()) ||
                (line.sourceId.toString() === item2.id.toString() && line.destId.toString === item1.id.toString())
            );
            let indexOfLine = $lines.indexOf(lineExists);
            if (indexOfLine !== -1) {
              $lines.splice(indexOfLine, 1);
            }
          }
        }
      });

      if (item1?.linkedTargetBlocks?.length > 0) {
        item1?.linkedTargetBlocks.forEach((item1TargetBlock) => {
          let customTarget = $codeMap.flatTree.find((x) => x.id === item1TargetBlock);
          if (customTarget) {
            let lineExists = $lines.find(
              (line) =>
                line.customLine &&
                ((line.sourceId.toString() === customTarget.id.toString() && line.destId.toString() === item1.id.toString()) ||
                  (line.sourceId.toString() === item1.id.toString() && line.destId.toString === customTarget.id.toString()))
            );
            let indexOfLine = $lines.indexOf(lineExists);

            if (lineExists && indexOfLine !== -1) {
              lineExists.x1 = item1.locationX;
              lineExists.y1 = item1.locationY;

              lineExists.x2 = customTarget.locationX;
              lineExists.y2 = customTarget.locationY;

              if (!customTarget.visible || !item1.visible) {
                $lines.splice(indexOfLine, 1);
              } else {
                $lines.splice(indexOfLine, 1, lineExists);
              }
            } else {
              let line = {
                color: "green",
                customLine: true,
                sourceId: customTarget.id,
                destId: item1.id,
                x1: item1.x2,
                y1: item1.y2,
                x2: customTarget.x2,
                y2: customTarget.y2,
              };
              $lines.push(line);
            }
          }
        });
      }
    });

    $lines.forEach((line) => {
      $codeMap.pocket.forEach((block) => {
        if (block.id.toString() === line.sourceId.toString() || block.id.toString() === line.destId.toString()) {
          let lineIndex = $lines.indexOf(line);
          $lines.splice(lineIndex, 1);
          // $lines = $lines;
        }
      });
    });

    $lines = $lines;
    if ($debug) console.log("Rendered lines global");
  }

  // function LineCheck(item1, item2) {
  //   $lines.forEach(line => {
  //     let sourceBlock = item1;
  //     let destBlock = item2;

  //     if (sourceBlock && destBlock)
  //     {
  //       if (!sourceBlock.visible || !destBlock.visible)
  //       {
  //         let index = $lines.indexOf(line);
  //         $lines.splice(index,1);
  //       }
  //     }

  //   })
  // }

  function LineCheck() {
    $lines.forEach((line) => {
      let sourceBlock = $codeMap.flatTree.find((x) => x.id === line.sourceId);
      let destBlock = $codeMap.flatTree.find((x) => x.id === line.sourceId);

      if (sourceBlock && destBlock) {
        if (!sourceBlock.visible || !destBlock.visible) {
          let index = $lines.indexOf(line);
          $lines.splice(index, 1);
        }
      }
    });
  }

  function MoveToPocket(selectedBlocks, event) {
    let flatBlock = GetSelectedCodeBlocks(selectedBlocks);

    flatBlock.forEach((block) => {
      let blockIndex = $codeMap.flatTree.indexOf(block);
      let alreadyExits = $codeMap.pocket.find((x) => x.id === block.id);
      if (blockIndex !== -1 && typeof alreadyExits === "undefined") {
        $codeMap.pocket.push(block);
        $codeMap.flatTree.splice(blockIndex, 1);
        $codeMap.pocket = $codeMap.pocket;
      }
    });
  }

  function MoveToCodeBlocks(selectedBlocks, event) {
    let flatBlock = GetSelectedCodeBlocks(selectedBlocks);

    flatBlock.forEach((block) => {
      let blockIndex = $codeMap.flatTree.indexOf(block);
      let newBlock = {};
      if (blockIndex !== -1) {
        newBlock.id = block.id;
        newBlock.name = block.name;
        newBlock.path = block.path;
        newBlock.code = "";
        newBlock.language = null;
        newBlock.placeholders = [];
        newBlock.color = "white";
        newBlock.visible = true;
        newBlock.linkedBlocks = [];
        newBlock.tags = ["custom"];

        newBlock.size = block.size;
        newBlock.type = block.type;
        newBlock.open = block.open;
        newBlock.parentId = block.parentId;
        newBlock.outputx = block.outputx;
        newBlock.outputy = block.outputy;
        newBlock.inputx = block.inputx;
        newBlock.inputy = block.inputy;
        newBlock.children = block.children;
        newBlock.extension = block.extension;
        newBlock.locationX = block.locationX;
        newBlock.locationY = block.locationY;
        newBlock._startLine = block._startLine;
        newBlock._startCharacter = block._startCharacter;
        newBlock._endLine = block._endLine;
        newBlock._endCharacter = block._endCharacter;
        newBlock.starred = block.starred;
        newBlock.linkedTargetBlocks = block.linkedTargetBlocks;
        //id: "0",
        //tempId:"",
        //name: "test",
        //code: "if(${1:condition} ||${1:condition}){${2:expression}})",
        //language: "typescript",
        // placeholders: [
        //    "condition",
        //    "expression"
        // ],
        // color: "white",
        // visible: "",
        // linkedBlocks: [],
        // tags: [
        //    "tag1",
        //    "tag2"
        // ]

        $items.customSnippets.push(newBlock);
        // $codeMap.pocket.push(block);
        //$codeMap.flatTree.splice(blockIndex, 1);
        $items.customSnippets = $items.customSnippets;
        console.log($codeMap.flatTree.find((b) => b.id === block.id));
        block.visible = false;
      }
    });
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

  // document.addEventListener("wheel", function (e) {
  //   const zoomElement = document.querySelector(".zoom");

  //   if (e.deltaY > 0) {
  //     $currentZoom = zoom -= ZOOM_SPEED;
  //     //zoomElement.style.transform = `scale(${(zoom -= ZOOM_SPEED)})`;
  //     //ds.zoom = zoom;
  //   } else {
  //     $currentZoom = zoom += ZOOM_SPEED;
  //    // zoomElement.style.transform = `scale(${(zoom += ZOOM_SPEED)})`;
  //    // ds.zoom = zoom ;

  //   }
  //   console.log($currentZoom);
  // });

  // const GetFiles = () => {
  //   common.ImportCode();
  //   tsvscode.postMessage({
  //     type: "GetFiles",
  //     value: $items.settings.codeMapFolderExclusion,
  //   });
  // };

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

  // function LineCheck(line) {
  //   let lineid = "line" + line.childId;
  //   let foundElement = document.getElementById(lineid);
  //   let x1;
  //   let x2;
  //   let y1;
  //   let y2;
  //   if (foundElement) {
  //     x1 = foundElement.getAttribute("x1");
  //     x2 = foundElement.getAttribute("x2");
  //     y1 = foundElement.getAttribute("y1");
  //     y2 = foundElement.getAttribute("y2");
  //   }
  //   console.log(foundElement);
  //   console.log(line);
  //   if (line.x1.toString() !== x1 || line.x2.toString() !== x2 || line.y1.toString() !== y1 || line.y2.toString() !== y2) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  function LoadCodeMap() {
    tsvscode.postMessage({
      type: "LoadCodeMapFromFile",
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

  // const MoveToPocket = () => {
  //   console.log("get all the blocks!")
  // }

  function GroupBlocks() {
    let blocks = GetSelectedCodeBlocks($currentlySelected);

    let lastItem = $codeMap?.groups?.slice(-1)[0]; //Check if any groups exist
    let newGroup;
    if ($codeMap?.groups?.length > 0) {
    } else {
      $codeMap.groups = Array<Group>();
    }

    newGroup = { groupId: common.getNonce(), blockIds: [], name: "New Group", visible: true };

    newGroup.color = "#" + Math.floor(Math.random() * 16777215).toString(16);

    blocks.forEach((block) => {
      newGroup.blockIds.push(block.id);
      block.color = newGroup.color;
      let blockIndex = $codeMap.flatTree.indexOf(block);
      if (blockIndex !== -1) {
        $codeMap.flatTree.splice(blockIndex, 1, block);
      }
    });

    let newSet = [...new Set(newGroup.blockIds)];
    newGroup.blockIds = newSet;
    // newGroup = RenderGroupRectangle(newGroup);
    $codeMap.groups.push(newGroup);
  }

  function RenderGroupRectangle(group) {
    let leastX = 0;
    let leastY = 0;
    let greatestX = 0;
    let greatestY = 0;

    group.blockIds.forEach((blockId) => {
      $codeMap.flatTree.forEach((flatBlock) => {
        if (flatBlock.id === blockId) {
          let x = parseInt(flatBlock.locationX);
          let y = parseInt(flatBlock.locationY);

          if (x > greatestX) greatestX = x;

          if (x < leastX) leastX = x;

          if (y > greatestY) greatestY = y;

          if (y < leastY) leastY = y;
        }
      });
    });
    let width = greatestX - leastX;
    let height = greatestY - leastY;

    group.width = width;
    group.height = height;
    group.startXY;

    return group;
  }

  function SelectGroup(selectedId) {
    let foundGroup;

    $codeMap?.groups?.forEach((group) => {
      group.blockIds.forEach((blockId) => {
        if (blockId.toString() === selectedId.toString()) {
          foundGroup = group;
        }
      });
    });

    if (foundGroup) {
      let selection = [];

      foundGroup.blockIds.forEach((id) => {
        if (document.getElementById(id)) selection.push(document.getElementById(id));
      });

      ds.addSelection(selection);
      return selection;
    }
  }

  function UngroupBlocks() {
    let selectedBlocks = GetSelectedCodeBlocks($currentlySelected);
    let lastItem = $codeMap?.groups?.slice(-1)[0]; //Check if any groups exist

    let foundGroup;

    if (lastItem) {
      $codeMap.groups.forEach((group) => {
        group.blockIds.forEach((blockId) => {
          selectedBlocks.forEach((selectedBlock) => {
            if (blockId.toString() === selectedBlock.id.toString()) {
              foundGroup = group;
              RemoveColor(group);
              let index = $codeMap.groups.indexOf(foundGroup);
              $codeMap.groups.splice(index, 1);
              RenderBlocks();
            }
          });
        });
      });
    }
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

  const ShowSettings = () => {
    console.log("not yet implemented");
  };

  const Minimize = (e, treeItem) => {
    console.log("MINIMIZE");
    console.log(e);
    console.log(treeItem);
    let selection = [];

    if (typeof treeItem.open === "undefined" || treeItem.open === true) {
      treeItem.open = false;
      HideRecursively(treeItem);
    } else {
      treeItem.open = true;
      let fileClicked = treeItem.type === "file" ? true : false;
      ShowRecursivelyFromParent(treeItem, fileClicked);
      RenderBlocks();
    }

    // $codeMap.flatTree.forEach(flatItem => {
    //   if (flatItem.parentId === treeItem.id){
    //     let thisCard = document.getElementById(flatItem.id);

    //     if (thisCard)
    //       selection.push(thisCard)
    //   }
    // })

    ds.setSelection($currentlySelected);
  };

  function HideRecursively(treeItem) {
    $codeMap.flatTree.forEach((flatItem) => {
      if (flatItem.parentId === treeItem.id) {
        if (!flatItem.starred) {
          flatItem.visible = false;
        }

        HideRecursively(flatItem);
      }
    });

    RenderBlocks();
  }

  function ShowRecursivelyFromParent(treeItem, fileClicked) {
    $codeMap.flatTree.forEach((flatItem) => {
      if (flatItem.parentId === treeItem.id) {
        if (flatItem.type === "outline" && (typeof treeItem.open === "undefined" || treeItem.open === true)) {
          $items.settings.visibleOutlineBlocks.forEach((outlineVis) => {
            if (outlineVis.name === flatItem.extension) {
              if (outlineVis.checked && fileClicked) {
                flatItem.visible = true;
              } else {
                if (!flatItem.starred) {
                  flatItem.visible = false;
                }
              }
            }
          });
        } else {
          if (typeof treeItem.open === "undefined" || treeItem.open === true) {
            flatItem.visible = true;
          } else {
            if (!flatItem.starred) {
              flatItem.visible = false;
            }
          }
        }

        ShowRecursivelyFromParent(flatItem, fileClicked);

        // let thisCard = document.getElementById(flatItem.id);

        // if (thisCard) {
        //   // $currentlySelected.push(thisCard);
        // }
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

  function ShowRecursivelyDOWNFromFile(treeItem) {
    $codeMap.flatTree.forEach((flatItem) => {
      if (flatItem.parentId === treeItem.id) {
        //If not-outline, check if closed. If outline, check settings chechboxes.
        if (flatItem.type !== "outline" || (flatItem.type === "outline" && isOutlineItemVisible(flatItem.extension))) {
          flatItem.visible = true;
        }

        ShowRecursivelyUPFromFile(flatItem);
      }
    });
  }

  function isOutlineItemVisible(outlineItem) {
    let foundOutlineItem = $items.settings.visibleOutlineBlocks.find((x) => x.name === outlineItem);
    if (foundOutlineItem.checked) {
      return true;
    } else {
      return false;
    }
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
          GetOutline($codeMap.activeWindow.block);
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
    }
  }

  function HideOutline() {
    $codeMap.flatTree.forEach((flatItem) => {
      if (flatItem.type === "outline" && flatItem.starred !== true) {
        flatItem.visible = false;
      }
    });
  }

  function SelectedTextChange() {
    ShowActivelySelectedOutline();
    GenerateCodeBlockFromSelectedText();
  }

  function ShowActivelySelectedOutline() {
    if ($codeMap?.flatTree) {
      $codeMap.flatTree.forEach((treeItem) => {
        if (treeItem.type === "outline") {
          if ($items.settings.strictCodeMapOutlineWordMatch) {
            if (treeItem.name === $activelySelectedText && treeItem.path === $activePath) {
              HideOutline();
              treeItem.visible = true;
            }
          } else {
            if (treeItem.name.startsWith($activelySelectedText) && treeItem.path === $activePath) {
              HideOutline();
              treeItem.visible = true;
            }
          }
        }
      });
    }
  }




  function GenerateCodeBlockFromSelectedText() {
    if ($codeMap?.flatTree) {
      let ExistingGenerated = $codeMap?.flatTree.find((x) => x.id === "generated");

      if (ExistingGenerated) {
        let index = $codeMap?.flatTree.indexOf(ExistingGenerated);
        let generatedBlock = {};

        generatedBlock.id = "generated";
        generatedBlock.name = $activelySelectedText.substring(0, 25);
        generatedBlock.path = undefined;
        generatedBlock.code = $activelySelectedText;
        generatedBlock.language = undefined;
        generatedBlock.placeholders = [];
        generatedBlock.color = "white";
        generatedBlock.visible = true;
        generatedBlock.linkedBlocks = [];
        generatedBlock.tags = ["custom"];

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
        generatedBlock.locationX = 0;
        generatedBlock.locationY = 0;
        generatedBlock._startLine = $activeSelectionMeta;
        generatedBlock._startCharacter = undefined;
        generatedBlock._endLine = undefined;
        generatedBlock._endCharacter = undefined;
        generatedBlock.starred = true;
        generatedBlock.linkedTargetBlocks = undefined;

        $codeMap.flatTree.splice(index, 1, generatedBlock);
      } else {
        let generatedBlock = {};

        generatedBlock.id = "generated";
        generatedBlock.name = $activelySelectedText.substring(0, 25);
        generatedBlock.path = undefined;
        generatedBlock.code = $activelySelectedText;
        generatedBlock.language = undefined;
        generatedBlock.placeholders = [];
        generatedBlock.color = "white";
        generatedBlock.visible = true;
        generatedBlock.linkedBlocks = [];
        generatedBlock.tags = ["custom"];

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
        generatedBlock.locationX = 0;
        generatedBlock.locationY = 0;
        generatedBlock._startLine = $activeSelectionMeta;
        generatedBlock._startCharacter = undefined;
        generatedBlock._endLine = undefined;
        generatedBlock._endCharacter = undefined;
        generatedBlock.starred = true;
        generatedBlock.linkedTargetBlocks = undefined;

        $codeMap.flatTree.push(generatedBlock);
      }
    }
  }

  let m = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };


  function StartLink(event, treeItem) {
    ds.break();
    console.log("startlink");
    start.x = treeItem.locationX;
    start.y = treeItem.locationY;
    newLink.sourceId = treeItem.id;

    linkLineDragging = true;

    document.addEventListener("mousemove", handleMousemove);
    document.addEventListener("mouseup", handleMouseup);
  }

  function handleMousemove(event) {
    // console.log("linking");
    // console.log(event);
    m.x = event.layerX;
    m.y = event.layerY;
  }

  function handleMouseup(event) {
    console.log("endlink");

    let sourceBlock = $codeMap.flatTree.find((x) => x.id === newLink.sourceId);

    $codeMap.flatTree.forEach((flatItem) => {
      let targetId = event.target.getAttribute("id");
      if (flatItem.id.toString() === targetId) {
        sourceBlock?.linkedTargetBlocks.push(flatItem.id);
        sourceBlock?.starred = true;
        flatItem.starred = true;
        sourceBlock.linkedTargetBlocks = [...new Set(sourceBlock?.linkedTargetBlocks)];
      }
    });

    console.log(event);

    //treeItem.linkedTargetBlocks.add()
    linkLineDragging = false;
    document.removeEventListener("mousemove", handleMousemove);
    document.removeEventListener("mouseup", handleMouseup);
  }
</script>

<main id="Canvas">
  <Common bind:this={common} />
  <!-- The mouse position is {m.x} x {m.y} -->
  <!-- <h1 style="text-align:center;">Code Map</h1> -->

  <div  id="area" style="width:100%; height:100%; position:fixed;">
    <div class="ds-selected" style="display:none" />
    <button type="button" on:click={SaveCodeMapToFile}>Save CodeMap</button>

    <button type="button" on:click={LoadCodeMap}>Load CodeMap</button>
    <button type="button" on:click={OrganizeSelected}>Cleanup Selected</button>
    <button id="GroupBlocks" type="button" on:click={GroupBlocks}>Group</button>
    <button id="UngroupBlocks" type="button" on:click={UngroupBlocks}>Ungroup</button>

    <!-- SINGLE CARD -->
    {#if $codeMap?.flatTree}
      <div class="zoom">
        <!-- Card -->
        {#each $codeMap.flatTree as treeItem}
          <!-- && typeof(treeItem.open) === "undefined" || treeItem?.open === true -->

          <!-- //Not file or directory? //Directory and showFolders === true?   //file and showfiles === true? -->
          {#if typeof treeItem.visible === "undefined" || treeItem?.visible === true}
            {#if (treeItem.type !== "directory" && treeItem.type !== "file") || (treeItem.type === "directory" && $items.settings.showFolders === true) || (treeItem.type === "file" && $items.settings.showFiles === true)}
              <Card {treeItem} {Minimize} {StartLink} />
            {/if}
          {/if}
        {/each}
      </div>

      <!-- Line -->
      {#if $lines}
        <div>
          {#each $lines as line, i}
            {#if line.customLine || ($items.settings.showDefaultRelationship === true && line.customLine === false)}
              <Line
                lineIndex={i}
                color={line.color}
                sourceId={line.sourceId}
                destId={line.destId}
                x1={line.x1}
                x2={line.x2}
                y1={line.y1}
                y2={line.y2}
              />
              <div style="display:none;">{i + 1}</div>
            {/if}
          {/each}
        </div>
        {#if linkLineDragging}
          <div>
            <Line color="green" x1={start.x} x2={m.x} y1={start.y} y2={m.y} />
          </div>
        {/if}
      {/if}
    {/if}

    {#if $codeMap}
      <div style="display:none;">{RenderBlocks()}</div>
    {/if}
  </div>
</main>

<style>
  .zoom {
    height: 1vh;
    width: 100%;
    display: grid;
    place-items: center;
    top: 0;
    left: 0;
  }

  .card {
    padding: 5px;
    user-select: none;
    /* width: 50px;
  height: 50px; */
    /* position: absolute; */
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border: 0;
  }

  .ds-selected {
    outline: 3px solid black;
    outline-offset: 3px;
    color: black;
    font-weight: bold;
  }

  .card:focus {
    border: 1px solid blue;
  }

  .directory {
    border: solid 3px #864fc5;
    background: #b26effcc;
  }

  .file {
    border: solid 3px #4e58bf;
    background: #6e88ffcc;
  }

  section {
    width: 50%;
    padding: 0.3em;
    border: 1px solid black;
    /* this will allow the dragged element to scroll the list */
    overflow: scroll;
    height: 150px;
  }

  .pocketblock {
    height: 15%;
    width: 100%;
    margin: 0.4em 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #dddddd;
    border: 1px solid white;
    color: black;
    justify-content: space-between;
  }

  .groupInput {
    height: 60%;
    margin: 0.2em 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #dddddd;
    border: 1px solid white;
    color: black;
    justify-content: space-between;
  }

  .groupList {
    display: flex;
    height: 174px;
    overflow: scroll;
    width: 49%;
    flex-direction: column;
  }
</style>
