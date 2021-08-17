<script lang="ts">
  import { filteredTree, flatTree, newRender, currentZoom } from "../../store";
  import Card from "./Card.svelte";
  import { onMount, afterUpdate, beforeUpdate, tick } from "svelte";
  import DragSelect from "dragselect";
  import lodash, { set } from "lodash";
  import deepdash from "deepdash";
  import Line from "./Line.svelte";

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
    $flatTree;
    $newRender;
  }

  // $: $filteredTree, RenderBlocks();

  function SaveCodeMapToFile() {
    tsvscode.postMessage({
      type: "saveCodeMap",
      value: $filteredTree,
    });
  }

  onMount(async () => {
    ds = new DragSelect({
      selectables: document.getElementsByClassName("card"),
      callback: (e) => console.log(e),
      area: document.getElementById("area")
    });

    ds.subscribe("dragstart", (DragStartObject) => {
      if (DragStartObject.isDragging) 
      {
      isMoving = true;

      let childPos = DragStartObject.items[0].getBoundingClientRect();
        let parentPos = DragStartObject.items[0].parentElement.getBoundingClientRect();
        let x = childPos.x - parentPos.x;
        let y = childPos.y - parentPos.y;

        let translate = "translate3d("+x+"px, "+y+"px, 1px) scale("+$currentZoom+")";

      DragStartObject.items[0].style.transform = translate;
      }
    });

    ds.subscribe("dragmove", (DragMovedObject) => {
      //console.log("moving");
      let id = DragMovedObject.event.target.id;

      DragMovedObject.event.preventDefault();

      if(DragMovedObject.isDragging)
      {
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
        // if (DragEndedObject.event.target.getAttribute("data-fileType") === "directory") {
        //   let id = DragEndedObject.event.target.id;

        let filtrate = _.eachDeep($filteredTree, (value, key, parentValue, context) => {
          DragEndedObject.items.forEach((itemInHand) => {
            if (key === "id") {
              if (value.toString() === itemInHand.id) {
                console.log("update filtedTree");
                console.log(parentValue);
                console.log(context);
                let childPos = itemInHand.getBoundingClientRect();
                let parentPos = itemInHand.parentElement.getBoundingClientRect();
                let x = childPos.x - parentPos.x;
                let y = childPos.y - parentPos.y;

                parentValue.locationX = x;
                parentValue.locationY = y;
              }
            }
          });
        });

        selectedBlocks = DragEndedObject.items;
        //RenderLines(DragEndedObject);

        $flatTree = [];

        let childPos2 = DragEndedObject.items[0].getBoundingClientRect();
        let parentPos2 = DragEndedObject.items[0].parentElement.getBoundingClientRect();
        let x2 = childPos2.x - parentPos2.x;
        let y2 = childPos2.y - parentPos2.y;
        let translate = "translate3d("+x2+"px, "+y2+"px, 1px) scale("+$currentZoom+")";
        DragEndedObject.items[0].style.transform = translate;

        // if (!$flatTree)
        // {
        //   RenderBlocks();
        // }
      }
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
      if ($filteredTree) {
        //faketree = _.cloneDeep($filteredTree.children);
        faketree = JSON.parse(JSON.stringify($filteredTree.children))
        FlattenTree(faketree);

       // faketree = _.index(faketree)

        $flatTree = [...new Set(faketree)];
      }
    }
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
    if (!$flatTree) {
      return;
    }

    $flatTree.forEach((item1) => {
      $flatTree.forEach((item2) => {
        if (item1.parentId === item2.id) {
          //lines.forEach((line) => {
          let id1 = "line" + item1.id;
          let id2 = "line" + item2.id;

          let lineExists = lines.find((line) => (line.sourceId.toString() === item1.id.toString() && line.destId.toString() === item2.id.toString()) || (line.sourceId.toString() === item2.id.toString() && line.destId.toString === item1.id.toString()));
          let indexOfLine = lines.indexOf(lineExists);

          if (item1.x2.toString() === "0") {
            item1.x2 = item1.locationX;
            item1.y2 = item1.locationY;

            item2.x2 = item2.locationX;
            item2.y2 = item2.locationY;
          }

          if (lineExists && indexOfLine !== -1) {
            lineExists.x1 = item1.x2;
            lineExists.y1 = item1.y2;

            lineExists.x2 = item2.x2;
            lineExists.y2 = item2.y2;

            //Splice?

            lines.splice(indexOfLine, 1, lineExists);
          } else {
            let line = { sourceId: item1.id, destId: item2.id, x1: item1.x2, y1: item1.y2, x2: item2.x2, y2: item2.y2 };
            lines.push(line);
          }
          // });
        }
      });
    });

    lines = lines;
    console.log("Rendered lines global");
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
</script>

<main id="area" style="width:100%; height:100%; position:fixed;">
  <div class="ds-selected" style="display:none" />
  <button type="button" on:click={SaveCodeMapToFile}>Save CodeMap</button>

  <button type="button" on:click={LoadCodeMap}>Load CodeMap</button>

  {#if $flatTree}
    <div class="zoom">
      {#each $flatTree as treeItem}
        <Card {treeItem} />
      {/each}
    </div>
    <div>
      {#each lines as line}
        <!-- {#if LineCheck(line) === true} -->

        <Line sourceId={line.sourceId} destId={line.destId} x1={line.x1} x2={line.x2} y1={line.y1} y2={line.y2} />
        <!-- {/if} -->
      {/each}
    </div>
  {/if}

  {#if $filteredTree}
    {RenderBlocks()}
  {/if}
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
    padding: 20px;
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
</style>
