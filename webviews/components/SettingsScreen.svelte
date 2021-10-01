<script lang="ts">
  import { codeMap, debug, editItem, editMode, items } from "../store";
  import Fa from "svelte-fa";
  import { faTint, faTag, faFont, faPlusCircle, faPencilAlt, faTimesCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
  import Common from "./Common.svelte";

  let common: Common;

  function UpdateCodeOnPlaceHolderChange() {
    tsvscode.postMessage({
      type: "UpdateCodeOnPlaceHolderChange",
      value: $editItem.code,
    });
  }

  function OnPlaceHolderChange(e: any, placeholder: string) {
    let prevValue = placeholder; //e.target.getAttribute('data-prev');
    let currentVal = e.target.value;

    var indexValue = $editItem.placeholders.indexOf(currentVal);

    indexValue = ++indexValue;

    if (currentVal === "") {
      var newCode = $editItem.code.replaceAll("${" + indexValue + ":" + prevValue + "}", prevValue);
      let index = indexValue - 1;
      $editItem.placeholders.splice(index, 1);
    } else {
      var newCode = $editItem.code.replaceAll("${" + indexValue + ":" + prevValue + "}", "${" + indexValue + ":" + currentVal + "}");
    }
    let newItem = $editItem;
    newItem.code = newCode;
    $editItem = { ...newItem };
    UpdateCodeOnPlaceHolderChange();
  }

  function CreateTabStop() {
    tsvscode.postMessage({
      type: "createTabStop",
      value: $editItem,
    });
  }

  // function ShowSidebar() {
  //   if ($debug) console.log("Sidebar mode");
  //   tsvscode.postMessage({
  //     type: "showSidebar",
  //     value: $items,
  //   });
  // }

  function InfoMessage(message: any) {
    tsvscode.postMessage({
      type: "onInfo",
      value: message,
    });
  }

  function CloseEditWindow() {
    tsvscode.postMessage({
      type: "closeEditWindow",
      value: $editMode,
    });
    InfoMessage("Edit Mode ended.");
  }

  function GetCodeFromEditScreenAndSave() {
    tsvscode.postMessage({
      type: "GetCodeFromEditScreen",
      value: $editMode,
    });
  }

  function ConvertSnippetToBlock() {
    tsvscode.postMessage({
      type: "ConvertSnippetToBlock",
      value: $editMode,
    });
  }

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
  <Common bind:this={common} />
  <div>
    <div class="settingsContainer">
      <h2>Outline Blocks Visibility</h2>
      {#each $items.settings.visibleOutlineBlocks as {name, checked}}
        <input type=checkbox  bind:checked={checked}/>  {name}
      {/each}
    </div>
  </div>
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
  <div class="settingsContainer">
    <h2>Debug Enabled?</h2>
    <input type=checkbox  bind:checked={$debug}/>  Debug
  </div> 
  <div class="settingsContainer">
    <h2>CodeMap</h2>
    <div class="subContainer">
      Save project location
      <input type=textbox  bind:value={$items.settings.codeMapSaveLocationRelative}/>  
    </div>
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
}
</style>
