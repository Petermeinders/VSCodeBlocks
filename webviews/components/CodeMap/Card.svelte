<script lang="ts">
  import { flatTree, newRender, currentZoom, perimeterItem } from "../../store";
  import lodash, { flatten } from "lodash";
  import deepdash from "deepdash";
  import { afterUpdate } from "svelte";
  import Fa from "svelte-fa";
  import { faBullseye, faCompressArrowsAlt, faExpandAlt, faFile, faFolder, faTrashRestore } from "@fortawesome/free-solid-svg-icons";

  const _ = deepdash(lodash);
  export let left = 30;
  export let top = 30;
  export let card;
  export let treeItem;

  export let closeHandler = () => {};

  export let SelectPerimeter = () => {};

  export let Minimize = (event, treeItem) => {};

  afterUpdate(() => {
    $newRender = $newRender++;
  });

  console.log("rerender this item!");

  function GroupClick() {
    console.log("groupclick");
    $perimeterItem = {
      id: treeItem.id,
      parentId: treeItem.parentId,
    };
  }

  function dbClick(path: string) {
    tsvscode.postMessage({
      type: "OpenFile",
      value: path,
    });
  }
</script>

<div class="ds-selected ds-hover absolute" style="display:none" />

<main
  on:dblclick={dbClick(treeItem.path)}
  style=" background:{treeItem.color} ;z-index:101; {treeItem.locationX !== 0 && treeItem.locationY !== 0
    ? 'transform: translate3d(' + treeItem.locationX + 'px, ' + treeItem.locationY + 'px, 1px) scale(' + $currentZoom + ');'
    : ''}"
  id={treeItem.id}
  data-fileType={treeItem.type}
  data-parentId={treeItem.parentId}
  data-x1={treeItem.x1}
  data-x2={treeItem.x2}
  data-y1={treeItem.y1}
  data-y2={treeItem.y2}
  class="card absolute highlight {treeItem.type === 'directory' ? 'directory' : 'file'}"
>
  <button id="MoveToPocket" on:click={closeHandler}><Fa size="1x" icon={faTrashRestore} style="color:red; padding-right: 4px; float:right" /></button>
  {#if treeItem.type === "directory"}
    <Fa size="1x" icon={faFolder} style="color:yellow; padding-right: 4px; padding-left:4px; float:right" />
  {/if}

  {#if treeItem.type === "file"}
    <Fa size="1x" icon={faFile} style="color:white; padding-right: 4px; padding-left:4px; float:right" />
  {/if}
  <button id="SelectPerimeter" on:click={GroupClick}><Fa size="1x" icon={faBullseye} style="color:red; padding-right: 4px; float:right" /></button>

  {#if treeItem.type === "directory"}
    {#if typeof(treeItem.open) === 'undefined' || treeItem.open === true}
      <button id="Minimize" on:click={(event) => Minimize(event, treeItem)}>
        <Fa size="1x" icon={faCompressArrowsAlt} style="color:yellow; padding-right: 4px; float:right" />
      </button>
      {:else}
      <button id="Minimize" on:click={(event) => Minimize(event, treeItem)}>
        <Fa size="1x" icon={faExpandAlt} style="color:yellow; padding-right: 4px; float:right" />
      </button>
    {/if}
  {/if}
  <button type="button" class="inner-hide"> {treeItem.name}</button>
</main>

<!-- <button type="button" class="card one">1</button> -->

<!-- <section style="top:{top}px; left:{left}px" class="card  {card.type === 'directory' ? 'directory' : 'file'}">
  <div class="card-inner">
    <slot></slot>
  </div>
</section> -->
<!-- {@debug treeItem} -->

<!-- {#if tree}
<ul>
    {#each tree as treeItem, i}
    {#if i < 5}
    <li>
            <slot {treeItem}>No slot</slot>
            {#if treeItem.children}
                <svelte:self tree={treeItem.children} let:treeItem={treeItem}>
                    <slot {treeItem}>No slot</slot>
                </svelte:self>
            {/if}
          </li>
        {/if}
    {/each}
  </ul>
{/if} -->

<!-- {#if tree && $flatTree}
<div style="display:none;"></div>
    {#each tree as treeItem, i}
    {#if i < 20}

            <slot {treeItem}>No slot</slot>
            {$flatTree.push(treeItem)}
            {#if treeItem.children}
                <svelte:self tree={treeItem.children} let:treeItem={treeItem}>
                    <slot {treeItem}>No slot</slot>
                    {$flatTree.push(treeItem)}
                </svelte:self>
            {/if}

            {/if}
    {/each}
  </div>
{/if} -->
<style>
  * {
    user-select: none;
  }
  .card {
    /* padding: 5px; */
    user-select: none;
    /* width: 50px;
  height: 50px; */

    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border: 0;
  }

  .absolute {
    position: absolute;
  }

  .ds-selected {
    outline: 3px solid red;
    outline-offset: 3px;
    color: black;
    font-weight: bold;
  }

  .card:focus {
    border: 1px solid blue;
  }

  .card:hover .inner-hide {
    visibility: hidden;
  }

  .directory {
    border: solid 3px #864fc5;
    background: #b26effcc;
  }

  .file {
    border: solid 3px #4e58bf;
    background: #6e88ffcc;
  }

  .ds-hover {
    background: red;
  }

  .highlight {
    border-color: white;
    z-index: 102 !important;
  }
</style>
