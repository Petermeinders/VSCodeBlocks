<script lang="ts">
  import { filteredTree, flatTree, newRender } from "../store";
  import Card2 from "./Card2.svelte";
  import { onMount, afterUpdate, beforeUpdate, tick } from "svelte";
  import DragSelect from "dragselect";
  import lodash, { set } from "lodash";
  import deepdash from "deepdash";
  import Line from "./Line.svelte";

  export let left = 30;
  export let top = 30;
  const _ = deepdash(lodash);
  let ds;
  // const _ = require('lodash');
  //         require('deepdash')(_);

  let lines = [];
  let isMoving = false;
  let selectedBlocks;

  //$: selectedBlocks, RenderLinesAfterMove();

  $: isMoving;

  $: {
    lines;
  }
  $: {
    $flatTree;
    $newRender;
  }

  $: $filteredTree, RenderBlocks();





  
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
      area: document.getElementById("area"),
    });

    ds.subscribe("dragstart", (DragStartObject) => {
      if(DragStartObject.isDragging)
          isMoving = true;
    });

    ds.subscribe("dragmove", (DragMovedObject) => {
      //console.log("moving");
      let x = DragMovedObject.event.offsetX;
      let y = DragMovedObject.event.offsetY;
      let id = DragMovedObject.event.target.id;

      DragMovedObject.event.preventDefault();
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
            if(key === "id")
            {
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

        // if (!$flatTree)
        // {
        //   RenderBlocks();
        // }
      }
    });
  });

  async function resetLines(){
    
  }

  beforeUpdate(() => {
    console.log("update lines!");
    RenderBlocks();
    RenderLines();
    // RenderLines(selectedBlocks)
  });

  afterUpdate(() => {

    AddCardsToDrag();
  });

 function RenderBlocks() {
    if (!isMoving) {
      if ($filteredTree) {
        faketree = _.cloneDeep($filteredTree.children);  
        FlattenTree(faketree);
        
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

          // MoveBlocksToTheirLocations()

          // if (typeof $flatTree !== "undefined" && document.getElementsByClassName("card").length > 0) {
          //   Drag();
          // }
        }
  }

  // function MoveBlocksToTheirLocations(){
  //   $flatTree.forEach(block => {
      
  //   })
  // }

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

          let lineExists = lines.find((line) => line.childId.toString() === item1.id.toString() || line.childId.toString() === item2.id.toString());
          let indexOfLine = lines.indexOf(lineExists);

          if(item1.x2.toString() === "0")
          {
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
            let line = { childId: item2.id, x1: item1.x2, y1: item1.y2, x2: item2.x2, y2: item2.y2 };
            lines.push(line);
          }
          // });
        }
      });
    });

    lines = lines;
    console.log("Rendered lines global");
  }

  // function RenderLinesAfterMove() {
  //   if (!selectedBlocks || selectedBlocks?.length === 0) return;

  //   $flatTree.forEach((flatItem) => {
  //     selectedBlocks.forEach((itemInHand) => {
  //       if (flatItem.id.toString() === itemInHand.id) {
  //         let childPos = itemInHand.getBoundingClientRect();
  //         let parentPos = itemInHand.parentElement.getBoundingClientRect();
  //         let x = childPos.x - parentPos.x;
  //         let y = childPos.y - parentPos.y;

  //         flatItem.x2 = x;
  //         flatItem.y2 = y;

  //         let lineExists = lines.find((line) => line.childId.toString() === itemInHand.id);
  //         let indexOfLine = lines.indexOf(lineExists);

  //         if (lineExists && indexOfLine !== -1) {
  //           let zeroCheck = lineExists.x1 * lineExists.x2 * lineExists.y1 * lineExists.x2;
  //           if (zeroCheck === 0) {
  //             lines.splice(indexOfLine, 1);
  //           } else {
  //             lineExists.x2 = flatItem.x2;
  //             lineExists.y2 = flatItem.y2;

  //             lines.splice(indexOfLine, 1, lineExists);
  //           }
  //         } else {
  //           // let line = { childId: flatItem.id, x1: 0, y1: 0, x2: flatItem.x2, y2: flatItem.y2 };
  //           // lines.push(line);
  //         }

  //         lines = lines;
  //       }
  //     });
  //   });
  // }

  // function DragCall(){

  //   }

  // $:{
  //   filteredTree;
  //   DragCall();

  // }

  // document.addEventListener("wheel", function (e) {
  //   const zoomElement = document.querySelector(".zoom");

  //   if (e.deltaY > 0) {
  //     zoomElement.style.transform = `scale(${(zoom -= ZOOM_SPEED)})`;
  //   } else {
  //     zoomElement.style.transform = `scale(${(zoom += ZOOM_SPEED)})`;
  //   }
  //   console.log("changed!");
  // });

  let blocks = [
    { id: 1, name: "block1", content: "nothing", top: 50, left: 10 },
    { id: 2, name: "block2", content: "nothing2", top: 10, left: 30 },
    { id: 2, name: "block3", content: "nothing3", top: 90, left: 80 },
  ];

  let block = blocks[0];

  const GetFiles = () => {
    tsvscode.postMessage({
      type: "GetFiles",
      value: "",
    });
  };

  GetFiles();

  let zoom = 1;
  const ZOOM_SPEED = 0.1;

  let moving = false;

  function start() {
    moving = true;
  }

  function stop() {
    moving = false;
  }

  function move(e) {
    let zoomFactor = 1;

    if (currentZoom > 1) zoomFactor = 1 - currentZoom;
    if (currentZoom < 1) zoomFactor = 1 + currentZoom;

    if (moving) {
      left += e.movementX * zoomFactor;
      top += e.movementY * zoomFactor;
    }
  }

  $: console.log(moving);

  function getparent() {
    let filtrate = _.eachDeep(filteredTree, (value, key, parentValue, context) => {
      if (value.type === "directory") {
      }
    });

    console.log("filtrate2");
    console.log(filtrate);
  }

  let faketree = [];

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

  function LineCheck(line) {
    let lineid = "line" + line.childId;
    let foundElement = document.getElementById(lineid);
    let x1;
    let x2;
    let y1;
    let y2;
    if (foundElement) {
      x1 = foundElement.getAttribute("x1");
      x2 = foundElement.getAttribute("x2");
      y1 = foundElement.getAttribute("y1");
      y2 = foundElement.getAttribute("y2");
    }
    console.log(foundElement);
    console.log(line);
    if (line.x1.toString() !== x1 || line.x2.toString() !== x2 || line.y1.toString() !== y1 || line.y2.toString() !== y2) {
      return true;
    } else {
      return false;
    }
  }

  function LoadCodeMap(){
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
        <Card2 {treeItem} />
      {/each}
    </div>
    <div>
      {#each lines as line}
        <!-- {#if LineCheck(line) === true} -->

        <Line id={line.childId} x1={line.x1} x2={line.x2} y1={line.y1} y2={line.y2} />
        <!-- {/if} -->
      {/each}
    </div>
  {/if}

  {#if $filteredTree}
    {RenderBlocks()}
  {/if}

  <!-- <div class="zoom">  
      <h1>Zoom meeeee</h1>
  </div> -->
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
