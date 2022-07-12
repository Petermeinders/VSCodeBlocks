<script lang="ts">
  import { codeMap } from "../../../store";
  import type { FilteredTree } from "../../../../src/Models";
  import {Type} from "../../../../src/Models";
  import Fa from "svelte-fa";
  import ColorPicker from "../../ColorPicker.svelte";
  import {
    faCode,
    faCompressArrowsAlt,
    faExclamation,
    faExpandAlt,
    faEyeSlash,
    faFile,
    faFolder,
    faLink,
    faStar as solidStar,
    faTimesCircle,
  } from "@fortawesome/free-solid-svg-icons";
  import { faStar } from "@fortawesome/free-regular-svg-icons";
  import {} from "os";
  import CodeIcons from "../../CodeIcons.svelte";
  import Shared from "../../Shared.svelte";

  let common: Shared;

  export let Minimize = (event: any, treeItem: FilteredTree) => {};
  export let StartLink = (event: any, treeItem: FilteredTree) => {};

  let disabed = true;

  export let treeItem: FilteredTree;

  function HideBlock(e: any, treeItem: FilteredTree) {
    treeItem.visible = false;
  }

  function DeleteBlock(e: any, treeItem: FilteredTree) {
    let index = $codeMap.flatTree.indexOf(treeItem);
    $codeMap.flatTree.splice(index, 1);
  }
</script>

<Shared bind:this={common} />

{#if treeItem}
<div class="cardButtons">

  <!-- <button id="MoveToPocket"  on:click={closeHandler}><Fa size="1x" icon={faTrashRestore} style="color:red; padding-right: 4px; float:right" /></button> -->
  {#if disabed === false}
    <ColorPicker currentBlock={treeItem} color={treeItem.color} />
  {/if}


    {#if treeItem.type === Type.Folder}
      <Fa size="1x" icon={faFolder} style="color:yellow; padding-right: 4px; padding-left:4px; float:right" />
    {/if}

    {#if treeItem.type === Type.File}
      <Fa size="1x" icon={faFile} style="color:white; padding-right: 4px; padding-left:4px; float:right" />
    {/if}

    {#if treeItem.type === Type.Custom}
      <Fa size="1x" icon={faCode} style="color:white; padding-right: 4px; padding-left:4px; float:right" />
    {/if}

    {#if treeItem.type === "outline"}
      <CodeIcons blockType={treeItem.extension} />
    {/if}


  {#if typeof treeItem.starred === "undefined" || treeItem.starred === false}
    <button id="Star" on:click={() => common.StarClicked(treeItem)}
      ><Fa size="1x" icon={faStar} style="color:yellow; padding-right: 4px; float:right" /></button
    >
  {:else}
    <button id="Star" on:click={() => common.StarClicked(treeItem)}
      ><Fa size="1x" icon={solidStar} style="color:yellow; padding-right: 4px; float:right" /></button
    >
  {/if}

  <!-- <button id="SelectPerimeter" on:click={GroupClick}><Fa size="1x" icon={faBullseye} style="color:red; padding-right: 4px; float:right" /></button> -->
  {#if disabed === false}
    {#if typeof treeItem.open === "undefined" || treeItem.open === true}
      <button id="Minimize" on:click={(event) => Minimize(event, treeItem)}>
        <Fa size="1x" icon={faCompressArrowsAlt} style="color:yellow; padding-right: 4px; float:right" />
      </button>
    {:else}
      <button id="Minimize" on:click={(event) => Minimize(event, treeItem)}>
        <Fa size="1x" icon={faExpandAlt} style="color:yellow; padding-right: 4px; float:right" />
      </button>
    {/if}
  {/if}

  {#if disabed === false}
    <button id="StartLink" on:mousedown={(event) => StartLink(event, treeItem)} >
      <Fa size="1x" icon={faLink} class="greyedOut" style="padding-right: 4px; float:right" />
    </button>
  {/if}

  {#if treeItem.type === "custom" || treeItem.type === 2 || treeItem.type === "outline"}
    <button id="DeleteBlock" on:mousedown={(event) => DeleteBlock(event, treeItem)}>
      <Fa size="1x" icon={faTimesCircle} style="color:red; padding-right: 4px; float:right" />
    </button>
  {:else}
    <button id="HideBlock" on:mousedown={(event) => HideBlock(event, treeItem)}>
      <Fa size="1x" icon={faEyeSlash} style="color:black; padding-right: 4px; float:right" />
    </button>
  {/if}
  {#if treeItem.codeDiff === true}
    <button id="CodeDiffFlag" style="background: red" on:mousedown={(event) => StartLink(event, treeItem)} >
      <Fa size="1x" icon={faExclamation} style="color:white; padding-right: 4px; float:right" />
    </button>
  {/if}
  <!-- {#if treeItem.image !== ""}
    <img src={treeItem.image} style="width:100%; height:100%; padding-right: 4px; float:right" />
  {/if} -->
</div>
{/if}

<style>
  .cardButtons {
    display: flex !important;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 10px;
  }
</style>
