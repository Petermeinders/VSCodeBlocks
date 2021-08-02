<script lang="ts">
  import {editItem } from "../store";
  import Fa from "svelte-fa";
  import { faTint, faTag, faFont, faPlusCircle, faPencilAlt, faTimesCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
  import Common from './Common.svelte';

  let common: Common;

  function UpdateCodeOnPlaceHolderChange() {
    tsvscode.postMessage({
      type: "UpdateCodeOnPlaceHolderChange",
      value: $editItem.code,
    });
  }

  function OnPlaceHolderChange(e, placeholder: string) {
    let prevValue = placeholder; //e.target.getAttribute('data-prev');
    let currentVal = e.target.value


    var indexValue = $editItem.placeholders.indexOf(currentVal);

    indexValue = ++indexValue;

    if (currentVal === "") {
      var newCode = $editItem.code.replaceAll("${" + indexValue + ":" + prevValue + "}", prevValue);
      let index = indexValue - 1;
      $editItem.placeholders.splice(index,1)
    } else {
      var newCode = $editItem.code.replaceAll("${" + indexValue + ":" + prevValue + "}", "${" + indexValue + ":" + currentVal + "}");
    }
    let newItem = $editItem;
    newItem.code = newCode;
    $editItem = {...newItem};
    UpdateCodeOnPlaceHolderChange();
  }

  function CreateTabStop(){
    tsvscode.postMessage({
      type: "createTabStop",
      value: $editItem,
    });
  }
</script>

<main>
  <Common bind:this="{common}" />
  <div>
    <div style="background: #3c3c3c;     margin-top: 3px; align-items: center; display:flex" class="show">
      <Fa icon={faFont} style="color:{$editItem.color}; padding-right: 4px;" />
      <input type="text" bind:value={$editItem.name} on:change={() => common.changedName($editItem)} />
    </div>
  </div>
  <div>
    <button on:click={(event) => CreateTabStop(event, $editItem)}>Selection to tabstop </button>

    {#if $editItem.placeholders !== null && typeof $editItem.placeholders !== "undefined" && $editItem.placeholders.length > 0}
    <h3>TabStops</h3>
      {#each $editItem.placeholders as placeholder}
     <input type="text" bind:value={placeholder} on:change={(event) => OnPlaceHolderChange(event, placeholder.toString())} />
      {/each}
    {/if}
  </div>
</main>

<style>
    .tooltip {
    position: relative;
    display: inline-block;
    /* border-bottom: 1px dotted black; */
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;

    /* Position the tooltip */
    position: absolute;
    top:-25px;
    left:45px;
    z-index: 1;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }
</style>
