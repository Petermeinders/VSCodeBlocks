<script lang="ts">
  import { debug, editItem, editMode, items } from "../store";
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
    <div>
      <h2>Outline Blocks Visibility</h2>
      {#each $items.settings.visibleOutlineBlocks as {name, checked}}
        <input type=checkbox  bind:checked={checked}/>  {name}
      {/each}
    </div>
  </div>
  <div>
    <button class="tooltip" on:click={SaveSettings}>Save<span class="tooltiptext">Export JSON Code to chosen file. </span> </button>
  </div>
  <!-- <div>
    {#if common}
      <div style="display:flex" class="inputStyle colorInput ">
        <input type="text" id={common.getNonce()} style="float:left;" value={$editItem.language} class="" placeholder="programming language" on:change={(event) => common.ChangeLanguage(event)} />
      </div>

      <div style="display:flex" class="inputStyle colorInput ">
        <Fa icon={faTint} style="color:yellow; padding-right: 4px;  " />
        <input type="text" id={common.getNonce()} style="float:left;" value={$editItem.color} class="" placeholder="red" on:change={(event) => common.changeColor(event, $editItem, true)} />
      </div>

      <div style="display:flex" class="inputStyle tagInput ">
        <Fa icon={faTag} style="color:#007acc; padding-right: 4px;" />
        <input type="text" id={common.getNonce()} style="float:left;" value={$editItem.tags} placeholder="tag1, tag2" on:change={(event) => common.changeTags(event, $editItem, true)} />
      </div>
    {/if}

    <div style="display:flex" class="inputStyle show">
      <Fa icon={faFont} style="color:{$editItem.color}; padding-right: 4px;" />
      <input type="text" bind:value={$editItem.name} on:change={() => common.changedName($editItem, true)} />
    </div>
  </div>
  <div>
    <button on:click={() => CreateTabStop()}>Selection to tabstop </button>

    {#if $editItem.placeholders !== null && typeof $editItem.placeholders !== "undefined" && $editItem.placeholders.length > 0}
      <h3>TabStops</h3>
      {#each $editItem.placeholders as placeholder}
        <input type="text" bind:value={placeholder} on:change={(event) => OnPlaceHolderChange(event, placeholder.toString())} />
      {/each}
    {/if}
  </div> -->

  <div>
    <button
      on:click={() => {
        $editMode.state = "false";
        $editItem = { ...$editItem, placeholders: [] };
        CloseEditWindow();
      }}>Cancel</button
    >
    {#if $editMode.importType === "vsSnippet"}
      <button
        on:click={() => {
          $editMode.state = "false";
          ConvertSnippetToBlock();
          CloseEditWindow();
        }}>Convert Snippet To Block</button
      >
    {:else}
      <button
        on:click={() => {
          $editMode.state = "false";
          GetCodeFromEditScreenAndSave();
          CloseEditWindow();
        }}>Save Code Block</button
      >
    {/if}
  </div>

  <!-- <div>
    <button
    on:click={() => {
      $editMode.state = "false";
    }}>go back</button
  >
  </div> -->
</main>

<style>

</style>
