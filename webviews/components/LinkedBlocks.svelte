<script lang="ts">
  import Dnd from "./Dnd.svelte";
  import Tags from "./Tags.svelte";
  import { onMount } from "svelte";
  import { debug, editItem, editMode, items, linkedBlocks } from "../store";
  import { tags } from "../store";
  import { page } from "../store";
  import EditScreen from "./EditScreen.svelte";
  import levenshtein from "fast-levenshtein";
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import type { Item } from "../../src/Models";

  let isOpen = false;
  const toggle = () => (isOpen = !isOpen);

  //   let linkedBlocks = [
  //     { id: 1, name: "item1" },
  //     { id: 2, name: "item2" },
  //     { id: 3, name: "item3" },
  //     { id: 4, name: "item4" },
  //   ];
  const flipDurationMs = 300;
  function handleDndConsider2(e) {
    $linkedBlocks = e.detail.items;
    // $linkedBlocks.map(linkItem => {
    //     linkItem.id = e.detail.items[0].id;
    //     return linkItem;
    // })
  }
  function handleDndFinalize2(e) {
    $linkedBlocks = e.detail.items;
  }

  function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function InfoMessage(message: any) {
    tsvscode.postMessage({
      type: "onInfo",
      value: message,
    });
  }

  function LinkBlocks() {
    console.log($linkedBlocks);
    InfoMessage("Blocks linked.");
    let newItems = $items.customSnippets;
    newItems.map((item: Item) => {
      if ($linkedBlocks.some((x) => x.id === item.id)) {
        $linkedBlocks.forEach((linkedBlock) => {
          if (item.id !== linkedBlock.id) {
            if (item.linkedBlocks.indexOf(linkedBlock.id) === -1) {
              item.linkedBlocks.push(linkedBlock.id);
              console.log("Push  " + linkedBlock.id);
              return item;
            }
            return item;
          }
          return item;
        });
      }
      return item;

      //   let linkedItem = $linkedBlocks.find(x => x.id)
      //   item.linkedBlocks.push(linkedItem.id);
    });
    $items.customSnippets = [...newItems];
    $linkedBlocks = [];
  }
</script>

<main class="item">
  <button class="accordianButton" on:click={toggle} aria-expanded={isOpen}>
    <svg style="tran" width="20" height="20" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 16" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg>
    Linked
  </button>
  {#if isOpen && typeof linkedBlocks !== "undefined"}
    <button on:click={LinkBlocks}>Link Blocks</button>

    <section use:dndzone={{ items: $linkedBlocks, flipDurationMs }} on:consider={handleDndConsider2} on:finalize={handleDndFinalize2}>
      {#each $linkedBlocks as item (getNonce())}
        <div animate:flip={{ duration: flipDurationMs }}>{item.name}</div>
      {/each}
    </section>
  {/if}
</main>

<style>
  section {
    /* width: 100%; */
    width: auto;
    padding: 0.3em;
    border: 1px solid black;
    /* this will allow the dragged element to scroll the list */
    overflow: scroll;
    height: 200px;
  }
  .cell {
    /* width: 100%; */
    width: auto;
    padding: 0.2em;
    border: 1px solid rgb(255, 255, 255);
    margin: 0.15em 0;
  }

  .cursorPointer {
    cursor: pointer;
  }

  .accordianButton {
    border: none;
    background: none;
    display: block;
    color: inherit;
    font-size: 16px;
    cursor: pointer;
    margin: 0;
    padding-bottom: 0.5em;
    padding-top: 0.5em;
    text-align: left;
  }

  svg {
    transition: transform 0.2s ease-in;
  }

  [aria-expanded="true"] svg {
    transform: rotate(0.25turn);
  }
</style>
