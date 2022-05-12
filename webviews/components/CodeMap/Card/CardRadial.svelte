<script lang="ts">
  import {codeMap, editItem, currentlySelected } from "../../../store";
  import type { FilteredTree } from "../../../../src/Models";
  import Fa from "svelte-fa";
  import {
    faBullseye,
    faCompressArrowsAlt,
    faExpandAlt,
    faFont,
    faObjectGroup,
    faPencilAlt,
    faStar as solidStar,
  } from "@fortawesome/free-solid-svg-icons";
  import { faStar } from "@fortawesome/free-regular-svg-icons";
  import {} from "os";
  import Shared from "../../Shared.svelte";
import { onMount } from "svelte";

  export let closeHandler = () => {};
  export let GroupBlocks = (event: MouseEvent) => {};
  export let Minimize = (event: any, treeItem: FilteredTree) => {};

  let common:Shared;

  export let treeItem: FilteredTree; //= $codeMap?.activeWindow?.activelySelectedBlocks[0]
  
  // $codeMap?.activeWindow?.activelySelectedBlocks?.length > 0 ? $codeMap?.activeWindow?.activelySelectedBlocks[0] : {
  //   id: "",
  //   path: "",
  //   name: "",
  //   size: 0,
  //   type: "",
  //   color: "",
  //   tags: [],
  //   placeholders: [],
  //   code: "",
  //   language: "",
  //   visible: false,
  //   open: false,
  //   parentId: "",
  //   outputx: 0,
  //   outputy: 0,
  //   inputx: 0,
  //   inputy: 0,
  //   children: [],
  //   extension: "",
  //   locationX: "",
  //   locationY: "",
  //   startLine: "",
  //   startCharacter: "",
  //   endLine: "",
  //   endCharacter: "",
  //   starred: false,
  //   linkedTargetBlocks: [],
  //   codeDiff: false,
  //   sibling: null, 
  //   image: null, 
  //   imageHeight: null, 
  //   imageWidth: null, 
  //   parentOrChildId: null
  // };

  // Not ready features check this;
  let disabled = true;

  //"A" icon action to activate VSCode's simple text field editor
  function NameChangeMenu(e: any) {
    if ($currentlySelected.length > 0)
    {
      tsvscode.postMessage({
        type: "changeNameMenu",
        value: $currentlySelected[0],
      });

      $currentlySelected = [];
    }
    common.expand(e);
  }

  //Needs to be cleaned up and refactored
  function EditCodeBlock(event: any, treeItem: FilteredTree) {
    $codeMap.flatTree.forEach((block) => {
      if (treeItem.path === block.path && typeof block.path !== "undefined") {
        treeItem.language = block.language;
      }
      common.expand(event);
    });

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

  function PasteImage(){
    console.log("PageImage");

    // tsvscode.postMessage({
    //   type: "pasteImage",
    //   value: treeItem,
    // });
  }

</script>

<Shared bind:this={common} />
{#if treeItem}

  <div class="menu" id="menu">
  <a href="#">
    {#if typeof treeItem.starred === "undefined" || treeItem.starred === false}
      <Fa id="Star" on:click={() => common.StarClicked(treeItem)} size="1x" icon={faStar} />
    {:else}
      <Fa id="Star" on:click={() => common.StarClicked(treeItem)}  size="1x" icon={solidStar} />
    {/if}
  </a>

  <a href="#" class="tooltip">
    <span style=" cursor: pointer;" on:click={(event) => GroupBlocks(event)}>
      <Fa id="GroupBlocks" size="1x" icon={faObjectGroup} style="color:#b30505"   /></span
    >
    <span class="tooltiptext">Group</span>
  </a>

  {#if disabled === false}
  <a href="#">
    <span style=" cursor: pointer;" on:click={(event) => PasteImage()}>
      <Fa size="1x" icon={faBullseye} class="greyedOut"/>
    </span>
  </a>
  {/if}

  {#if disabled === false}
  <a href="#" class="disabled">
    {#if typeof treeItem.open === "undefined" || treeItem.open === true}
      <Fa id="Minimize" on:click={(event) => Minimize(event, treeItem)} size="1x" icon={faCompressArrowsAlt} class="greyedOut" />
    {:else}
      <Fa id="Minimize" on:click={(event) => Minimize(event, treeItem)} size="1x" icon={faExpandAlt} class="greyedOut" />
    {/if}
  </a>
  {/if}

  <a href="#" on:click={(event) => NameChangeMenu(event)}>
    <Fa id="NameChangeMenu" size="1x" icon={faFont} style="color:yellow;" />
  </a>

  <a href="#">
      <span style=" cursor: pointer;" on:click={(event) => EditCodeBlock(event, treeItem)}><Fa icon={faPencilAlt} style="color:orange;" /> </span>
  </a>
</div>
{/if}


<style>
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
    background-color: #000000b3 !important;
    height: 100px;
    width: 100px;
    transform: scale(0);
    border-radius: 50%;
    border-style: double;
    border-color: #3794ff;
    position: absolute;
    margin: auto;
    top: 0px;
    left: 0px;
    z-index: 50;
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

  .greyedOut {
    opacity: 0.5;
    color:grey !important;
  }

  .disabled {
  color: #8f8f8f !important;
  cursor: default;
}
</style>
