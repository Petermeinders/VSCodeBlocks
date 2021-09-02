<script lang="ts">
  import { codeMap, newRender, currentZoom, perimeterItem, currentlySelected, derivedGroups, items, debug, activelySelectedText } from "../../store";
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

  let common: Common;

  function RenderPocket() {
    if ($codeMap) {
      if ($codeMap.pocket.length < 5) {
        $codeMap.pocket = [
          { id: "999", name: "item1" },
          { id: "998", name: "item2" },
          { id: "997", name: "item3" },
          { id: "996", name: "item4" },
        ];
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

  const flipDurationMs = 300;
  function handleDndConsider(e) {
    $codeMap.pocket = e.detail.items;
  }
  function handleDndFinalize(e) {
    $codeMap.pocket = e.detail.items;
  }

  const _ = deepdash(lodash);
  let ds;

  let lines = [];
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
    lines;
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
    ds = new DragSelect({
      selectables: document.getElementsByClassName("card"),
      callback: (e) => console.log(e),
      area: document.getElementById("area"),
    });

    ds.subscribe("callback", (OnMouseUpObject) => {
      let buttonClick;

      if (OnMouseUpObject.event.target.nodeName === "BUTTON") buttonClick = true;
      else buttonClick = false;

      // if (buttonClick)
      // {
      //   ds.addSelection($currentlySelected);
      // }

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

      // if (OnMouseUpObject.items.length > 1 && OnMouseUpObject.isDragging === false) {
      if (OnMouseUpObject.items.length > 1) {
        $currentlySelected = [];
        OnMouseUpObject.items.forEach((card) => {
          $currentlySelected.push(card);
        });
      }

      let buttonName = CheckForButton(OnMouseUpObject);

      if (buttonName === "MoveToPocket") {
        MoveToPocket($currentlySelected, OnMouseUpObject.event);
      }

      if (buttonName === "SelectPerimeter") {
      }
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
      console.log("update lines!");
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

  function CheckForButton(OnMouseUpObject) {
    if (OnMouseUpObject.event.target.parentElement.parentElement.parentElement.parentElement.nodeName === "BUTTON") {
      return OnMouseUpObject.event.target.parentElement.parentElement.parentElement.parentElement.id;
    } else if (OnMouseUpObject.event.target.parentElement.nodeName === "BUTTON") {
      return OnMouseUpObject.event.target.parentElement.id;
    }
  }

  function RenderBlocks() {
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
  }

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
              linkedTargetBlocks:[],
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

    $codeMap.flatTree.forEach((item1) => {
      $codeMap.flatTree.forEach((item2) => {
        if (item1.parentId === item2.id) {
          if (item1.visible && item2.visible) {
          //lines.forEach((line) => {
          let id1 = "line" + item1.id;
          let id2 = "line" + item2.id;

          if (item1.name === "NestedStore.js") console.log("testhere");

          let lineExists = lines.find(
            (line) =>
              (line.sourceId.toString() === item1.id.toString() && line.destId.toString() === item2.id.toString()) ||
              (line.sourceId.toString() === item2.id.toString() && line.destId.toString === item1.id.toString())
          );
          let indexOfLine = lines.indexOf(lineExists);

          if (lineExists && indexOfLine !== -1) {
            lineExists.x1 = item1.locationX;
            lineExists.y1 = item1.locationY;

            lineExists.x2 = item2.locationX;
            lineExists.y2 = item2.locationY;

            if (!item1.visible || !item2.visible) {
              lines.splice(indexOfLine, 1);
            } else {
              lines.splice(indexOfLine, 1, lineExists);
            }


          } else {
            let line = { color:"#ff0000", sourceId: item1.id, destId: item2.id, x1: item1.x2, y1: item1.y2, x2: item2.x2, y2: item2.y2 };
            lines.push(line);
          }
        }
        else { //One or both blocks are invisible
          let lineExists = lines.find(
            (line) =>
              (line.sourceId.toString() === item1.id.toString() && line.destId.toString() === item2.id.toString()) ||
              (line.sourceId.toString() === item2.id.toString() && line.destId.toString === item1.id.toString())
          );
          let indexOfLine = lines.indexOf(lineExists);
          if (indexOfLine !== -1)
          {
            lines.splice(indexOfLine, 1);
          }
        }

        }
      });

      if (item1?.linkedTargetBlocks?.length > 0) {
        item1?.linkedTargetBlocks.forEach(item1TargetBlock => {
          let customTarget = $codeMap.flatTree.find(x => x.id === item1TargetBlock);
          if (customTarget)
          {
          let lineExists = lines.find(
            (line) =>
              (line.sourceId.toString() === customTarget.id.toString() && line.destId.toString() === item1.id.toString()) ||
              (line.sourceId.toString() === item1.id.toString() && line.destId.toString === customTarget.id.toString())
          );
          let indexOfLine = lines.indexOf(lineExists);

          if (lineExists && indexOfLine !== -1) {
            lineExists.x1 = item1.locationX;
            lineExists.y1 = item1.locationY;

            lineExists.x2 = customTarget.locationX;
            lineExists.y2 = customTarget.locationY;

            if (!customTarget.visible || !item1.visible) {
              lines.splice(indexOfLine, 1);
            } else {
              lines.splice(indexOfLine, 1, lineExists);
            }
          } else {
            let line = {
              color: "green",
              sourceId: customTarget.id,
              destId: item1.id,
              x1: item1.x2,
              y1: item1.y2,
              x2: customTarget.x2,
              y2: customTarget.y2,
            };
            lines.push(line);
          }
  
          }
         
        })
      
      }
    });

    lines.forEach((line) => {
      $codeMap.pocket.forEach((block) => {
        if (block.id.toString() === line.sourceId.toString() || block.id.toString() === line.destId.toString()) {
          let lineIndex = lines.indexOf(line);
          lines.splice(lineIndex, 1);
          lines = lines;
        }
      });
    });

    lines = lines;
    console.log("Rendered lines global");
  }

  function LineCheck() {}

  function MoveToPocket(selectedBlocks, event) {
    let flatBlock = GetSelectedCodeBlocks(selectedBlocks);

    flatBlock.forEach((block) => {
      let blockIndex = $codeMap.flatTree.indexOf(block);
      if (blockIndex !== -1) {
        $codeMap.pocket.push(block);
        $codeMap.flatTree.splice(blockIndex, 1);
        $codeMap.pocket = $codeMap.pocket;
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

  const GetFiles = () => {
    tsvscode.postMessage({
      type: "GetFiles",
      value: "",
    });
  };

  GetFiles();

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

  function MoveToCanvas(e) {
    $codeMap.pocket.forEach((block) => {
      if (block.id.toString() === e.target.id) {
        let index = $codeMap.pocket.indexOf(block);
        $codeMap.pocket.splice(index, 1);
        $codeMap.flatTree.push(block);
        $codeMap = $codeMap;
      }
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

  function HideGroup(derivedGroup) {
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
      RenderBlocks();
      // let index = $codeMap.groups.indexOf(group);
      // $codeMap.groups.splice(index, 1);
    }
  }

  function onGroupNameChange(derivedGroup, e) {
    let group = $codeMap.groups.find((group) => group.groupId === derivedGroup.groupId);

    if (group) {
      group.name = e.target.value;
      let index = $codeMap.groups.indexOf(group);
      $codeMap.groups.splice(index, 1, group);
    }
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
      ShowRecursivelyFromParent(treeItem);
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

  function ShowRecursivelyFromParent(treeItem) {
    $codeMap.flatTree.forEach((flatItem) => {
      if (flatItem.parentId === treeItem.id) {
        if (flatItem.type === "outline" && (typeof treeItem.open === "undefined" || treeItem.open === true)) {
          $items.settings.visibleOutlineBlocks.forEach((outlineVis) => {
            if (outlineVis.name === flatItem.extension) {
              if (outlineVis.checked) {
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

        ShowRecursivelyFromParent(flatItem);

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
  }

  function ShowActivelySelectedOutline() {
    if ($codeMap?.flatTree) {
      $codeMap.flatTree.forEach((treeItem) => {
        if (treeItem.type === "outline") {
          if (treeItem.name === $activelySelectedText) {
            HideOutline();
            treeItem.visible = true;
          }
        }
      });
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
      if (flatItem.id.toString() === event.target.getAttribute("id")) {
        sourceBlock?.linkedTargetBlocks.push(flatItem.id);
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

  <hr />
  {#if $codeMap?.pocket}
    <div style="float:left; width:50%">
      <h2>Pocket</h2>
      <section
        style="float:left; margin:auto; width: 100%;"
        use:dndzone={{ items: $codeMap.pocket, flipDurationMs }}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
      >
        {#each $codeMap.pocket as item (item.id)}
          <div id={item.id} class="pocketblock" animate:flip={{ duration: flipDurationMs }}>
            {item.name}
            <button id={item.id} type="button" style="width:50px;" on:click={(event) => MoveToCanvas(event)}>Add</button>
          </div>
        {/each}
      </section>
    </div>
  {/if}

  {#if $derivedGroups}
    <div style="" class="groupList">
      <h2>Groups</h2>
      {#each $derivedGroups as group (group.groupId)}
        <div id={group.groupId} style="display:flex; align-items: center;">
          <input type="text" value={group.name} class="groupInput" on:change={(event) => onGroupNameChange(group, event)} />
          <span style="cursor: pointer;" on:click={() => HideGroup(group)}><Fa icon={faEyeSlash} style="color:#007acc; padding-right: 4px;" /> </span>
        </div>
      {/each}
    </div>
  {/if}

  <div id="area" style="width:100%; height:100%; position:fixed; top:229px;">
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
          <!-- {#if $codeMap?.groups}
            {#each $codeMap?.groups as group}
              {#each group.blockIds as blockid}
                {#if blockid.toString() !== treeItem.toString()}
                  <Card {treeItem} />
                {/if}
              {/each}
            {/each}
          {:else}
            
          {/if} -->
          <!-- && typeof(treeItem.open) === "undefined" || treeItem?.open === true -->
          {#if typeof treeItem.visible === "undefined" || treeItem?.visible === true}
            <Card {treeItem} {Minimize} {StartLink} />
          {/if}
        {/each}
      </div>

      <!-- Line -->
      {#if lines}
        <div>
          {#each lines as line}
            <Line color={line.color} sourceId={line.sourceId} destId={line.destId} x1={line.x1} x2={line.x2} y1={line.y1} y2={line.y2} />
          {/each}
        </div>
        {#if linkLineDragging}
          <div>
            <Line color="green" x1={start.x} x2={m.x} y1={start.y} y2={m.y} />
          </div>
        {/if}
      {/if}

      <!-- GROUP STUFF -->
      <!-- {#if $codeMap?.groups}
        {#each $codeMap.groups as group}
        {@debug group}
          <div id="group{group.groupId}" style="background:red; position:absolute;">
              <canvas width={group.width} height={group.height}></canvas>



            {#each $codeMap.flatTree as treeItem}
              {#each group.blockIds as blockid}
                {#if blockid.toString() === treeItem.id.toString()}
                 
                  

                 
                {/if}
              {/each}
            {/each}



          </div>
        {/each}
      {/if} -->
    {/if}

    {#if $codeMap}
      {RenderBlocks()}
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
