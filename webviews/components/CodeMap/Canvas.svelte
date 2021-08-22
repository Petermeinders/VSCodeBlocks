<script lang="ts">
  import { codeMap, newRender, currentZoom, dbClickedItem, currentlySelected, flatTree, derivedGroups, items } from "../../store";
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
  import { faCog, faCubes, faEyeSlash, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";

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
  let isMoving = false;
  let selectedBlocks;

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

  $: $dbClickedItem, onDoubleClicked();

  function SaveCodeMapToFile() {
    tsvscode.postMessage({
      type: "saveCodeMap",
      value: $codeMap,
    });
  }

  function onDoubleClicked() {
    if (typeof $dbClickedItem.id !== "undefined") {
      console.log("DOUBLE CLICK YO");

      let cards = document.querySelectorAll(".card");
      let selectedList = [];

      cards.forEach((card) => {
        if (
          card.getAttribute("data-parentId").toString() === $dbClickedItem.id.toString() ||
          $dbClickedItem.parentId.toString() === card.id.toString()
        ) {
          selectedList.push(card);
          card.classList.add("highlight");
        }
      });

      let id = $dbClickedItem.id;
      let thisCard = document.getElementById(id);
      selectedList.push(thisCard);
      $currentlySelected = selectedList;

      ds.setSelection(selectedList);
      $dbClickedItem = {};
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

        SelectGroup(OnMouseUpObject.event.target.id);
      }

      if (OnMouseUpObject.items.length === 1 && buttonClick && $currentlySelected.length === 1) {
        $currentlySelected = [];
        $currentlySelected.push(OnMouseUpObject.items[0]);
      }

      if (OnMouseUpObject.items.length === 0 && OnMouseUpObject.event.target.id === "GroupBlocks") {
      } else if (OnMouseUpObject.items.length === 0 && OnMouseUpObject.event.target.nodeName !== "BUTTON") {
        $currentlySelected = [];
      }

      if (OnMouseUpObject.items.length > 1 && OnMouseUpObject.isDragging === false) {
        $currentlySelected = [];
        OnMouseUpObject.items.forEach((card) => {
          $currentlySelected.push(card);
        });
      }

      if (OnMouseUpObject.event.target.nodeName === "BUTTON" && OnMouseUpObject.event.target.id === "MoveToPocket") {
        MoveToPocket($currentlySelected, OnMouseUpObject.event);
      }
    });

    ds.subscribe("dragstart", (DragStartObject) => {
      if (DragStartObject.isDragging) {
        isMoving = true;

        let childPos = DragStartObject.items[0].getBoundingClientRect();
        let parentPos = DragStartObject.items[0].parentElement.getBoundingClientRect();
        let x = childPos.x - parentPos.x;
        let y = childPos.y - parentPos.y;

        let translate = "translate3d(" + x + "px, " + y + "px, 1px) scale(" + $currentZoom + ")";

        DragStartObject.items[0].style.transform = translate;
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

        selectedBlocks = DragEndedObject.items;
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
    console.log("update lines!");
    RenderBlocks();
    RenderLines();
  });

  afterUpdate(() => {
    BlocksToTreeStyleLayout();
    AddCardsToDrag();
  });

  function RenderBlocks() {
    if (!isMoving) {
      if ($codeMap?.flatTree) {

          SetVisibility()
        
        $codeMap.flatTree = [...new Set($codeMap.flatTree)];
        return;
      }

      // if ($codeMap?.canvas) {
      //   faketree = JSON.parse(JSON.stringify($codeMap.canvas.children));
      //   FlattenTree(faketree);

      //   // faketree = _.index(faketree)

      //   $codeMap.flatTree = [...new Set(faketree)];
      // }
    }
  }

  function SetVisibility(){
    $codeMap?.flatTree.forEach(treeItem => {
      if (typeof(treeItem.visible) === 'undefined')
      treeItem.visible = true;
    })
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

            if (!item1.visible  || !item2.visible)
          {
            lines.splice(indexOfLine, 1);
          }
          else{
            lines.splice(indexOfLine, 1, lineExists);
          }


            // if (item1.x2.toString() === "0") {
            //   item1.x2 = item1.locationX;
            //   item1.y2 = item1.locationY;

            //   item2.x2 = item2.locationX;
            //   item2.y2 = item2.locationY;
            // }
            // else if (lineExists && indexOfLine !== -1) {
            //   lineExists.x1 = item1.x2;
            //   lineExists.y1 = item1.y2;

            //   lineExists.x2 = item2.x2;
            //   lineExists.y2 = item2.y2;

            //   //Splice?

            //   lines.splice(indexOfLine, 1, lineExists);
          } else {
            let line = { sourceId: item1.id, destId: item2.id, x1: item1.x2, y1: item1.y2, x2: item2.x2, y2: item2.y2 };
            lines.push(line);
          }
          // });
        }
      });
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

  function MoveToPocket(selectedBlocks, event) {
    let flatBlock = GetSelectedCodeBlocks(selectedBlocks);

    flatBlock.forEach((flatBlock) => {
      let blockIndex = $codeMap.flatTree.indexOf(flatBlock);
      $codeMap.pocket.push(flatBlock);
      $codeMap.flatTree.splice(blockIndex, 1);
      $codeMap.pocket = $codeMap.pocket;
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
    // _.findDeep($codeMap.groups, (value, key, parentValue, context) =>
    //  {
    //    if (key === "groupId")
    //    {
    //      if (value.toString() === selectedId.toString())
    //      {
    //        console.log("found it");
    //      }
    //    }
    //  }
    // )

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
        selection.push(document.getElementById(id));
      });

      ds.addSelection(selection);
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
    let group = $codeMap.groups.find(group => group.groupId === derivedGroup.groupId);

    if (group) {
      if (typeof derivedGroup.visible === "undefined" || derivedGroup.visible === true) {
        group.visible = false;
      }
      else{
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
  let group = $codeMap.groups.find(group => group.groupId === derivedGroup.groupId);

  if (group) {
    group.name = e.target.value;
    let index = $codeMap.groups.indexOf(group);
    $codeMap.groups.splice(index, 1, group);
              
  }

 }


 function ShowSettings() {
    console.log("not yet implemented");
  }

  function ShowCodeBlocks() {
    $items.settings.currentPanel = "codeBlocks";
  }
</script>

<main id="Canvas">
  <Common bind:this={common} />
<!-- <h1 style="text-align:center;">Code Map</h1> -->
<div style="display: flex, align-items: center">
  <h1 style="display: flex, align-items: center, justify-content: space-between;">
    CodeMap
    <span style="cursor: pointer; " on:click={() => ShowSettings()}
      ><Fa size="1x" icon={faCog} style="color:#007acc; padding-right: 4px; float:right" />
    </span>
    <span style="cursor: pointer; " on:click={() => ShowCodeBlocks()}
      ><Fa size="1x" icon={faCubes} style="color:#007acc; padding-right: 4px; float:right" />
    </span>
  </h1>
</div>
<hr>
  {#if $codeMap?.pocket}
  <div style="float:left; width:50%">
  <h2>Pocket</h2>
    <section style="float:left; margin:auto; width: 100%;" use:dndzone={{ items: $codeMap.pocket, flipDurationMs }} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
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

  <div id="area" style="width:100%; height:100%; position:fixed; top:200px;">
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

          {#if typeof treeItem.visible === "undefined" || treeItem?.visible === true}
            <Card {treeItem} />
          {/if}
        {/each}
      </div>

      <!-- Line -->
      {#if lines}
        <div>
          {#each lines as line}
            <Line sourceId={line.sourceId} destId={line.destId} x1={line.x1} x2={line.x2} y1={line.y1} y2={line.y2} />
          {/each}
        </div>
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
    height: 200px;
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
    height: 15%;
    margin: 0.2em 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #dddddd;
    border: 1px solid white;
    color: black;
    justify-content: space-between;
  }

  .groupList{
    display: flex;
    max-height:200px;
    overflow: scroll;
    width:49%;
    flex-direction: column;
  }
</style>
