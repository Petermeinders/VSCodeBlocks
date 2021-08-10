<script lang="ts">
  import type { FilteredTree } from "../store";
  import {filteredTree} from "../store";
  import Card from "./Card.svelte";
  import { onMount, afterUpdate } from "svelte";
  import DragSelect from "dragselect";

   //export let filteredTree: FilteredTree;


  export let left = 30;
  export let top = 30;

  onMount(async () => {
   
  });

  afterUpdate(() => {
    if (typeof($filteredTree) !== "undefined" && document.getElementsByClassName("card").length > 0) {
      new DragSelect({
      selectables: document.getElementsByClassName("card"),
      callback: (e) => console.log(e),
    });

 
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

        if (currentZoom > 1)
          zoomFactor = 1 - currentZoom;
        if (currentZoom < 1)
          zoomFactor = 1 + currentZoom;

      if (moving) {
        left += e.movementX * zoomFactor ;
        top += e.movementY * zoomFactor;
      }
    }

    $: console.log(moving);
</script>

<main style="width:100px; height:100px; position:fixed;">
  <div class="ds-selected" style="display:none"></div>

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

  {#if $filteredTree}
  <div class="zoom">
    <Card tree={$filteredTree.children} let:treeItem={treeItem} top={top} left={left}>
      <button style="top:{top}px; left:{left}px" class="card  {treeItem.type === 'directory' ? 'directory' : 'file'}" type="button" >{treeItem.name}</button>
    </Card>
  </div>
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
    /* position:fixed;   */
    top: 0;
    left: 0;
  }

  .card {
    padding:20px;
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
