<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS } from "svelte-dnd-action";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { codeMap, debug, editMode, items } from "../store";
  // import type { item } from "../store";
  import Common from "./Common.svelte";
  import Fa from "svelte-fa";
  import { faTint, faTag, faFont, faPlusCircle, faPencilAlt, faTimesCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
  import { setDebugMode } from "svelte-dnd-action";
  import levenshtein from "fast-levenshtein";
  import type { Item } from "../store";

  export let SearchTerm: string;
  export let FullCodeSearch: boolean;

  let common: Common;
  let shouldIgnoreDndEvents = false;
  const flipDurationMs = 300;
  let draggingItem = {};

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
    if ($debug) console.log("mode was edited: " + $editMode.id + ", " + $items.settings.currentPanel);
    if ($items.settings.currentPanel === "editMode") {
      if (debug) console.log("edit mode activated!");
    } else {
      //set element mode to false;
      console.log($items.customSnippets);
    }
  }

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
      draggingItem = e.detail.items.find((x) => x.id.toString().includes("dnd-shadow"));
      draggingItem.tempId = e.detail.info.id;
      document.addEventListener("mouseup", codeBlocksMouseUp);
      const idx = $items.customSnippets.findIndex((item) => item.id === id);
      const newId = `${id}_copy_${Math.round(Math.random() * 100000)}`;
      // the line below was added in order to be compatible with version svelte-dnd-action 0.7.4 and above
      e.detail.items = e.detail.items.filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
      e.detail.items.splice(idx, 0, {
        ...$items.customSnippets[idx],
        id: newId,
        tempId: id,
      });
      $items.customSnippets = e.detail.items;
      shouldIgnoreDndEvents = true;
    } else if (!shouldIgnoreDndEvents) {
      $items.customSnippets = e.detail.items;
    } else {
      $items.customSnippets = [...$items.customSnippets];
    }
  }

  function codeBlocksMouseUp(event) {
    console.log("enddrag");
    console.log(draggingItem);

    let pointerX = event.clientX ?? 0;
    let pointerY = event.clientY ?? 0;
    
    let selectedBlock = document.getElementById("dnd-action-dragged-el");

    selectedBlock.style.display = "none";
    let bottomElement = document.elementFromPoint(pointerX, pointerY);
    let isOverCanvas = common.ParentHasId(bottomElement, "area") 
    console.log(bottomElement);

    if (isOverCanvas) {
      let newFlatItem = {};
      newFlatItem.code = draggingItem.code;
      newFlatItem.color = draggingItem.color;
      newFlatItem.language = draggingItem.language;
      newFlatItem.linkedBlocks = draggingItem.linkedBlocks;
      newFlatItem.name = draggingItem.name;
      newFlatItem.placeholders = draggingItem.placeholders;
      newFlatItem.tags = draggingItem.tags;
      newFlatItem.tempId = draggingItem.tempId;
      newFlatItem.visible = true;

      newFlatItem.id = draggingItem.tempId;
      newFlatItem.parentId = "undefined";
      newFlatItem.path = "undefined";
      newFlatItem.type = "custom";
      newFlatItem.color = draggingItem.color;
      newFlatItem.open = false;
      newFlatItem.children = [];
      newFlatItem.extension = "custom";
      newFlatItem.locationX = event.clientX-200 ?? 0;
      newFlatItem.locationY = event.clientY-50 ?? 0;
      newFlatItem._startLine = "undefined";
      newFlatItem._startCharacter = "undefined";
      newFlatItem._endLine = "undefined";
      newFlatItem._endCharacter = "undefined";
      newFlatItem.linkedTargetBlocks = draggingItem.linkedBlocks;

      if (typeof $codeMap.flatTree.find((x) => x.id === newFlatItem.id) === "undefined") {
        $codeMap.flatTree.push(newFlatItem);
      }
      else{
        let existingItem = $codeMap.flatTree.find((x) => x.id === newFlatItem.id);
        existingItem.visible = true;
      }

      event.srcElement.parentElement.style.display = "block";
    }

    document.removeEventListener("mouseup", codeBlocksMouseUp);
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

  function deleteItem(itemList: any, selectedItem: Item) {
    if ($debug) console.log($items.customSnippets);

    //let removedItem = itemList.filter((j: any) => j.id === selectedItem.id);

    itemList.map((item) => {
      item.linkedBlocks.map((linkedBlock) => {
        if (linkedBlock === selectedItem.id) {
          console.log(item);
          const index = item.linkedBlocks.indexOf(selectedItem.id);
          item.linkedBlocks.splice(index, 1);
        }
      });
    });

    let itemsLeft = itemList.filter((j: any) => j.id !== selectedItem.id);
    $items.customSnippets = [...itemsLeft];
  }

  function deleteCodeLink(item: Item, linkId: string = "") {
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
    let searchString: string;
    if (typeof e === "string") {
      searchString = e;
    } else {
      searchString = e.target.value;
    }

    if ($debug) console.log(searchString);

    let foundArray: Item[];
    if ($items.settings.searchCode) {
      try {
        foundArray = $items.customSnippets.filter(
          (item) =>
            item.name.toLowerCase().indexOf(searchString.toLowerCase().trim()) !== -1 ||
            item.id.toString().toLowerCase().indexOf(searchString.toLowerCase().trim()) !== -1 ||
            item?.tags?.findIndex((x) => x?.toLowerCase()?.trim() === searchString?.toLowerCase()?.trim()) !== -1 ||
            FuzzyCheck(item, searchString)
        );
      } catch {
        foundArray = [];
        console.log("Tags/Search error!");
      }
    } else {
      foundArray = $items.customSnippets.filter(
        (item) =>
          item.name.toLowerCase().indexOf(searchString.toLowerCase().trim()) !== -1 ||
          item.id.toString().toLowerCase().indexOf(searchString.toLowerCase().trim()) !== -1 ||
          item?.tags?.findIndex((x) => x?.toLowerCase()?.trim() === searchString?.toLowerCase()?.trim()) !== -1
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
    if ($items.settings.isFuzzy) {
      return CodeCompareWholeFile(item, searchString);
    } else {
      if (item.code.toLowerCase().includes(searchString.toLowerCase().trim()) === true) {
        return true;
      } else {
        return false;
      }
      //return CodeCompareForEachItem(item, searchString)

      // return false;
    }
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

  // function CodeCompareForEachItem(item: Item, searchString: string) {
  //   const x = item;
  //   if (searchString === "") {
  //     return false;
  //   }

  //   let shtein = levenshtein.get(searchString, x.code);
  //   if (shtein < 100) {
  //     let changeMinusx = searchString.length - x.code.length;
  //     let xMinusChange = x.code.length - searchString.length;
  //     if (Math.abs(changeMinusx) < 50) {
  //       console.log(
  //         "Name: " +
  //           x.name +
  //           ": " +
  //           changeMinusx +
  //           ": " +
  //           xMinusChange +
  //           ": " +
  //           "Stein: " +
  //           shtein
  //       );
  //       //x.visible = "true";
  //       return true;
  //     } else {
  //       // x.visible = "false";
  //       return false;
  //     }
  //   }
  //   //return x;
  //   return false;

  //   $items = { ...$items };
  // }

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

  function EditCodeBlock(item: Item) {
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

  function OnCodeChange(e: any, item: item) {}

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
  <button class="tooltip" on:click={AddCodeBlockFromSelection} style="height: 50px;"
    >Add Current Selection to CodeBlock<span class="tooltiptext">Text</span></button
  >
  <div style="display:flex; align-items: center; background: #3c3c3c">
    <input type="text" placeholder="Search" value={(SearchTerm = SearchTerm ?? "")} on:change={(event) => searchCode(event, FullCodeSearch)} />
    <span class="tooltip">
      <input type="checkbox" id="searchCode" name="searchCode" value="false" bind:checked={$items.settings.searchCode} />
      <span class="tooltiptext">Search Code</span>
    </span>
    <span class="tooltip"
      ><input title="Text to show" type="checkbox" id="isFuzzy" name="isFuzzy" bind:checked={$items.settings.isFuzzy} />
      <span class="tooltiptext">Fuzzy Search</span>
    </span>
  </div>

  <section
    aria-label={listName}
    autoAriaDisabled:true
    use:dndzone={{ items: $items.customSnippets, flipDurationMs }}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
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
          <Common bind:this={common} />

          {#if common !== null && typeof common !== "undefined"}
            <span style="display:none;">{common.updateTagView()}</span>
          {/if}

          <span style=" cursor: pointer;" on:click={() => pasteCodeFromBlock(item)}
            ><Fa icon={faPlusCircle} style="color:#00c300; padding-right: 4px;" />
          </span>
          <span style=" cursor: pointer;" on:click={(event) => EditCodeBlock(item)}
            ><Fa icon={faPencilAlt} style="color:orange; padding-right: 4px;" />
          </span>
          <span style="cursor: pointer;" on:click={() => ShowColorPicker(item)}><Fa icon={faTint} style="color:yellow; padding-right: 4px;" /> </span>
          <span style="cursor: pointer;" on:click={() => ShowTags(item)}><Fa icon={faTag} style="color:#007acc; padding-right: 4px;" /> </span>

          <span on:click={() => deleteItem($items.customSnippets, item)} class="show" style="float:right; cursor: pointer;"
            ><Fa icon={faTimesCircle} style="color:red; padding-right: 4px; padding-top: 3px;" /></span
          >
          <span style="float:right; font-weight: bold; margin-right:10px;">{item.language}</span>
        </div>
        <div>
          <div class="show inputStyle">
            <input
              type="text"
              class="blockTitle"
              style="color:{item.color};"
              bind:value={item.name}
              on:change={() => common.changedName(item, false)}
            />
          </div>

          {#if common}
            <div class="hide colorInput inputStyle">
              <Fa icon={faTint} style="color:yellow; padding-right: 4px;  " />
              <input
                type="text"
                id={common.getNonce()}
                style="float:left;"
                value={item.color}
                class=""
                placeholder="red"
                on:change={(event) => common.changeColor(event, item, false)}
              />
            </div>

            <div class="hide tagInput inputStyle">
              <Fa icon={faTag} style="color:#007acc; padding-right: 4px;" />
              <input
                type="text"
                id={common.getNonce()}
                style="float:left;"
                value={item.tags}
                placeholder="tag1, tag2"
                on:change={(event) => common.changeTags(event, item, false)}
              />
            </div>
          {/if}
        </div>

        <div class="codeblock">
          <textarea disabled style="height:100px; width:100%" bind:value={item.code} on:change={(event) => OnCodeChange(event, item)} />
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
                <span style="cursor: pointer;" on:click={(event) => searchCode(linkedBlock, FullCodeSearch)}
                  ><Fa icon={faSearch} style="color:#23f1de; padding-right: 4px;" />
                </span>
                <input type="text" style="color:#b3fffb" disabled value={getLinkedName(linkedBlock)} />
                <span on:click={() => deleteCodeLink(item, linkedBlock)} class="show" style="float:right; cursor: pointer;"
                  ><Fa icon={faTimesCircle} style="color:red; padding-right: 4px; " /></span
                >
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

  .blockTitle {
    font-size: 1.2em;
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
