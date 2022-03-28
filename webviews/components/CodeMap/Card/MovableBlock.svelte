<script lang="ts">
  import { afterUpdate, beforeUpdate, tick } from "svelte";
  import { Type } from '../../../../src/Models';
  import type { FilteredTree } from '../../../../src/Models';
  import RadialMenu from "../Card/CardRadial.svelte";
  import CardMenu from "../Card/CardMenu.svelte";
  import { Sibling } from '../../../../src/Models';


  import Moveable from "svelte-moveable";
  import { zoom, codeMap, rightClickedBlockEvent } from "../../../store";
import BlockContainer from "./BlockContainer.svelte";

  const frame = {
    translate: [0, 0],
  };
  let target;
  let moveable: Moveable;
  export let treeItem: FilteredTree;
  export let OnDragEnded = (target: HTMLDivElement, treeItem: FilteredTree) => {};
  export let GroupBlocks = (event:MouseEvent) => {};
  export let Minimize = (event: any, treeItem: FilteredTree) => {};
  export let StartLink = (event: any, treeItem: FilteredTree) => {};


  $: {
    $zoom, onzoomChange();
  }

function OnDragEnd(target: HTMLDivElement, isDrag, clientX, clientY) {
  console.log("onDragEnd", target, isDrag, clientX, clientY);
  let codeBlock = $codeMap.flatTree.find((item) =>  item.id === target.id)

  if (codeBlock)
    OnDragEnded(target, codeBlock);
}

  async function onzoomChange() {
      if (moveable) {
        // moveable.getInstance().padding = { left: 10 + $zoom, top: 10  + $zoom, right: 10  + $zoom, bottom: 10  };
        await tick();
       moveable.request("scalable", {deltaWidth: 1, deltaHeight: 1 }, true);
        moveable.getInstance().className = "moveable2";


        moveable?.getInstance()?.updateRect();
      }
    
    moveable?.getInstance()?.updateRect();
    console.log(moveable?.getInstance().getRect());
    console.log("onZoomchange");
  }

  beforeUpdate(() => {

  });

  afterUpdate(() => {
   
    console.log("afterUpdate");
  });
  



//Card ----------------------------------------------------------------------------------------------------------------------



   //Double Clicking block opens file and takes you to the line
   function dbClickBlock(item: FilteredTree) {
    let dbClickValues:FilteredTree = {
    id: "",
    path: "",
    name: "",
    size: 0,
    type: Type.Custom,
    color: "",
    tags: [],
    placeholders: [],
    code: "",
    language: "",
    visible: false,
    open: false,
    parentId: "",
    outputx: 0,
    outputy: 0,
    inputx: 0,
    inputy: 0,
    children: [],
    extension: "",
    locationX: "",
    locationY: "",
    startLine: "",
    startCharacter: "",
    endLine: "",
    endCharacter: "",
    starred: false,
    linkedTargetBlocks: [],
    codeDiff: false
};
    dbClickValues.path = item.path;
    dbClickValues.type = item.type;
    dbClickValues.startLine = item.startLine;
    dbClickValues.startCharacter = item.startCharacter;
    dbClickValues.endLine = item.endLine;
    dbClickValues.endCharacter = item.endCharacter;


    if (item.type === "outline") {
      $codeMap.flatTree.forEach((flatItem) => {
        if (flatItem.id === item.parentId) {
          dbClickValues.path = flatItem.path;
        }
      });
    }

    tsvscode.postMessage({
      type: "OpenFile",
      value: dbClickValues,
    });
  }


  function expand(e: any) 
  {
    console.log(e);
    let menu;

    $rightClickedBlockEvent = e;
    if (e.target.classList.contains("menu")) menu = e.target;
    if (e.target.querySelector(".menu")) menu = e.target.querySelector(".menu");

    if (menu !== null) {
      if (menu.classList.contains("opened")) {
        menu.style.transform = "scale(0)";
        
        menu.classList.remove("opened");
        //New stuff here!!!
      } else {
        menu.style.transform = "scale(3)";
        //New stuff here!!!
        menu.classList.add("opened");
      }
    }
  }

  const GetCardSpawnLocationX = (treeItem: FilteredTree) => {
    // if (treeItem.sibling === Sibling.Parent) {
    //   return treeItem.locationX;
    // }

    return treeItem.locationX;
  }

  const GetCardSpawnLocationY = (treeItem: FilteredTree) => {
    // if (treeItem.sibling === Sibling.Parent) {
    //   return treeItem.locationY + 100;
    // }

    return treeItem.locationY;
  }

    //Pin/Unpin block
    function StarClicked(treeItem: FilteredTree) {
    if (treeItem.starred) {
      treeItem.starred = false;
    } else {
      treeItem.starred = true;
    }

    let index = $codeMap.flatTree.indexOf(treeItem);
    $codeMap.flatTree.splice(index, 1, treeItem);
    $codeMap.flatTree = $codeMap.flatTree;
  }

</script>





  <main>








  <div bind:this={target}
  on:dblclick={() => dbClickBlock(treeItem)}
  on:contextmenu={(event) => expand(event)}
  style="{treeItem.locationX !== "0" && treeItem.locationY !== "0" ? 'left:' + GetCardSpawnLocationX(treeItem) + "px" + '; ' + 'top:' + GetCardSpawnLocationY(treeItem) + "px" + ";": ''}"
  id={treeItem.id}
  data-fileType={treeItem.type}
  data-parentId={treeItem.parentId}
  class="target card absolute highlight BlockImage {treeItem.type === Type.Folder ? 'directory' : 'file'}">

  <RadialMenu treeItem={treeItem} {StarClicked}  {GroupBlocks} />

  <!-- GENERATED -->
  {#if treeItem.sibling === Sibling.Self || treeItem.sibling === undefined}
    {#if treeItem.id !== "generated"}
        <CardMenu treeItem={treeItem} {StarClicked} {Minimize} {StartLink}/>
        {:else if treeItem.name !== ""}
          <div class="generatedHeader">
            <h2 style="color:white">Grab to create block</h2>
          </div>
    {/if}
  {:else if treeItem.sibling === Sibling.Parent}
    <!-- Generated Sibling -->
  <div class="generatedHeader">
    <h2 style="color:white">Generated Parent</h2>
  </div>
  {/if}


  {#if treeItem?.image === "" || typeof(treeItem?.image) === "undefined"}
    {treeItem.type === Type.Custom ? treeItem.name.substring(0, 25) : treeItem.name}
  {/if}

  {$zoom}


</div>







    <Moveable
      draggable={true}
      useResizeObserver={true}
      zoom={1}
      {target}
      scalable={true}
      resizable={true}
      throttleResize={0}
      throttleDrag={0}
      bind:this={moveable}
      on:dragStart={({ detail: { set } }) => {
        set(frame.translate);
      }}
      on:drag={({ detail: { target, beforeTranslate } }) => {
        frame.translate = beforeTranslate;
        target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px)`;
      }}
      on:dragEnd={({ detail: { target, isDrag, clientX, clientY } }) => {
        OnDragEnd(target, isDrag, clientX, clientY);
      }}
      on:resizeStart={({ detail: { target, set, setOrigin, dragStart } }) => {
        // Set origin if transform-origin use %.
        setOrigin(["%", "%"]);
    
        // If cssSize and offsetSize are different, set cssSize. (no box-sizing)
        const style = window.getComputedStyle(target);
        const cssWidth = parseFloat(style.width);
        const cssHeight = parseFloat(style.height);
        set([cssWidth, cssHeight]);
    
        // If a drag event has already occurred, there is no dragStart.
        dragStart && dragStart.set(frame.translate);
      }}
      on:resize={({ detail: { target, width, height, drag } }) => {
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
    
        // get drag event
        frame.translate = drag.beforeTranslate;
        target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px)`;
      }}
      on:resizeEnd={({ detail: { target, isDrag, clientX, clientY } }) => {
        console.log("onResizeEnd", target, isDrag);
      }}
    />
</main>

<style>
    :global(.moveable2) {
        border: 1px solid red;
    }
</style>