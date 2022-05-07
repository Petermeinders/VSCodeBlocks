<script lang="ts">
  import { codeMap, debug, editItem, editMode, items } from "../store";
  import Fa from "svelte-fa";
  import { faTint, faTag, faFont, faPlusCircle, faPencilAlt, faTimesCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
  import Shared from "./Shared.svelte";

  let common: Shared;
  let disabled = true;

  function SaveSettings() {
    if ($debug) {
      console.log("Export Data Start!");
      console.log($items);
    }

    tsvscode.postMessage({
      type: "saveData",
      value: $items,
    });
  }
</script>

<main>
  <Shared bind:this={common} />
  <div>
    <div class="settingsContainer">
      <h2>Debug Enabled?</h2>
      <input type=checkbox  bind:checked={$debug}/>  Debug
    </div> 

    {#if !disabled}

    <div class="settingsContainer">
      <h2>Outline Blocks Visibility</h2>
      {#each $items.settings.visibleOutlineBlocks as {name, checked}}
        <input type="checkbox"  bind:checked={checked}/> <span> {name}</span>
      {/each}
    </div>

    {/if}
  </div>
  {#if !disabled}
  <div class="settingsContainer">
    <h2>CodeBlocks Settings</h2>
    <div class="subContainer" style="display:flex;">
      <input type=checkbox bind:checked={$items.settings.hideBlocksBar}/>  Hide CodeBlocks
    </div>
    Save location
    <input type=textbox  bind:value={$items.settings.codeBlocksSaveLocation}/>  
    Save backup location
    <input type=textbox  bind:value={$items.settings.codeBlocksSaveLocationBackup}/>  
  </div> 
  {/if}
  <div class="settingsContainer">
    <h2>CodeMap</h2>
    <div class="subContainer">
      Save project location
      <input type=textbox  bind:value={$items.settings.codeMapSaveLocationRelative}/>  
    </div>

    {#if !disabled}

    <!-- <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.defaultBlockColor}/>Default block color
    </div> -->
    <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.randomizeNewBlockColors}/>Randomize new block colors
    </div>
    <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.colorCodetoMatchCodeBlocks}/>Color code to match CodeBlocks
    </div>
    <!-- <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.alwaysShowCodeBlockButtons}/> Always show buttons on codeBlocks
    </div> -->
    <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.strictCodeMapOutlineWordMatch}/>  Strict CodeMap Outline Word Match?
    </div>
    <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.mapEntireProject}/>Auto Map Entire Project? (WARNING: large save file and slower load times)
    </div>
    <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.showFolders}/> Show Folders
    </div>
    <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.showFiles}/> Show Files
    </div>
    <div class="subContainer">
      <input type=checkbox bind:checked={$items.settings.showDefaultRelationship}/> Show Default Relationship (lines)
    </div>
    <div class="subContainer">
      <b>Pipe deliminaed folder exclusion (recursive) (regex escape characters)</b>
      <textarea bind:value={$items.settings.codeMapFolderExclusion}></textarea>
    </div>
    {/if}
  </div> 

  <div>
    <button class="tooltip" on:click={SaveSettings}>Save<span class="tooltiptext">Export JSON Code to chosen file. </span> </button>
  </div>
 
</main>

<style>
.settingsContainer {
margin-bottom:20px;
}

.subContainer {
margin-bottom:10px;
display: flex !important;
}
</style>
