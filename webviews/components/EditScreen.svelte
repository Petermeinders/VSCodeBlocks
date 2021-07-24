<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS } from "svelte-dnd-action";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { editMode, items, editItem } from "../store";
  import type { item } from "../store";
  import Fa from "svelte-fa";
  import { faTint, faTag, faFont, faPlusCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
  import { setDebugMode } from "svelte-dnd-action";

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
</script>

<main>
  <div>
    <button on:click={(event) => CreateTabStop(event, $editItem)}>Selection to variable </button>

    {#if $editItem.placeholders !== null && typeof $editItem.placeholders !== "undefined" && $editItem.placeholders.length > 0}
      {#each $editItem.placeholders as placeholder}
        <input type="text" bind:value={placeholder} on:change={(event) => OnPlaceHolderChange(event, placeholder.toString())} />
      {/each}
    {/if}
  </div>
</main>

<style>
</style>
