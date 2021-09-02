<script lang="ts">
  import { flatTree, newRender, currentZoom, perimeterItem, codeMap } from "../../store";
  import lodash, { flatten } from "lodash";
  import deepdash from "deepdash";
  import { afterUpdate } from "svelte";
  import Fa from "svelte-fa";
  import {
    faBullseye,
    faCode,
    faCompressArrowsAlt,
    faExpandAlt,
    faFile,
    faFolder,
    faLink,
    faStar as solidStar,
    faStarHalf,
    faTrashRestore,
  } from "@fortawesome/free-solid-svg-icons";
  import { faStar } from "@fortawesome/free-regular-svg-icons";

  import {} from "os";
  import type { TreeItem } from "vscode";

  const _ = deepdash(lodash);
  export let left = 30;
  export let top = 30;
  export let card;
  export let treeItem;

  export let closeHandler = () => {};

  export let SelectPerimeter = () => {};

  export let Minimize = (event, treeItem) => {};

  export let StartLink = (event, treeItem) => {};


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

  function dbClick(item: TreeItem) {
    let dbClickValues = {};
    dbClickValues.path = item.path;
    dbClickValues.type = item.type;
    dbClickValues.startLine = item._startLine;

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

  function StarClicked(treeItem) 
  {
    if (treeItem.starred)
    {
      treeItem.starred = false;  
    }
    else
    {
      treeItem.starred = true;
    }

    let index = $codeMap.flatTree.indexOf(treeItem);
    $codeMap.flatTree.splice(index,1,treeItem);
    $codeMap.flatTree = $codeMap.flatTree;

  }

</script>

<div class="ds-selected ds-hover absolute" style="display:none" />

<main
  on:dblclick={dbClick(treeItem)}
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
<div class="cardButtons">
  <button id="MoveToPocket" on:click={closeHandler}><Fa size="1x" icon={faTrashRestore} style="color:red; padding-right: 4px; float:right" /></button>
  {#if treeItem.type === "directory"}
    <Fa size="1x" icon={faFolder} style="color:yellow; padding-right: 4px; padding-left:4px; float:right" />
  {/if}

  {#if treeItem.type === "file"}
    <Fa size="1x" icon={faFile} style="color:white; padding-right: 4px; padding-left:4px; float:right" />
  {/if}

  {#if treeItem.type === "outline"}
    <Fa size="1x" icon={faCode} style="color:white; padding-right: 4px; padding-left:4px; float:right" />
  {/if}

  {#if typeof treeItem.starred === "undefined" || treeItem.starred === false}
    <button id="Star" on:click={() => StarClicked(treeItem)}><Fa size="1x" icon={faStar} style="color:yellow; padding-right: 4px; float:right" /></button>
  {:else}
    <button id="Star" on:click={() => StarClicked(treeItem)}><Fa size="1x" icon={solidStar} style="color:yellow; padding-right: 4px; float:right" /></button>
  {/if}

  <button id="SelectPerimeter" on:click={GroupClick}><Fa size="1x" icon={faBullseye} style="color:red; padding-right: 4px; float:right" /></button>

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
</div>

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
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    color: white;
    border: 0;
  }

  .cardButtons {
    display: flex;
    justify-content: center;
    align-items: center;
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
