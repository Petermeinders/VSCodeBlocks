<script lang="ts">

  import { flatTree, currentZoom, perimeterItem, codeMap, editItem, rightClickedBlockEvent, items } from "../../store";
  import type { FilteredTree } from "../../../src/Models";
  import deepdash from "deepdash";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import ColorPicker from "../ColorPicker.svelte";
  import Radial from "./CardRadial.svelte";

  import {
    faBullseye,
    faCode,
    faCompressArrowsAlt,
    faExpandAlt,
    faEyeSlash,
    faFile,
    faFolder,
    faFont,
    faLink,
    faObjectGroup,
    faPencilAlt,
    faStar as solidStar,
    faTimesCircle,
  } from "@fortawesome/free-solid-svg-icons";
  import { faStar } from "@fortawesome/free-regular-svg-icons";
  import {} from "os";
  import CodeIcons from "../CodeIcons.svelte";

  export let closeHandler = () => {};
  export let StarClicked = (treeItem: any) => {};
  export let GroupBlocks = (event:MouseEvent) => {};
  export let Minimize = (event: any, treeItem: FilteredTree) => {};
  export let StartLink = (event: any, treeItem: FilteredTree) => {};

  export let treeItem: FilteredTree = {

  };

  
  function HideBlock(e: any, treeItem: FilteredTree) {
    treeItem.visible = false;
  }

  function DeleteBlock(e: any, treeItem: FilteredTree) {
    let index = $codeMap.flatTree.indexOf(treeItem);
    $codeMap.flatTree.splice(index,1);

  }


</script>


<div class="cardButtons">
  <!-- <button id="MoveToPocket"  on:click={closeHandler}><Fa size="1x" icon={faTrashRestore} style="color:red; padding-right: 4px; float:right" /></button> -->
  <ColorPicker currentBlock={treeItem} color={treeItem.color}/>
  
  {#if treeItem.type === "directory"}
    <Fa size="1x" icon={faFolder} style="color:yellow; padding-right: 4px; padding-left:4px; float:right" />
  {/if}

  {#if treeItem.type === "file"}
    <Fa size="1x" icon={faFile} style="color:white; padding-right: 4px; padding-left:4px; float:right" />
  {/if}

  {#if treeItem.type === "custom"}
    <Fa size="1x" icon={faCode} style="color:white; padding-right: 4px; padding-left:4px; float:right" />
  {/if}

  {#if treeItem.type === "outline" }
  <CodeIcons blockType={treeItem.extension}/>    
  {/if}

  {#if typeof treeItem.starred === "undefined" || treeItem.starred === false}
    <button id="Star" on:click={() => StarClicked(treeItem)}
      ><Fa size="1x" icon={faStar} style="color:yellow; padding-right: 4px; float:right" /></button
    >
  {:else}
    <button id="Star" on:click={() => StarClicked(treeItem)}
      ><Fa size="1x" icon={solidStar} style="color:yellow; padding-right: 4px; float:right" /></button
    >
  {/if}

  <!-- <button id="SelectPerimeter" on:click={GroupClick}><Fa size="1x" icon={faBullseye} style="color:red; padding-right: 4px; float:right" /></button> -->

  {#if typeof treeItem.open === "undefined" || treeItem.open === true}
    <button id="Minimize" on:click={(event) => Minimize(event, treeItem)}>
      <Fa size="1x" icon={faCompressArrowsAlt} style="color:yellow; padding-right: 4px; float:right" />
    </button>
  {:else}
    <button id="Minimize" on:click={(event) => Minimize(event, treeItem)}>
      <Fa size="1x" icon={faExpandAlt} style="color:yellow; padding-right: 4px; float:right" />
    </button>
  {/if}

  <button id="StartLink" on:mousedown={(event) => StartLink(event, treeItem)}>
    <Fa size="1x" icon={faLink} style="color:blue; padding-right: 4px; float:right" />
  </button>
  {#if treeItem.type === "custom" || treeItem.type === "outline"}
  <button id="DeleteBlock" on:mousedown={(event) => DeleteBlock(event, treeItem)}>
    <Fa size="1x" icon={faTimesCircle} style="color:red; padding-right: 4px; float:right" />
  </button>
  {:else}
  <button id="HideBlock" on:mousedown={(event) => HideBlock(event, treeItem)}>
    <Fa size="1x" icon={faEyeSlash} style="color:black; padding-right: 4px; float:right" />
  </button>
  {/if}
</div>


<style>
   .cardButtons {
    display: flex !important;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 10px;
  }
</style>
