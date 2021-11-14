<script lang="ts">
  import { debug, editItem, editMode, items, codeMap } from "../store";
  import Fa from "svelte-fa";
  import { faTag, faFont } from "@fortawesome/free-solid-svg-icons";
  import Shared from "./Shared.svelte";
  import "vanilla-colorful";
  import ColorPicker from "./ColorPicker.svelte";

  let common: Shared;

  let color = "#1e88e5";

  // function handleColorChanged(event:any) {
  //   color = event.detail.value;
  //   $editItem.color = color;
  // }

  export const SaveCodeFromEdit = (latesCode: string) => {
    let existingBlock = $items?.customSnippets?.find((x) => x?.id === $editItem?.id);
    let existingCodeMapBlock = $codeMap.flatTree?.find((x) => x?.id === $editItem?.id);

    console.log(latesCode);

    if (existingCodeMapBlock)
    {
      existingCodeMapBlock.code = latesCode;
      existingCodeMapBlock.name = $editItem.name;
      existingCodeMapBlock.language = $editItem.language;
      existingCodeMapBlock.color = $editItem.color;
      existingCodeMapBlock.tags = $editItem.tags;
      existingCodeMapBlock.placeholders = $editItem.placeholders;

      const index = $codeMap?.flatTree?.indexOf(existingCodeMapBlock);
      $codeMap.flatTree.splice(index, 1, existingCodeMapBlock);
      // $codeMap.flatTree = [$editItem, ...$codeMap.flatTree];
      InfoMessage("Saved codemap changes to: " + existingCodeMapBlock.name);
    }
    else if (existingBlock) {
      existingBlock.code = latesCode;
      const index = $items?.customSnippets.indexOf(existingBlock);
      $items.customSnippets.splice(index, 1);
      $items.customSnippets = [$editItem, ...$items.customSnippets];
      InfoMessage("Saved changes to ." + existingBlock.name);
    } else {
      $editItem.code = latesCode;
      $items.customSnippets = [$editItem, ...$items.customSnippets];
      InfoMessage("Added new codeblock.");
    }
  }

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

  function CreateTabStopCall() {
    tsvscode.postMessage({
      type: "createTabStop",
      value: $editItem,
    });
  }


  export const CreateTabStop = (placeholderValue: string) => {
    let item = $editItem;
    var lastNumber = CheckExistingPlaceholders(item);
    if (lastNumber === -1) {
      item.placeholders = [];
      lastNumber = 1;
    } else {
      lastNumber = ++lastNumber;
    }

    var selectedString = placeholderValue;

    if (selectedString === "") {
      return;
    }

    if ($debug) {
      console.log(selectedString);
      console.log(item.code);
    }

    var newCode = item.code.replaceAll(selectedString, "${" + lastNumber + ":" + selectedString + "}");
    // item.placeholders.push(selectedString);

    let newPlaceholder = $editItem.placeholders;
    newPlaceholder.push(selectedString.toString());
    let newItem = $editItem;

    newItem.placeholders = newPlaceholder;
    newItem.code = newCode;

    $editItem = { ...newItem };
    if ($debug) {
      console.log("New placeholder on new item.");
      console.log($editItem);
    }

    UpdateCodeWithNewTabStop();
  }

  function CheckExistingPlaceholders(item: item) {
    if (item.placeholders === null || typeof item.placeholders === "undefined" || item.placeholders.length === 0) {
      if ($debug) console.log("no placeholders");
      return -1;
    } else {
      if ($debug) console.log("Placeholders:" + item.placeholders.length);
      return item.placeholders.length;
    }
  }

  function UpdateCodeWithNewTabStop() {
    tsvscode.postMessage({
      type: "UpdateCodeWithNewTabStop",
      value: $editItem.code,
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
</script>

<main>
  <Shared bind:this={common} />
  <div>
    {#if common}
      <div style="display:flex" class="inputStyle colorInput ">
        <!-- <Fa icon={faTint} style="color:yellow; padding-right: 4px;  " /> -->
        <input
          type="text"
          id={common.getNonce()}
          style="float:left;"
          value={$editItem.language}
          class=""
          placeholder="programming language"
          on:change={(event) => common.ChangeLanguage(event)}
        />
      </div>

      <div style="display:flex" class="inputStyle colorInput ">
        <ColorPicker currentBlock={undefined} color={$editItem.color} />
        <!-- <Fa icon={faTint} style="color:{$editItem.color}; padding-right: 4px;  " /> -->
        <input
          type="text"
          id={common.getNonce()}
          style="float:left;"
          value={$editItem.color}
          class=""
          placeholder="red"
          on:change={(event) => common.changeColor(event, $editItem, true)}
        />
      </div>

      <div style="display:flex" class="inputStyle tagInput ">
        <Fa icon={faTag} style="color:#007acc; padding-right: 4px;" />
        <input
          type="text"
          id={common.getNonce()}
          style="float:left;"
          value={$editItem.tags}
          placeholder="tag1, tag2"
          on:change={(event) => common.changeTags(event, $editItem, true)}
        />
      </div>
    {/if}

    <div style="display:flex" class="inputStyle show">
      <Fa icon={faFont} style="color:{$editItem.color}; padding-right: 4px;" />
      <input type="text" bind:value={$editItem.name} on:change={() => common.changedName($editItem, true)} />
    </div>
  </div>
  <div>
    <button on:click={() => CreateTabStopCall()}>Selection to tabstop </button>

    {#if $editItem.placeholders !== null && typeof $editItem.placeholders !== "undefined" && $editItem.placeholders.length > 0}
      <h3>TabStops</h3>
      {#each $editItem.placeholders as placeholder}
        <input type="text" bind:value={placeholder} on:change={(event) => OnPlaceHolderChange(event, placeholder.toString())} />
      {/each}
    {/if}
  </div>

  <div>
    <button
      on:click={() => {
        $items.settings.currentPanel = "codeBlocks";
        $editItem = { ...$editItem, placeholders: [] };
        CloseEditWindow();
      }}>Cancel</button
    >
    {#if $editMode.importType === "vsSnippet"}
      <button
        on:click={() => {
          $items.settings.currentPanel = "codeBlocks";
          ConvertSnippetToBlock();
          CloseEditWindow();
        }}>Convert Snippet To Block</button
      >
    {:else}
      <button
        on:click={() => {
          $items.settings.currentPanel = "codeBlocks";
          GetCodeFromEditScreenAndSave();
          CloseEditWindow();
        }}>Save Code Block</button
      >
    {/if}
  </div>
</main>

<style>
  output {
    display: block;
    margin-top: 10px;
    font-size: 1.25rem;
    text-align: center;
  }
</style>
