<script lang="ts">
import type { FilteredTree } from '../store';

import Card from './Card.svelte';

export let filteredTree: FilteredTree;

let blocks = [
    {id:1, name:"block1", content:"nothing", top:50, left:10},
    {id:2, name:"block2", content:"nothing2", top:10, left:30},
    {id:2, name:"block3", content:"nothing3", top:90, left:80}
]


const GetFiles = () => {
    tsvscode.postMessage({
      type: "GetFiles",
      value: "",
    });
  }

  GetFiles();

let zoom = 1;
const ZOOM_SPEED = 0.1;

document.addEventListener("wheel", function(e) {  
  const zoomElement = document.querySelector(".zoom");

    
    if(e.deltaY > 0){    
        zoomElement.style.transform = `scale(${zoom -= ZOOM_SPEED})`;  
    }else{    
        zoomElement.style.transform = `scale(${zoom += ZOOM_SPEED})`;  }

});

</script>



<main style="width:100px; height:100px; position:relative;">
    <!-- {#each blocks as block}
    <Draggable top={block.top} left={block.left}>
    <h1>{block.name}</h1>
    </Draggable>
    {/each} -->


    {#if filteredTree}
    <div class="zoom">  
    {#each filteredTree.children as child}
    <Card card={child} currentZoom={zoom} top={50} left={50}>
    <h1>{child.name}</h1>
    </Card>
    {/each}
  </div>
    {/if}

    
    <!-- <div class="zoom">  
      <h1>Zoom meeeee</h1>
  </div> -->
</main>

<style>
.zoom{  
    height:1vh;  
    width:100%;  
    display:grid;  
    place-items:center;  
    /* position:fixed;   */
    top:0;  
    left:0;
}
</style>