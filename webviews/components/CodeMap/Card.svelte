<script lang="ts">
  import { filteredTree, flatTree, newRender, currentZoom, dbClickedItem } from "../../store";
  import type { FilteredTree } from "../store";
  import lodash, { flatten } from "lodash";
  import deepdash from "deepdash";
  import { afterUpdate } from "svelte";

  const _ = deepdash(lodash);
  export let left = 30;
  export let top = 30;
  export let card;
  export let treeItem;

  afterUpdate(() => {
    $newRender = $newRender++;
  });

  console.log("rerender this item!")

  function GroupClick()
  {
    console.log("groupclick");
    $dbClickedItem = {
      id: treeItem.id,
      parentId: treeItem.parentId
    }
  }
</script>

<div class="ds-selected ds-hover absolute" style="display:none" />

<main  on:dblclick={GroupClick} style="z-index:101; {treeItem.locationX !== 0 && treeItem.locationY !== 0 ? 'transform: translate3d('+treeItem.locationX+'px, '+treeItem.locationY+'px, 1px) scale('+$currentZoom+');' : ''}"
  id={treeItem.id}
  data-fileType={treeItem.type}
  data-parentId={treeItem.parentId}
  data-x1={treeItem.x1}
  data-x2={treeItem.x2}
  data-y1={treeItem.y1}
  data-y2={treeItem.y2}
  class="card absolute highlight {treeItem.type === 'directory' ? 'directory' : 'file'}"
>
<!-- <button type=Button on:dblclick={GroupClick}>O</button> -->
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
    padding: 20px;
    user-select: none;
    /* width: 50px;
  height: 50px; */
   
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border: 0;
  }

  .absolute{
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

  .highlight{
    border-color:white;
    z-index: 102 !important;
  }
</style>
