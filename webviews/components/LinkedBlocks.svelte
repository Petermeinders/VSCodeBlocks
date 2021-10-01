<script lang="ts">
  import { items, linkedBlocks } from "../store";
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";

  let isOpen = false;
  const toggle = () => (isOpen = !isOpen);

  const flipDurationMs = 300;
  function handleDndConsider2(e:any) {
    $linkedBlocks = e.detail.items;
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
    newItems.map((item) => {
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
    });
    $items.customSnippets = [...newItems];
    $linkedBlocks = [];
  }

  function RemoveBlocks(){
    $linkedBlocks = [];
  }
</script>

<main class="item">
  <button class="accordianButton" on:click={toggle} aria-expanded={isOpen} style="">
    <svg style="tran; float:left" width="20" height="20" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 16" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg>
    Linked
  </button>
  {#if isOpen && typeof linkedBlocks !== "undefined"}
    <button on:click={LinkBlocks}>Link Blocks</button>
    {#if $linkedBlocks.length > 0}
    <button on:click={RemoveBlocks}>Cancel</button>
    {/if}

    <section use:dndzone={{ items: $linkedBlocks, flipDurationMs }} on:consider={ handleDndConsider2} on:finalize={handleDndFinalize2}>
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
