<script lang="ts">
    import { flatTree, currentZoom, perimeterItem, codeMap, editItem, rightClickedBlockEvent, items, blockContainerStore } from "../../../store";
    import type {BlockContainerInterface } from '../../../../src/Models';
    import  {Type } from '../../../../src/Models';
    import lodash, { flatten } from "lodash";
    import deepdash from "deepdash";
    import { afterUpdate, onMount } from "svelte";
    import RadialMenu from "../Card/CardRadial.svelte";
    import CardMenu from "../Card/CardMenu.svelte";
  
    const _ = deepdash(lodash);
    export let left = 30;
    export let top = 30;
    export let width = 200;
    export let height = 200;
    export let card;
    let z = -99;
    export let blockContainer: BlockContainerInterface;

  //   afterUpdate(() => {
  //     let z = -99;
  // });
  

  const GetCardSpawnLocationX = (blockContainer: BlockContainerInterface) => {
        return blockContainer.locationX;
  }

  const GetCardSpawnLocationY = (blockContainer: BlockContainerInterface) => {
      return blockContainer.locationY;
  }

  </script>
  
  
  
  
  <div class="ds-selected ds-hover absolute" style="display:none" />
  
  <main class="card absolute highlight BlockImage Container" style="display: flex;">
    <div class="generatedHeader Container">
      <h2 style="color:white" class="Container">Container</h2>
  </div>
    <div  
    style="
      background: transparent; 
      border: #00ff89;
      border-width: 2px;
      border-style: dashed;
      z-index:{z} !important; width:{width}px; height:{height}px;
      {blockContainer.locationX !== 0 && blockContainer.locationY !== 0 ? 'left:' + GetCardSpawnLocationX(blockContainer) + "px" + '; ' + 'top:' + GetCardSpawnLocationY(blockContainer) + "px" + ";": ''}"
      data-fileType={Type.Container}
      id={blockContainer.id}
    >

  </div>
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
      /* z-index: 102 !important; */
    }
  
    .DisplayNone {
      display:none;
    }
  
    .BlockImage {
     background-size: contain !important;
     background-position-y: 30px  !important;
     background-repeat: no-repeat !important;
     min-height: 70px;
    }
  
    /* 
    body {
      background-color: #eedddd;
      padding: 0px;
      margin: 0px;
      overflow: hidden;
    } */
  
   
  </style>
  