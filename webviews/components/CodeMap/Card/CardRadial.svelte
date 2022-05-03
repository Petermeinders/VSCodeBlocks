<script lang="ts">
  import { flatTree, currentZoom, perimeterItem, codeMap, editItem, rightClickedBlockEvent, items, currentlySelected } from "../../../store";
  import type { FilteredTree } from "../../../../src/Models";
  import deepdash from "deepdash";
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import ColorPicker from "../../ColorPicker.svelte";
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
  import CodeIcons from "../../CodeIcons.svelte";

  export let closeHandler = () => {};
  export let StarClicked = (treeItem: any) => {};
  export let GroupBlocks = (event: MouseEvent) => {};
  export let Minimize = (event: any, treeItem: FilteredTree) => {};

  export let treeItem: FilteredTree = $codeMap?.activeWindow?.activelySelectedBlocks?.length > 0 ? $codeMap?.activeWindow?.activelySelectedBlocks[0] : {
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
    startCharacter: "",
    endLine: "",
    endCharacter: "",
    starred: false,
    linkedTargetBlocks: [],
    codeDiff: false,
  };

  function NameChangeMenu(e: any) {
    if ($currentlySelected.length > 0)
    {
      tsvscode.postMessage({
        type: "changeNameMenu",
        value: $currentlySelected[0],
      });

      $currentlySelected = [];
    }
  }

  // @ts-nocheck
  var i = 0;
  function expand() {
    if (i == 0) {
      document.getElementById("menu").style.transform = "scale(3)";
      document.getElementById("plus").style.transform = "rotate(45deg)";
      i = 1;
    } else {
      document.getElementById("menu").style.transform = "scale(0)";
      document.getElementById("plus").style.transform = "rotate(0deg)";
      i = 0;
    }
  }

  function EditCodeBlock(event: any, treeItem: FilteredTree) {
    $codeMap.flatTree.forEach((block) => {
      if (treeItem.path === block.path && typeof block.path !== "undefined") {
        treeItem.language = block.language;
      }
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

  function GroupButtonClick() {
    console.log("groupclick");
    $perimeterItem = {
      id: treeItem.id,
      parentId: treeItem.parentId,
    };
  }

  function PasteImage(event){
    console.log("PageImage");

    // tsvscode.postMessage({
    //   type: "pasteImage",
    //   value: treeItem,
    // });
  }


</script>

<div class="menu" id="menu">
  <a href="#">
    {#if typeof treeItem.starred === "undefined" || treeItem.starred === false}
      <Fa id="Star" on:click={() => StarClicked(treeItem)} class="greyedOut" size="1x" icon={faStar} />
    {:else}
      <Fa id="Star" on:click={() => StarClicked(treeItem)} class="greyedOut" size="1x" icon={solidStar} />
    {/if}
  </a>
  <a href="#" class="tooltip">
    <span style=" cursor: pointer;" on:click={(event) => GroupBlocks(event)}>
      <Fa id="GroupBlocks" size="1x" icon={faObjectGroup}  /></span
    >
    <span class="tooltiptext">Group</span>
  </a>
  <a href="#">
    <span style=" cursor: pointer;" on:click={(event) => PasteImage(event)}>
      <Fa size="1x" icon={faBullseye} class="greyedOut"/>
    </span>
  </a>
  <a href="#">
    {#if typeof treeItem.open === "undefined" || treeItem.open === true}
      <Fa id="Minimize" on:click={(event) => Minimize(event, treeItem)} size="1x" icon={faCompressArrowsAlt} class="greyedOut" />
    {:else}
      <Fa id="Minimize" on:click={(event) => Minimize(event, treeItem)} size="1x" icon={faExpandAlt} class="greyedOut" />
    {/if}
  </a>
  <a href="#" on:click={(event) => NameChangeMenu(event, treeItem)}>
    <Fa id="NameChangeMenu" size="1x" icon={faFont} style="color:yellow;" />
  </a>
  <a href="#">
    <!-- <Fa id="EditBlockMenu" on:click={(event) => EditBlockMenu(event, treeItem)} size="1x" icon={faPencilAlt} style="color:yellow;" /> -->
    <span style=" cursor: pointer;" on:click={(event) => EditCodeBlock(event, treeItem)}><Fa icon={faPencilAlt} style="color:orange;" /> </span>
  </a>
</div>

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

  .greyedOut {
    opacity: 0.5;
    color:grey !important;
  }
</style>
