<script lang="ts">
  import { flatTree, newRender, currentZoom, perimeterItem, codeMap } from "../../store";
  import lodash, { flatten } from "lodash";
  import deepdash from "deepdash";
  import { afterUpdate, onMount } from "svelte";
  import Fa from "svelte-fa";
  import {
    faBullseye,
    faCode,
    faCompressArrowsAlt,
    faExpandAlt,
    faEyeSlash,
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

  let menu;

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

  onMount(async () => {

  })


  document.body.addEventListener('contextmenu', e => {
  e.preventDefault(); // cancel the built-in context menu
  console.log("ITWORKED2!");
  // let event = e;
  // expand(event);
});

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

  function HideBlock(e, treeItem){
    treeItem.visible = false;
  }

  function expand(e) {
    console.log(e);
    let menu;

    if (e.target.classList.contains("menu"))
      menu = e.target;
    if (e.target.querySelector(".menu"))
      menu = e.target.querySelector(".menu");

    if (menu !== null)
    {

      if (menu.classList.contains("opened")) 
      {
        menu.style.transform = "scale(0)";
        menu.classList.remove("opened");  
      } 
      else 
      {
        menu.style.transform = "scale(3)";
        menu.classList.add("opened");     
      }
    }
   
  }

</script>

<div class="ds-selected ds-hover absolute" style="display:none" />

<main
  on:dblclick={dbClick(treeItem)} on:contextmenu={(event) => expand(event)}
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

<div class="menu" id="menu">
  <a href="#">
    <Fa id="MoveToPocketMenu" on:click={closeHandler} size="1x" icon={faTrashRestore} style="color:red;" />
  </a>
  <a href="#">
    <Fa size="1x" icon={faTrashRestore} style="color:red;" />
  </a>
  <a href="#">
    <Fa size="1x" icon={faTrashRestore} style="color:red;" />
  </a>
  <a href="#">
    <Fa size="1x" icon={faTrashRestore} style="color:red;" />
  </a>
  <a href="#">
    <i class="fa fa-camera" />
  </a>
  <a href="#">
    <i class="fa fa-bell" />
  </a>
</div>

{#if treeItem.id !== "generated"}
  <div class="cardButtons">
    <button id="MoveToPocket"  on:click={closeHandler}><Fa size="1x" icon={faTrashRestore} style="color:red; padding-right: 4px; float:right" /></button>
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
    <button id="HideBlock" on:mousedown={(event) => HideBlock(event, treeItem)}>
      <Fa size="1x" icon={faEyeSlash} style="color:black; padding-right: 4px; float:right" />
    </button>
  </div>
{:else}
  <div class="generatedHeader">
    <h2 style="color:blue">Generated</h2>
  </div>
{/if}

<button type="button" class="inner-hide"> {treeItem.type === "outline" ? treeItem.name.substring(0, 25): treeItem.name}</button>

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
    justify-content: flex-start;
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

  .generatedHeader{
    align-content: center;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }

  .ds-hover {
    background: red;
  }

  .highlight {
    border-color: white;
    z-index: 102 !important;
  }















  body {
    background-color: #eedddd;
    padding: 0px;
    margin: 0px;
    overflow: hidden;
  }

  .toggle {
    background-color: #c87f8a;
    text-align: center;
    height: 100px;
    width: 100px;
    border-radius: 50%;
    position: absolute;
    margin: auto;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }

  .fa-plus {
    font-size: 60px;
    color: white;
    display: block;
    margin-top: 20px;
    transition: 0.7s;
  }

  .menu {
    background-color: white;
    height: 100px;
    width: 100px;
    transform: scale(0);
    border-radius: 50%;
    border-style: double;
    border-color: #c87f8a;
    position: absolute;
    margin: auto;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    z-index: -1;
    transition: 0.1s;
  }

  a {
    display: inline-block;
    position: absolute;
    font-size: 15px;
    color: #bbbbbb;
  }

  a:nth-child(1) {
    top: 6px;
    left: 45px;
  }

  a:nth-child(2) {
    top: 24px;
    left: 77px;
  }

  a:nth-child(3) {
    top: 58px;
    left: 76px;
  }

  a:nth-child(4) {
    top: 78px;
    left: 42px;
  }

  a:nth-child(5) {
    top: 58px;
    left: 10px;
  }

  a:nth-child(6) {
    top: 23px;
    left: 12px;
  }

  a:hover {
    color: #c87f8a;
  }
</style>
