<script lang="ts">
  import { filteredTree, flatTree, newRender } from "../store";
  import Card2 from "./Card2.svelte";
  import { onMount, afterUpdate, beforeUpdate } from "svelte";
  import DragSelect from "dragselect";
  import lodash, { set } from "lodash";
  import deepdash from "deepdash";
  import Line from "./Line.svelte";

  //export let filteredTree: FilteredTree;

  export let left = 30;
  export let top = 30;
  const _ = deepdash(lodash);
  let ds;
  // const _ = require('lodash');
  //         require('deepdash')(_);

  let lines = [];
  let isMoving = false;
  $: isMoving;

  $: {
    lines;
  }
  $: {
    $flatTree;
    $newRender;
  }

  $: $filteredTree,  RenderBlocks();
   
  

  onMount(async () => {
    ds = new DragSelect({
      selectables: document.getElementsByClassName("card"),
      callback: (e) => console.log(e),
      area: document.getElementById("area"),
    });

    ds.subscribe("dragstart", (DragStartObject) => {
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
      if(typeof(DragEndedObject?.items[0]) !== 'undefined' && DragEndedObject.isDragging){
        //let itemArray
        // DragEndedObject.items.forEach(item => {

        // })
      // let x = DragEndedObject.event.layerX;
      // let y = DragEndedObject.event.layerY;


        let childPos = DragEndedObject.items[0].getBoundingClientRect();
        let parentPos = DragEndedObject.items[0].parentElement.getBoundingClientRect();
        let x = childPos.x - parentPos.x;
        let y = childPos.y - parentPos.y;



        console.log("x2:" + x + " y2:" + y)
        let id = DragEndedObject.event.target.id;
        isMoving = false;
        console.log("drag ended");
        // if (DragEndedObject.event.target.getAttribute("data-fileType") === "directory") {
        //   let id = DragEndedObject.event.target.id;

        //   // let foundItem = _.findDeep($filteredTree, (value, key, parentValue, context) => {
        //   //   if (parentValue?.id.toString() === id) {
        //   //     console.log("Found IT!");
        //   //     console.log(value);
        //   //     return true;
        //   //   }
        //   // });
        // }

        RenderLines(DragEndedObject);
      }
     
    });
  });

  // function Drag() {
  //   if (typeof $flatTree !== "undefined" && document.getElementsByClassName("card").length > 0) {
  //     //console.log(foundItem);
  //   }

  //   lines.forEach((line) => {
  //     if (line.childId === id) {
  //       line.x2 = x;
  //       line.y2 = y;
  //     }
  //   });

  //   lines = lines;

  //   $flatTree.forEach((block) => {
  //     if (block.id === id && block.type === "file") {
  //       block.x1 = x;
  //       block.y1 = y;
  //     }
  //   });
  // }

  beforeUpdate(() => {});

  afterUpdate(() => {
   
  });

  function RenderBlocks() {
    if (!isMoving) {
      if ($filteredTree) {
        FlattenTree($filteredTree.children);
        $flatTree = [...new Set(faketree)];
        let cardsCheck = document.getElementsByClassName("card");

        if(cardsCheck.length > 0) {
          let cards = document.getElementsByClassName("card");
          let newCarsArray = [...new Set(cards)];
          ds.setSelectables(newCarsArray);

          // if (typeof $flatTree !== "undefined" && document.getElementsByClassName("card").length > 0) {
          //   Drag();
          // }
        }

       
      }
    }
  }

  function RenderLines(DragEndedObject) {
    $flatTree.forEach((flatItem) => {
      DragEndedObject.items.forEach(itemInHand => {
        if (flatItem.id.toString() === itemInHand.id) {

          let childPos = itemInHand.getBoundingClientRect();
        let parentPos = itemInHand.parentElement.getBoundingClientRect();
        let x = childPos.x - parentPos.x;
        let y = childPos.y - parentPos.y;

        flatItem.x2 = x;
        flatItem.y2 = y;

        let lineExists = lines.find(line => line.childId.toString() === itemInHand.id)
        let indexOfLine = lines.indexOf(lineExists);

        if(lineExists && indexOfLine !== -1){
          lineExists.x2 = flatItem.x2;
          lineExists.y2 = flatItem.y2;

          lines.splice(indexOfLine,1,lineExists);
        }
        else{
          let line = { childId: flatItem.id, x1: 0, y1: 0, x2: flatItem.x2, y2: flatItem.y2 };
          lines.push(line);
        }

        lines = lines;

      
      }
      })
     
    });
  }

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
</script>

<main id="area" style="width:100%; height:100%; position:fixed;">
  <div class="ds-selected" style="display:none" />

  <!-- {#await filteredTree}
  <p>Loading...</p>
  {:then dataValue}
  {#each blocks as block}
    <Card top={block.top} left={block.left}>
    <h1>{block.name}</h1>
    </Card>
    {/each}
    {/await} -->
  <!-- 
    {#await filteredTree}
    <p>Loading...</p>
    {:then dataValue}
    <div class="zoom">
      {#each filteredTree.children as child}
        <Card card={child} currentZoom={zoom} top={50} left={50}>
          <h1>{child.name}</h1>
        </Card>
      {/each}
    </div>
    {/await} -->

  <!-- {#if $filteredTree}
    <div class="zoom">
      {#each $filteredTree.children as child, i}
        <Card card={child} top={top + i*10} left={left + i*10}>
          <h1 style="border: 1px solid black;">{child.name}</h1>
        </Card>
      {/each}
    </div>
  {/if} -->

  <!-- {#if $filteredTree}
    <div class="zoom">
      <Card2 tree={$filteredTree.children} let:treeItem {top} {left} >
        <button style="top:{top}px; left:{left}px" class="card  {treeItem.type === 'directory' ? 'directory' : 'file'}" type="button"
          id={treeItem.id} 
          data-fileType={treeItem.type} 
          data-x1={treeItem.x1}
          data-x2={treeItem.x2} 
          data-y1={treeItem.y1} 
          data-y2={treeItem.y2}>

          {treeItem.name}</button
        >
      </Card2>
    </div>
    <div>
      <Lines />
    </div>

    <div style="display:none;">{getparent()}</div>
  {/if} -->

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
