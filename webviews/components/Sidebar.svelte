<script lang="ts">
  import Dnd from "./Dnd.svelte";
  import Tags from "./Tags.svelte";
  import Board from "./Board.svelte";
  import { onMount } from "svelte";
  import { items } from "../store";
  import { tags } from "../store";
  import { page } from "../store";
import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from "svelte-dnd-action";



  $: {

    if ($items !== null && $items[0] !== undefined) {  
      
      $items.map(item => {
       item.tags = item.tags ?? [""];
      })

      console.log("Saving Items")
      console.log($items)

    let i = $items;
    let p = $page;
    let t = $tags;



    tsvscode.setState({ i, p, t });
    console.log("STATE SET!")
    }
    else{
      console.warn("BAD STATE!")

    }
    // tsvscode.setState({ i });

    // let t = $tags;
    // tsvscode.setState({ t });
  }

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
	  let lastId = getNonce();
      switch (message.type) {
        case "add-code":
          $items = [{ id: lastId, code: message.value, name: "New Name", visible:'true', color:'white', tags:[""] }, ...$items];
          console.log({ items });
          break;

        case "import-code":
          $items = JSON.parse(message.value);
          console.log($items );
          break;
      }
    });
  });

  let board = [
    {
      id: 1,
      name: "TODO",
      items: [
        { id: 41, name: "item41" },
        { id: 42, name: "item42" },
        { id: 43, name: "item43" },
        { id: 44, name: "item44" },
        { id: 45, name: "item45" },
        { id: 46, name: "item46" },
        { id: 47, name: "item47" },
        { id: 48, name: "item48" },
        { id: 49, name: "item49" },
      ],
    },
    {
      id: 2,
      name: "DOING",
      items: [],
    },
    {
      id: 3,
      name: "DONE",
      items: [],
    },
  ];

  const data = {
		'Tags': $tags,

	}


  function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function ExportCode() {
    console.log("Export Data Start!");
    console.log($items);
    tsvscode.postMessage({
      type: "saveData",
      value: $items,
    });
  }

  function ImportCode() {
    console.log("Import Data Start!");
    tsvscode.postMessage({
      type: "saveData",
      value: $items,
    });
  }

  let clicked = 0;
</script>

<main>
  {#if $page === "code"}
    <Tags/>
    <Dnd />
    <button
      on:click={() => {
        $page = "other";
      }}>Future Tab</button
    >
  {:else}
    <div>Test Text!</div>
    <button
      on:click={() => {
        $page = "code";
      }}>go back</button
    >
  {/if}

  <div>
    <button
      on:click={() => {
        tsvscode.postMessage({
          type: "onInfo",
          value: "🐛  on line ",
        });
      }}
    >
      Test Msg</button
    >
  </div>
  <div>
    <button on:click={ExportCode}>Export Code </button>
  </div>
</main>

<style>
</style>