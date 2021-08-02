<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS } from "svelte-dnd-action";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { debug, editMode, items } from "../store";
  import type { item } from "../store";
  import Common from './Common.svelte';
  import Fa from "svelte-fa";
  import { faTint, faTag, faFont, faPlusCircle, faPencilAlt, faTimesCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
  import { setDebugMode } from "svelte-dnd-action";
  import type { Item } from "../../src/Models";
  import levenshtein from "fast-levenshtein";

  export let SearchTerm: string;
  export let FullCodeSearch: boolean;

  let common: Common;

  $: {
    SearchTerm;
    if ($debug) console.log("Search Changed: " + SearchTerm);
    searchCode(SearchTerm, FullCodeSearch);
  }

  $: {
    $editMode;
    EditModeChange();
  }

  function EditModeChange() {
    if ($debug) console.log("mode was edited: " + $editMode.id + ", " + $editMode.state);
    if ($editMode.state === "true") {
      // document.getElementById($editMode.id)?.querySelector(".codeblock")?.classList.add("editMode");
      // document.getElementById("editTextHeader").classList.remove('hide');
      // document.getElementById($editMode.id)?.querySelector(".editText")?.classList.remove("hide");
    } else {
      //set element mode to false;
    }
  }

  function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  let shouldIgnoreDndEvents = false;
  const flipDurationMs = 300;
  function handleDndConsider(e: any) {
    //$items.customSnippets = e.detail.items;

    // if (e.detail.info.trigger === "draggedEntered") {
    //   if ($debug)
    //   console.log("dragEntered!");
    // }

    //console.warn(`got consider ${JSON.stringify(e.detail, null, 2)}`);
    const { trigger, id } = e.detail.info;
    if (trigger === TRIGGERS.DRAG_STARTED) {
      // console.warn(`copying ${id}`);
      const idx = $items.customSnippets.findIndex((item) => item.id === id);
      const newId = `${id}_copy_${Math.round(Math.random() * 100000)}`;
      // the line below was added in order to be compatible with version svelte-dnd-action 0.7.4 and above
      e.detail.items = e.detail.items.filter((item) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
      e.detail.items.splice(idx, 0, { ...$items.customSnippets[idx], id: newId, tempId: id });
      $items.customSnippets = e.detail.items;
      shouldIgnoreDndEvents = true;
    } else if (!shouldIgnoreDndEvents) {
      $items.customSnippets = e.detail.items;
    } else {
      $items.customSnippets = [...$items.customSnippets];
    }
  }
  function handleDndFinalize(e: any) {
    if (!shouldIgnoreDndEvents) {
      $items.customSnippets = e.detail.items;
    } else {
      let newItems = $items.customSnippets;
      newItems.map((item) => {
        if (item.tempId === e.detail.info.id) {
          item.id = item.tempId;
          item.tempId = "";
          return item;
        } else {
          return item;
        }
      });
      $items.customSnippets = [...newItems];
      shouldIgnoreDndEvents = false;
    }

    // $items.customSnippets = e.detail.items;
    // if (e.detail.info.trigger === "draggedEntered") {
    //   if ($debug)
    //   console.log("dragEntered!");
    // }
  }

  function deleteItem(itemList: any, item: item) {
    if ($debug) console.log($items.customSnippets);

    let itemsLeft = itemList.filter((j: any) => j.id !== item.id);
    $items.customSnippets = [...itemsLeft];
  }

  function deleteCodeLink(item: Item, linkId: string) {
    let newItems = $items.customSnippets;
    let linkedIds = item.linkedBlocks;
    linkedIds.includes(linkId) && linkedIds.splice(linkedIds.indexOf(linkId), 1);
    console.log(linkedIds);
    item.linkedBlocks = linkedIds;
    let itemIndex = $items.customSnippets.indexOf(item);
    newItems.splice(itemIndex, 1, item);
    $items.customSnippets = [...newItems];
    console.log($items.customSnippets);
  }

  

  if ($debug) console.log("thing here!");

  afterUpdate((e: any) => {});

  function returnFirstLine(item: item) {
    const s = item.code.split("\n");
    return s[0];
  }

  function pasteCodeFromBlock(item: item) {
    tsvscode.postMessage({
      type: "insertSnippet",
      value: item.code,
    });
  }

  function onItemDoubleClick(item: item) {
    if ($debug) console.log("double clicked. Future implementation.");
  }

  export function searchCode(e: any, FullCodeSearch: any) {
    let searchString:string;
    if (typeof e === "string") {
      searchString = e;
    } else {
      searchString = e.target.value;
    }

    if ($debug) console.log(searchString);

    let foundArray;
    if (FullCodeSearch) {
      foundArray = $items.customSnippets.filter(
        (item) =>
          item.name.toLowerCase().indexOf(searchString.toLowerCase().trim()) !== -1 ||
          item.id.toLowerCase().indexOf(searchString.toLowerCase().trim()) !== -1 ||
          item?.tags?.findIndex((x) => x?.toLowerCase()?.trim() === searchString?.toLowerCase()?.trim()) !== -1 ||
          FuzzyCheck(item, searchString)
      );
    } else {
      foundArray = $items.customSnippets.filter(
        (item) => item.name.toLowerCase().indexOf(searchString.toLowerCase().trim()) !== -1 || 
        item.id.toLowerCase().indexOf(searchString.toLowerCase().trim()) !== -1 ||
        item.tags.findIndex((x) => x.toLowerCase().trim() === searchString.toLowerCase().trim()) !== -1
      );
    }
    if ($debug) console.log(foundArray);

    $items.customSnippets.map((item) => {
      item.visible = "false";
    });

    let newArray: any = [];
    if (foundArray.length > 0) {
      foundArray.forEach((element) => {
        element.visible = "true";
        let index = $items.customSnippets.indexOf(element);
        $items.customSnippets.splice(index, 1);
        newArray.push(element);
      });

      $items.customSnippets = [...newArray, ...$items.customSnippets];
      // $items.customSnippets = [{ id: element.id, name: element.name, code: element.code }, ...$items.customSnippets];
    } else {
      $items.customSnippets = [...$items.customSnippets];
      if ($debug) console.log("Not found!");
    }

    // const index = $items.customSnippets.indexOf(foundFirst);
    // if (index > -1) {
    //   $items.customSnippets.splice(index, 1);
    //   $items.customSnippets = [{ id: foundFirst.id, name: foundFirst.name, code: foundFirst.code }, ...$items.customSnippets];
    // }
    // else{
    //   console.log("Not found!");
    // }
  }

  function FuzzyCheck(item: Item, searchString: string) {
    // if (item.code.includes(searchString.toLowerCase().trim()) === true){
    //   return true;
    // }
    // else {
    //   return false;
    // }
    // return CodeCompareForEachItem(item, searchString)
    return CodeCompareWholeFile(item, searchString);
  }

  function CodeCompareWholeFile(item: Item, searchString: string) {
    const x = item;
    let found = -1;
    if (searchString === "") {
      return false;
    }

    let CodeBlocks = searchString.split(/\n\s*\n/);

    CodeBlocks.forEach((Block) => {
      let shtein = levenshtein.get(Block, x.code);
      if (shtein < 200) {
        let changeMinusx = Block.length - x.code.length;
        let xMinusChange = x.code.length - Block.length;
        if (Math.abs(changeMinusx) < 100) {
          console.log("Name: " + x.name + ": " + changeMinusx + ": " + xMinusChange + ": " + "Stein: " + shtein);
          found = ++found;

          // return true;
        } else {
          //return false;
        }
      }
    });

    if (found >= 0) {
      x.visible = "true";
      let index = $items.customSnippets.indexOf(x);

      $items.customSnippets.splice(index, 1, x);

      return true;
    } else {
      //return x;
      return false;
    }
  }

  function CodeCompareForEachItem(item: Item, searchString: string) {
    const x = item;
    if (searchString === "") {
      return false;
    }

    let shtein = levenshtein.get(searchString, x.code);
    if (shtein < 100) {
      let changeMinusx = searchString.length - x.code.length;
      let xMinusChange = x.code.length - searchString.length;
      if (Math.abs(changeMinusx) < 50) {
        console.log("Name: " + x.name + ": " + changeMinusx + ": " + xMinusChange + ": " + "Stein: " + shtein);
        //x.visible = "true";
        return true;
      } else {
        // x.visible = "false";
        return false;
      }
    }
    //return x;
    return false;

    $items = { ...$items };
  }

  //TODO: AI detect if block is found based on levenshtein.

  //   function CodeCompare(changedCode){
  //     $items.customSnippets.map(x => {
  //       if(changedCode === "")
  //       {
  // return;
  //       }

  //       let shtein = levenshtein.get(changedCode,x.code);
  //       if (shtein < 100){
  //         let changeMinusx = changedCode.length - x.code.length;
  //         let xMinusChange = x.code.length - changedCode.length;
  //         if(Math.abs(changeMinusx) < 50)
  //         {
  //           console.log(x.name + ": " + changeMinusx + ": " + xMinusChange + ": " + shtein);
  //           x.visible = "true";
  //         }
  //         else{
  //           x.visible = "false";
  //         }

  //       }
  //       return x;
  //     });

  //     $items = {...$items}

  //   }

  function ShowColorPicker(item: item) {
    if ($debug) {
      console.log(item.id);
      console.log(document.getElementById(item.id));
    }

    if (document.getElementById(item.id) === null || item === null) {
      if ($debug) console.log("color picker is null");
      return;
    }

    if (document.getElementById(item.id)?.getElementsByClassName("colorInput")[0].classList.contains("hide")) {
      document.getElementById(item.id)?.getElementsByClassName("colorInput")[0].classList.remove("hide");
      document.getElementById(item.id)?.getElementsByClassName("colorInput")[0].classList.add("show");
    } else {
      document.getElementById(item.id)?.getElementsByClassName("colorInput")[0].classList.add("hide");
      document.getElementById(item.id)?.getElementsByClassName("colorInput")[0].classList.remove("show");
    }

    //TODO: Refactor out JS mess.
    if (document.getElementById(item.id)?.getElementsByClassName("tagInput")[0].classList.contains("show")) {
      document.getElementById(item.id)?.getElementsByClassName("tagInput")[0].classList.add("hide");
      document.getElementById(item.id)?.getElementsByClassName("tagInput")[0].classList.remove("show");
    }
  }

  function changeColor(e: any, item: item) {
    if ($debug) {
      console.log(e);
      console.log(item);
    }
    item.color = e.target.value;
    $items.customSnippets = $items.customSnippets.map((i) => {
      if (i.id === item.id) {
        i.color = item.color;
      }
      return i;
    });
    // document.getElementById(item.id)?.getElementsByClassName('colorInput')[0].classList.toggle('hide')
  }

  function ShowTags(item: item) {
    if ($debug) {
      console.log(item.id);
      console.log(document.getElementById(item.id));
    }

    if (document.getElementById(item.id) === null || item === null) {
      if ($debug) console.log("tags null");
      return;
    }

    if (document.getElementById(item.id)?.getElementsByClassName("tagInput")[0].classList.contains("hide")) {
      document.getElementById(item.id)?.getElementsByClassName("tagInput")[0].classList.remove("hide");
      document.getElementById(item.id)?.getElementsByClassName("tagInput")[0].classList.add("show");
    } else {
      document.getElementById(item.id)?.getElementsByClassName("tagInput")[0].classList.add("hide");
      document.getElementById(item.id)?.getElementsByClassName("tagInput")[0].classList.remove("show");
    }

    //TODO: Refactor out JS mess.
    if (document.getElementById(item.id)?.getElementsByClassName("colorInput")[0].classList.contains("show")) {
      document.getElementById(item.id)?.getElementsByClassName("colorInput")[0].classList.add("hide");
      document.getElementById(item.id)?.getElementsByClassName("colorInput")[0].classList.remove("show");
    }
  }

  function changeTags(e: any, item: item) {
    if ($debug) {
      console.log(e);
      console.log(item);
    }

    $items.customSnippets = $items.customSnippets.map((i) => {
      if (i.id === item.id) {
        var array = e.target.value.split(",");
        i.tags = array;
      } else {
        i = i;
      }
      return i;
    });
    // document.getElementById(item.id)?.getElementsByClassName('tagInput')[0].classList.toggle('hide')
  }

  function EditCodeBlock(item: item) {
    tsvscode.postMessage({
      type: "editCode",
      value: item,
    });
    // document.getElementById(item.id)?.getElementsByClassName('codeblock')[0].classList.toggle('hide');
  }

  function getSelectionText() {
    var text = "",
      startRange = 0,
      endRange = 0;
    if (window.getSelection) {
      text = window.getSelection()?.toString();
      startRange = window.getSelection()?.anchorOffset;
      endRange = window.getSelection()?.focusOffset;
    } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
    }

    return [text, endRange, startRange];
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

  function CreateTabStop(e: any, item: item) {
    var lastNumber = CheckExistingPlaceholders(item);
    if (lastNumber === -1) {
      item.placeholders = [];
      lastNumber = 1;
    } else {
      lastNumber = ++lastNumber;
    }

    var selObj = getSelectionText();
    var selectedString = selObj[0];

    if (selectedString === "") {
      return;
    }

    if ($debug) {
      console.log(selObj[0]);
      console.log(item.code);
    }

    var newCode = item.code.replaceAll(selectedString, "${" + lastNumber + ":" + selectedString + "}");
    // item.placeholders.push(selectedString);

    const tempItems = $items.customSnippets.map((x) => {
      if (x.placeholders === null || typeof x.placeholders === "undefined") return;

      if (x.id === item.id) {
        x.placeholders.push(selectedString.toString());
        x.code = newCode;
        return x;
      } else {
        return x;
      }
    });

    $items.customSnippets = [...tempItems];

    document.getElementById(item.id).getElementsByClassName("codeblock")[0].classList.remove("hide");

    //var selRange = selObj.getRangeAt(0);
    //console.log(selRange.toString());
  }

  // function OnPlaceholderFocus(e, item, placeholder){
  //   // e.target.setAttribute('data-prev', e.target.value);
  //   // console.log("Previous:" + e.target.getAttribute('data-prev'));
  // }

  // function OnPlaceHolderInput(e, item, placeholder){
  //   // e.target.setAttribute('data-prev', e.target.value);
  //   // console.log("Previous:" + e.target.getAttribute('data-prev'));
  // }

  function OnPlaceHolderChange(e: any, item: item, placeholder: any) {
    let prevValue = placeholder; //e.target.getAttribute('data-prev');

    // if (prevValue === null)
    //   e.target.setAttribute('data-prev', e.target.value);
    if ($debug) console.log("Previous:" + e.target.getAttribute("data-prev"));
    e.target.setAttribute("data-prev", e.target.value);
    if ($debug) console.log("NEW:" + e.target.getAttribute("data-prev"));

    var indexValue = item.placeholders.indexOf(e.target.value);

    indexValue = ++indexValue;

    if (e.target.value === "") {
      var newCode = item.code.replaceAll("${" + indexValue + ":" + prevValue + "}", prevValue);
    } else {
      var newCode = item.code.replaceAll("${" + indexValue + ":" + prevValue + "}", "${" + indexValue + ":" + e.target.value + "}");
    }
    const tempItems = $items.customSnippets.map((x) => {
      if (x.id === item.id) {
        if (e.target.value !== "") {
          //If empty, delete!
          x.code = newCode;
          return x;
        } else {
          x.code = newCode;
          let index: any = x.placeholders?.indexOf("");
          x.placeholders?.splice(index, 1);
          if ($debug) {
            console.log("Clearning Value!");
            console.log(x);
          }
          return x;
        }
      } else {
        return x;
      }
    });
    $items.customSnippets = [...tempItems];
  }

  function OnCodeChange(e: any, item: item) {
  }

  function onBlockHover(e: any, item: item) {}

  function onBlockLeave(e: any, item: item) {}

  setDebugMode(true);

  const listName = "Code Blocks";

  function AddCodeBlockFromSelection() {
    tsvscode.postMessage({
      type: "addCodeBlockFromSelection",
      value: $editMode,
    });
  }
  function getLinkedName(linkid: string) {
    let linkedItem = $items.customSnippets.find((item) => item.id === linkid);
    if (linkedItem) return linkedItem.name;
    else return "linknull";
  }

</script>

<main class="item">
  <!-- <div id="editTextHeader" class="editText hide" style="Color:Yellow; font-weight:bold">EDIT MODE ENABLED</div> -->
  <Common bind:this="{common}" />

  <button class="tooltip" on:click={AddCodeBlockFromSelection} style="height: 50px;">Add Current Selection to CodeBlock</button>
  <input type="text" placeholder="Search" value={(SearchTerm = SearchTerm ?? "")} on:change={(event) => searchCode(event, FullCodeSearch)} />
  <section aria-label={listName} autoAriaDisabled:true use:dndzone={{ items: $items.customSnippets, flipDurationMs }} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
    {#each $items.customSnippets as item (item.id)}
      <div
        aria-label={item.name}
        id={item.id}
        class="cell block {item.visible === 'false' ? 'hide' : 'showBlock'}"
        animate:flip={{ duration: flipDurationMs }}
        on:mouseleave={(event) => onBlockLeave(event, item)}
        on:mouseover={(event) => onBlockHover(event, item)}
        on:mouseenter={() => onmouseenter}
        on:dblclick={() => onItemDoubleClick(item)}
        style="border-color:{item.color}; display:{item.visible}"
      >
        <div>
          <span style=" cursor: pointer;" on:click={() => pasteCodeFromBlock(item)}><Fa icon={faPlusCircle} style="color:#00c300; padding-right: 4px;" /> </span>
          <span style=" cursor: pointer;" on:click={(event) => EditCodeBlock(item)}><Fa icon={faPencilAlt} style="color:orange; padding-right: 4px;" /> </span>
          <span style="cursor: pointer;" on:click={() => ShowColorPicker(item)}><Fa icon={faTint} style="color:yellow; padding-right: 4px;" /> </span>
          <span style="cursor: pointer;" on:click={() => ShowTags(item)}><Fa icon={faTag} style="color:#007acc; padding-right: 4px;" /> </span>

          <span on:click={() => deleteItem($items.customSnippets, item)} class="show" style="float:right; cursor: pointer;"
            ><Fa icon={faTimesCircle} style="color:red; padding-right: 4px; padding-top: 3px;" /></span
          >
        </div>
        <div>
          <div style="background: #3c3c3c;     margin-top: 3px; align-items: center;" class="show">
            <Fa icon={faFont} style="color:{item.color}; padding-right: 4px;" />
            <input type="text" bind:value={item.name} on:change={() => common.changedName(item)} />
          </div>

          <div style="background: #3c3c3c;     margin-top: 3px; align-items: center; " class="hide colorInput">
            <Fa icon={faTint} style="color:yellow; padding-right: 4px;  " />
            <input type="text" id={getNonce()} style="float:left;" value={item.color} class="" placeholder="red" on:change={(event) => changeColor(event, item)} />
          </div>

          <div style=" background: #3c3c3c;     margin-top: 3px; align-items: center;" class="hide tagInput">
            <Fa icon={faTag} style="color:#007acc; padding-right: 4px;" />
            <input type="text" id={getNonce()} style="float:left;" value={item.tags} placeholder="tag1, tag2" on:change={(event) => changeTags(event, item)} />
          </div>
        </div>

        <div class="codeblock">
          <textarea disabled style="height:100px; width:100%" bind:value={item.code} on:change={(event) => OnCodeChange(event, item)} />
          <!-- <button on:click={event => CreateTabStop(event, item)}>Selection to variable </button> -->

          {#if item.placeholders !== null && typeof item.placeholders !== "undefined" && item.placeholders.length > 0}
            {#each item.placeholders as placeholder}
              <input type="text" disabled bind:value={placeholder} on:change={(event) => OnPlaceHolderChange(event, item, placeholder.toString())} />
            {/each}
          {/if}
        </div>
        <div class="linkedStyles">
          {#if item.linkedBlocks !== null && typeof item.linkedBlocks !== "undefined" && item.linkedBlocks.length > 0}
            {#each item.linkedBlocks as linkedBlock}
              <div class="linkedStyleBlock">
                <span style="cursor: pointer;" on:click={(event) => searchCode(linkedBlock, FullCodeSearch)}><Fa icon={faSearch} style="color:#23f1de; padding-right: 4px;" /> </span>
                <input type="text" disabled value={getLinkedName(linkedBlock)} />
                <span on:click={() => deleteCodeLink(item, linkedBlock)} class="show" style="float:right; cursor: pointer;"><Fa icon={faTimesCircle} style="color:red; padding-right: 4px; " /></span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/each}
  </section>
</main>

<style lang="css">
  section {
    /* width: 100%; */
    width: auto;
    padding: 0.3em;
    border: 1px solid black;
    /* this will allow the dragged element to scroll the list */
    overflow: scroll;
    height: 400px;
  }
  .cell {
    /* width: 100%; */
    width: auto;
    padding: 0.2em;
    border: 1px solid rgb(255, 255, 255);
    margin-bottom: 5px;
    /* margin: 0.15em 0; */
  }

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
    top: -25px;
    left: 45px;
    z-index: 1;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }

  input {
    font-weight: bold;
    color: white;
  }

  .hide {
    display: none;
  }

  .show {
    display: flex;
  }

  .showBlock {
    display: block;
  }

  textarea {
    width: auto;
  }

  .codeblock {
    max-height: 0;
    overflow: hidden;

    -webkit-transition: max-height 1s;
    -moz-transition: max-height 1s;
    transition: max-height 1s;
  }

  .block {
    /* transition: transform 250ms; */
    /* overflow: hidden; */
    /* height: 1px; */
    /* animation-duration: 250;
    transition-property: all; */
  }

  /* .block:hover .codeblock{
    max-height: 500px;
  } */

  .colorInput {
    /* max-height: 0px; */
    -webkit-transition: max-height 1s;
    -moz-transition: max-height 1s;
    transition: max-height 1s;
  }

  /* .block:hover  .colorInput{
    max-height: 500px;
    display: flex;
  } */

  .tagInput {
  }

  .editMode {
    max-height: 500px !important;
  }

  /* .block:hover  .tagInput{
    max-height: 500px;
    display: flex;
  } */

  .linkedStyles {
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    background: #3c3c3c;
  }

  .linkedStyleBlock {
    border: black;
    border-width: 1px;
    border-style: solid;
    align-items: center;
    display: flex;
  }
</style>
