<script lang="ts">
  import { afterUpdate, beforeUpdate, onMount, tick } from "svelte";
  import { Type } from "../../../../src/Models";
  import type { Group } from "../../../../src/Models";
  import type { FilteredTree } from "../../../../src/Models";
  import RadialMenu from "../Card/CardRadial.svelte";
  import CardMenu from "../Card/CardMenu.svelte";
  import { Sibling } from "../../../../src/Models";
  import Selecto from "svelte-selecto";
  import Shared from "../../Shared.svelte";
  import Moveable from "svelte-moveable";
  import { zoom, codeMap, rightClickedBlockEvent, moveAbles, flatTree, debug } from "../../../store";

  let common: Shared;
  let target;

  //Exported to parent
  export let moveable: Moveable;
  export let selecto: Selecto;
  export let treeItem: FilteredTree;
  export let GroupBlocks = (event: MouseEvent) => {};
  export let Minimize = (event: any, treeItem: FilteredTree) => {};
  export let StartLink = (event: any, treeItem: FilteredTree) => {};

  $: {
    $zoom, onzoomChange();
  }

  onMount(async () => {});

  //Stupid hack to get the border of the card (Movable) to change to fit the object after the zoom has finished.
  async function onzoomChange() {
    if (selecto) {
      var element = selecto.getInstance(); //document.getElementById(id);
      // set width on element
      if (element && element?.selectedTargets.length > 0) {
        //This forces a rerender of the lines on selected items. Nothing else seems to work (tried Tick(), After, Before, etc)
        setTimeout(() => ShowBorderAfterMove(), 50);
        setTimeout(() => (element.selectedTargets[0].style.width = (+selecto.getInstance().selectedTargets[0].offsetWidth + 1).toString() + "px"), 0);
        setTimeout(
          () => (element.selectedTargets[0].style.width = (+selecto.getInstance().selectedTargets[0].offsetWidth - 1).toString() + "px"),
          40
        );
      }
    }

    if ($debug) {
      console.log(selecto?.getInstance().boundContainer);
      console.log(selecto?.getInstance().options.checkInput);
    }

    console.log("onZoomchange");
  }

  function ShowBorderAfterMove() {
    if (selecto) {
      selecto.selectableTargets = document.querySelectorAll(".selecto-area .cube");
      console.log(selecto?.selectableTargets);
      document.querySelector(".moveable-control-box").style.display = "block";
    }
  }

  //Card ----------------------------------------------------------------------------------------------------------------------

  //Double Clicking block opens file and takes you to the line
  function dbClickBlock(item: FilteredTree) {
    let dbClickValues: FilteredTree = {
      id: "",
      path: "",
      name: "",
      size: 0,
      type: Type.Custom,
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


  //Copy Paste?
  document.onpaste = function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    console.log(JSON.stringify(items)); // might give you mime types
    for (var index in items) {
      var item = items[index];
      if (item.kind === "file") {
        var blob = item.getAsFile();
        var reader = new FileReader();
        reader.onload = function (event) {
          console.log(event.target.result); // data url!
          $codeMap.activeWindow.activelySelectedBlocks.forEach((block) => {
            block.image = event?.target?.result ?? "";
          });
        };
        reader.readAsDataURL(blob);
      }
    }
  };
</script>

<!-- Import shared doc -->
<Shared bind:this={common} />

<main
  id={treeItem.id}
  class="single-block cube"
  style="background:#2c39575c; z-index:10; min-width:161px; min-height: 65px; position:absolute; {'width:' + treeItem.imageWidth + 'px;'} {'height:' +
    treeItem.imageHeight +
    'px;'} {treeItem.locationX !== '0' && treeItem.locationY !== '0'
    ? 'transform: translate(' + treeItem.locationX + 'px' + ',' + treeItem.locationY + 'px);'
    : ''}"
>
  <div
    bind:this={target}
    on:dblclick={() => dbClickBlock(treeItem)}
    on:contextmenu={(event) => common.expand(event)}
    style="height:100%;"
    id={treeItem.id}
    data-fileType={treeItem.type}
    data-parentId={treeItem.parentId}
    class="card absolute  highlight BlockImage {treeItem.type === Type.Folder ? 'directory' : 'file'}"
  >
    <!-- GENERATED -->
    {#if treeItem.sibling === Sibling.Self || treeItem.sibling === undefined}
      {#if treeItem.id !== "generated"}
        <CardMenu {treeItem} {Minimize} {StartLink} />
      {:else if treeItem.name !== ""}
        <div class="generatedHeader">
          <h2 style="color:white">Grab to create block</h2>
        </div>
      {/if}
      <!-- Not used at the moment -->
    {:else if treeItem.sibling === Sibling.Parent}
      <!-- Generated Sibling -->
      <div class="generatedHeader">
        <h2 style="color:white">Generated Parent</h2>
      </div>
    {/if}

    <!-- Display image if image pasted in, else show text -->
    {#if treeItem?.image === "" || typeof treeItem?.image === "undefined"}
      <div>
        {treeItem.type === Type.Custom ? treeItem.name.substring(0, 25) : treeItem.name}
      </div>
    {:else}
      <div
        style="background-image:{treeItem?.image !== '' && typeof treeItem?.image !== 'undefined'
          ? 'url(' + treeItem.image + ')'
          : treeItem.color ?? 'black'}; 
    z-index:101; background-repeat: no-repeat !important; background-size:contain !important; min-height:20px; height:calc(100% - 40px)"
      />
    {/if}
  </div>
</main>

<style>
  :global(.moveable2) {
    border: 1px solid red;
  }
</style>
