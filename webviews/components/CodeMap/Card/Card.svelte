<script lang="ts">
  import { flatTree, currentZoom, perimeterItem, codeMap, editItem, rightClickedBlockEvent, items } from "../../../store";
  import type { FilteredTree } from '../../../../src/Models';
  import lodash, { flatten } from "lodash";
  import deepdash from "deepdash";
  import { onMount } from "svelte";
  import RadialMenu from "../Card/CardRadial.svelte";
  import {} from "os";
  import CardMenu from "../Card/CardMenu.svelte";


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

  // let buttonsDisplay = $items.settings.alwaysShowCodeBlockButtons ? 'display:flex;' : "display:none;";


  // function ColorChange(currentBlock, color:string){
  //   currentBlock.color
  // }


  //

  // onMount(async () => {});


  //Expand or collapse radial menu
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

  document.body.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    console.log("ITWORKED2!");
  });

  //Double Clicking block opens file and takes you to the line
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

  // function handleMouseOver(e:any) {
	// 	buttonsDisplay = 'display:flex;';
	// }
	// function handleMouseOut(e:any) {
  //   if (!$items.settings.alwaysShowCodeBlockButtons){
  //     buttonsDisplay = 'display:none;';
  //   }
	// }
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
  class="card absolute highlight {treeItem.type === 'directory' ? 'directory' : 'file'}">

  <RadialMenu treeItem={treeItem} {StarClicked}  {GroupBlocks} />

  {#if treeItem.id !== "generated"}
   <CardMenu treeItem={treeItem} {StarClicked} {Minimize} {StartLink}/>
  {:else if treeItem.name !== ""}
    <div class="generatedHeader">
      <h2 style="color:white">Grab to create block</h2>
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
    color: white;
    font-weight: bold;
    border: 0;
    padding-bottom:10px;
    text-align: center;

  }

  .absolute {
    position: absolute;
  }

  .ds-selected {
    outline: 3px solid red;
    outline-offset: 3px;
    color: #dedede;
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

 
</style>
