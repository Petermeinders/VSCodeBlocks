<script lang="ts">
  import { filteredTree, flatTree, newRender } from "../store";
  import Card2 from "./Card2.svelte";
  import { onMount, afterUpdate } from "svelte";
  import DragSelect from "dragselect";
  import { each } from "svelte/internal";
  import lodash from "lodash";
  import deepdash from "deepdash";
import { TreeItem } from "vscode";
import Line from "./Line.svelte";

  //export let filteredTree: FilteredTree;

  export let left = 30;
  export let top = 30;
  const _ = deepdash(lodash);
  // const _ = require('lodash');
  //         require('deepdash')(_);

  let lines = [];

  $: {
    $flatTree;
    $newRender
    Drag();
  }

  onMount(async () => {});

  function Drag() {
    if (typeof $flatTree !== "undefined" && document.getElementsByClassName("card").length > 0) {
      const ds = new DragSelect({
        selectables: document.getElementsByClassName("card"),
        callback: (e) => console.log(e),
      });

      ds.subscribe("dragstart", (DragStartObject) => {});

      ds.subscribe("dragmove", (DragMovedObject) => {
        //console.log("moving");
        let x = DragMovedObject.event.offsetX;
        let y = DragMovedObject.event.offsetY;
        let id = DragMovedObject.event.target.id;

        DragMovedObject.event.preventDefault();

        let newIndex = _.index($filteredTree);


        // $flatTree.forEach(block => {
        //   if (block.type === "file")
        //   {
            
        //   }
        // })


        //if ($flatTree) console.log($flatTree);
        //console.log(newIndex);

        //   for (const i in newIndex){
        //     console.log(`${i}: ${newIndex[i]}`);
        //   }

        //  let foundItem = _.findDeep($filteredTree, (value, key, parentValue, context) =>{
        //         if(parentValue?.id.toString() === id)
        //         {
        //           console.log("Found IT!");
        //           console.log(value);
        //             return true;
        //         }
        //     });

        //     if(foundItem && foundItem.parent)
        //     {
        //     foundItem.parent.x1 = x;
        //     foundItem.parent.y1 = y;
        //     }
      });

      ds.subscribe("callback", (DragEndedObject) => {
        console.log("drag ended");
        if (DragEndedObject.event.target.getAttribute("data-fileType") === "directory") {
          let id = DragEndedObject.event.target.id;

          let foundItem = _.findDeep($filteredTree, (value, key, parentValue, context) => {
            if (parentValue?.id.toString() === id) {
              console.log("Found IT!");
              console.log(value);
              return true;
            }
          });

          //console.log(foundItem);
        }
      });
    }
  }

  afterUpdate(() => {
    if ($filteredTree) 
      FlattenTree($filteredTree.children);

      faketree.forEach(item => {
        if(item.type === "file")
        {

          faketree.forEach(parent =>{
            if(parent.type === "directory")
              if (parent.id === item.parentId)
              {
                let line = {x1:item.x1, y1:item.y1, x2:parent.x2, y2:parent.y2}
                lines.push(line);
              } 
          })
        }
      })


    $flatTree = [...faketree];

    if (typeof $flatTree !== "undefined" && document.getElementsByClassName("card").length > 0) {
      Drag();
    }
  });

  // function DragCall(){

  //   }

  // $:{
  //   filteredTree;
  //   DragCall();

  // }

  document.addEventListener("wheel", function (e) {
    const zoomElement = document.querySelector(".zoom");

    if (e.deltaY > 0) {
      zoomElement.style.transform = `scale(${(zoom -= ZOOM_SPEED)})`;
    } else {
      zoomElement.style.transform = `scale(${(zoom += ZOOM_SPEED)})`;
    }
    console.log("changed!");
  });

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
</script>

<main style="width:100px; height:100px; position:fixed;">
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
      <Line x1={line.x1} x2={line.x2} y1={line.y1} y2={line.y2}/>
     {/each}
    </div>

    <div style="display:none;">{Drag()}</div>
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
