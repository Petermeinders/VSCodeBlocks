<script lang="ts">
  import { flatTree, currentZoom, perimeterItem, codeMap, editItem, rightClickedBlockEvent, items } from "../../store";
  import type { FilteredTree } from '../../../src/Models';
  import lodash, { flatten } from "lodash";
  import deepdash from "deepdash";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
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
  } from "@fortawesome/free-solid-svg-icons";
  import { faStar } from "@fortawesome/free-regular-svg-icons";
  import {} from "os";

  const _ = deepdash(lodash);
  export let left = 30;
  export let top = 30;
  export let card;
  export let treeItem: FilteredTree;
  export let closeHandler = () => {};
  export let GroupBlocks = (event:MouseEvent) => {};
  export let SelectPerimeter = () => {};
  export let Minimize = (event: any, treeItem: FilteredTree) => {};
  export let StartLink = (event: any, treeItem: FilteredTree) => {};

  let buttonsDisplay = $items.settings.alwaysShowCodeBlockButtons ? 'display:flex;' : "display:none;";

  function NameChangeMenu(e: any, treeItem: FilteredTree) {
    //Needs to be refactored here from Canvas -> ds.subscribe
  }

  function GroupClick() {
    console.log("groupclick");
    $perimeterItem = {
      id: treeItem.id,
      parentId: treeItem.parentId,
    };
  }

  onMount(async () => {});

  document.body.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // cancel the built-in context menu
    console.log("ITWORKED2!");
    // let event = e;
    // expand(event);
  });

  function dbClickBlock(item: FilteredTree) {
    let dbClickValues:FilteredTree = {
    id: "",
    path: "",
    name: "",
    size: 0,
    type: "",
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
    _startCharacter: "",
    _endLine: "",
    _endCharacter: "",
    starred: false,
    linkedTargetBlocks: []
};
    dbClickValues.path = item.path;
    dbClickValues.type = item.type;
    dbClickValues.startLine = item.startLine;

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

  function HideBlock(e: any, treeItem: FilteredTree) {
    treeItem.visible = false;
  }

  function expand(e: any) {
    console.log(e);
    let menu;

    $rightClickedBlockEvent = e;
    if (e.target.classList.contains("menu")) menu = e.target;
    if (e.target.querySelector(".menu")) menu = e.target.querySelector(".menu");

    if (menu !== null) {
      if (menu.classList.contains("opened")) {
        menu.style.transform = "scale(0)";
        menu.classList.remove("opened");
      } else {
        menu.style.transform = "scale(3)";
        menu.classList.add("opened");
      }
    }
  }

  function EditCodeBlock(event: any, treeItem: FilteredTree) {
    console.log("EDIT TEST FROM MENU");

    $editItem = {
      id: treeItem.id,
      tempId: "",
      code: treeItem.code ?? "",
      language: treeItem.language ?? "",
      linkedBlocks: [],
      name: treeItem.name ?? "New Name",
      placeholders: treeItem.placeholders ?? [],
      tags: treeItem.tags ?? [],
      visible: "true",
      color: treeItem.color ?? "white",
    };

    tsvscode.postMessage({
      type: "editCode",
      value: treeItem,
    });
  }

  function handleMouseOver(e:any) {
		buttonsDisplay = 'display:flex;';
	}
	function handleMouseOut(e:any) {
    if (!$items.settings.alwaysShowCodeBlockButtons){
      buttonsDisplay = 'display:none;';
    }
	}
</script>

<div class="ds-selected ds-hover absolute" style="display:none" />

<main
  on:dblclick={() => dbClickBlock(treeItem)}
  on:contextmenu={(event) => expand(event)}

  style=" background:{treeItem.color} ;z-index:101; {treeItem.locationX !== "0" && treeItem.locationY !== "0"
    ? 'transform: translate3d(' + treeItem.locationX + 'px, ' + treeItem.locationY + 'px, 1px) scale(' + $currentZoom + ');'
    : ''}"
  id={treeItem.id}
  data-fileType={treeItem.type}
  data-parentId={treeItem.parentId}

  class="card absolute highlight {treeItem.type === 'directory' ? 'directory' : 'file'}"
>
  <div class="menu" id="menu">
    <a href="#">
      {#if typeof treeItem.starred === "undefined" || treeItem.starred === false}
        <Fa id="Star" on:click={() => StarClicked(treeItem)} size="1x" icon={faStar} style="color:yellow;" />
      {:else}
        <Fa id="Star" on:click={() => StarClicked(treeItem)} size="1x" icon={solidStar} style="color:yellow;" />
      {/if}
    </a>
    <a href="#" class="tooltip">
      <span style=" cursor: pointer;" on:click={(event) => GroupBlocks(event)}> <Fa id="GroupBlocks" size="1x" icon={faObjectGroup} style="color:red;" /></span>
      <span class="tooltiptext">Group</span>
    </a>
    <a href="#">
      <Fa id="SelectPerimeter" on:click={GroupClick} size="1x" icon={faBullseye} style="color:red;" />
    </a>
    <a href="#">
      {#if typeof treeItem.open === "undefined" || treeItem.open === true}
        <Fa id="Minimize" on:click={(event) => Minimize(event, treeItem)} size="1x" icon={faCompressArrowsAlt} style="color:yellow;" />
      {:else}
        <Fa id="Minimize" on:click={(event) => Minimize(event, treeItem)} size="1x" icon={faExpandAlt} style="color:yellow;" />
      {/if}
    </a>
    <a href="#">
      <Fa id="NameChangeMenu" on:click={(event) => NameChangeMenu(event, treeItem)} size="1x" icon={faFont} style="color:yellow;" />
    </a>
    <a href="#">
      <!-- <Fa id="EditBlockMenu" on:click={(event) => EditBlockMenu(event, treeItem)} size="1x" icon={faPencilAlt} style="color:yellow;" /> -->
      <span style=" cursor: pointer;" on:click={(event) => EditCodeBlock(event, treeItem)}><Fa icon={faPencilAlt} style="color:orange;" /> </span>
    </a>
  </div>

  {#if treeItem.id !== "generated"}
    <div class="cardButtons">
      <!-- <button id="MoveToPocket"  on:click={closeHandler}><Fa size="1x" icon={faTrashRestore} style="color:red; padding-right: 4px; float:right" /></button> -->
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
      <button id="HideBlock" on:mousedown={(event) => HideBlock(event, treeItem)}>
        <Fa size="1x" icon={faEyeSlash} style="color:black; padding-right: 4px; float:right" />
      </button>
    </div>
  {:else}
    <div class="generatedHeader">
      <h2 style="color:blue">Grab to generate</h2>
    </div>
  {/if}

  {treeItem.type === "outline" ? treeItem.name.substring(0, 25) : treeItem.name}
</main>
<style>
  * {
    user-select: none;
  }
  .card {
    /* padding: 5px; */
    user-select: none;
    cursor: grab;
    /* width: 50px;
  height: 50px; */

    display: flex;

    flex-direction: column;
    color: black;
    font-weight: bold;
    border: 0;
    padding-bottom:10px;
    text-align: center;

  }

  .cardButtons {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 10px;
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

  .generatedHeader {
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

  .tooltip .tooltiptext {
    visibility: hidden;
    width: 20px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    top: -25px;
    font-size: 0.4rem;
    /* left: -5px; */
    z-index: 1;
  }

  .DisplayNone {
    display:none;
  }

  /* 
  body {
    background-color: #eedddd;
    padding: 0px;
    margin: 0px;
    overflow: hidden;
  } */

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
    background-color: #3794ff00;
    height: 100px;
    width: 100px;
    transform: scale(0);
    border-radius: 50%;
    border-style: double;
    border-color: #3794ff;
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
    top: 0px;
    left: 38px;
  }

  a:nth-child(2) {
    top: 14px;
    left: 68px;
  }

  a:nth-child(3) {
    top: 54px;
    left: 72px;
  }

  a:nth-child(4) {
    top: 72px;
    left: 41px;
  }

  a:nth-child(5) {
    top: 58px;
    left: 10px;
  }

  a:nth-child(6) {
    top: 19px;
    left: 7px;
  }

  a:hover {
    color: #c87f8a;
  }
</style>
