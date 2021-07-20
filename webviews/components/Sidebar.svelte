<script lang="ts">
  import Dnd from "./Dnd.svelte";
  import Tags from "./Tags.svelte";
  import Board from "./Board.svelte";
  import { onMount } from "svelte";
  import { items } from "../store";
  import { tags } from "../store";
  import { page } from "../store";
  import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from "svelte-dnd-action";

  function UpdateTabStop() {}

  export let isSidebar: true | false;
  console.log("sidebar: " + isSidebar);

  $: {
    if ($items !== null && $items.customSnippets[0] !== undefined) {
      $items.customSnippets.map((item) => {
        item.tags = item.tags ?? [""];
      });

      console.log("Saving Items");
      console.log($items);

      let i;
      let p;
      let t;

      // if (tsvscode.getState()?.i !== null && typeof tsvscode.getState()?.i !== "undefined") {
      //   if (tsvscode.getState().i[0].code !== null && typeof tsvscode.getState().i[0].code !== "undefined") {
      //     if (tsvscode.getState().i[0].code !== $items[0].code) {
      //       console.log("DIFFERENT CODE NEED UPDATE!");
      //     }
      //   }
      // }

      if ($items.vsSnippets !== null && $items.vsSnippets.length > 0) {
        //         const resultArray = Object.keys($items.vsSnippets).map(index => {
        //     let person = $items.vsSnippets[index];
        //     person.name = index;
        //     console.log(person)
        //     return person;
        // });

        let final = [];

        $items.vsSnippets.map((x) => {
          var keys = Object.keys(x).map(function (y) {
            return y;
          });

          var asdf = Object.values(x).map(function (y, index) {
            let newArray = y;
            newArray.name = keys[index];
            // do something with person
            final.push(newArray);
            //console.log(newArray)
          });
        });
        console.log("Before map:")
        console.log(final);

        final.map(block =>{
          block.readOnly = true;
          block.id = getNonce();
          block.code = block.body;
          block.prefix = block.prefix;
          block.description = block.description;
          block.innerItems = "innerItem";
          block.placeholders = [];
          block.color = "grey";
          block.visible = "";
          block.tags = [];
        })

        console.log("After map:")
      console.log(final);
      }



      i = $items;
      p = $page;
      t = $tags;

      tsvscode.setState({ i, p, t });
      console.log("STATE SET FROM SIDEBAR!");
    } else {
      console.warn("BAD STATE!");
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
          $items = {
            customSnippets: [{ id: lastId, code: message.value, innerItems: "items4", name: "New Name", visible: "true", color: "white", tags: [""] }, ...$items.customSnippets],
            vsSnippets: [],
          };
          console.log({ items });
          break;

        case "import-code":
          let parsedCode = JSON.parse(message.value);

          $items = parsedCode;
          console.log($items);
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
    Tags: $tags,
  };

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

  function FullScreen() {
    console.log("Full Screen Mode!");
    tsvscode.postMessage({
      type: "fullScreen",
      value: $items,
    });
  }

  function ShowSidebar() {
    console.log("Sidebar mode");
    tsvscode.postMessage({
      type: "showSidebar",
      value: $items,
    });
  }

  let clicked = 0;
</script>

<main>
  <!-- SIDEBAR -->
  {#if isSidebar === true}
    {#if $page === "code"}
      <Tags />
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
  {:else}
    <!-- PANEL -->
    <h1>Panel</h1>
    <div class="container">
      <div class="box">
        <Tags />
        <Dnd />
      </div>
      <!-- <div class="box" style="width:800px;">
        <div>
          <Board/>
        </div>
      </div> -->
    </div>
  {/if}

  <div>
    <button
      class="butt butter"
      on:click={() => {
        tsvscode.postMessage({
          type: "onInfo",
          value: "🐛  on line ",
        });
      }}>Test Msg</button
    >
  </div>
  <div>
    <button on:click={ExportCode}>Export Code </button>
  </div>
  {#if isSidebar === true}
    <div>
      <button on:click={FullScreen}>Full Screen</button>
    </div>
  {:else}
    <div>
      <button on:click={ShowSidebar}>Sidebar mode</button>
    </div>
  {/if}
</main>

<style>
  .container {
    display: flex; /* or inline-flex */
  }

  .box {
  }

  .butt {
    width: auto;
    color: white;
  }
</style>
