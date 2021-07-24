<script lang="ts">
  import Dnd from "./Dnd.svelte";
  import Tags from "./Tags.svelte";
  import Board from "./Board.svelte";
  import { onMount } from "svelte";
  import { editItem, editMode, items } from "../store";
  import { tags } from "../store";
  import { page } from "../store";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from "svelte-dnd-action";
import EditScreen from "./EditScreen.svelte";

  function UpdateTabStop() {}

  export let isSidebar: true | false;
  console.log("sidebar: " + isSidebar);

  let SearchTerm: string = "";
  let FullCodeSearch: boolean = true;

  $: {
    if ($items !== null && $items.customSnippets[0] !== undefined) {
      $items.customSnippets.map((item) => {
        item.tags = item.tags ?? [""];
      });

      if ($items.vsSnippets === null || typeof $items.vsSnippets === "undefined") {
        $items.vsSnippets = ["vsSnippets1", "vsSnippets2"];
      }

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

      i = $items;
      p = $page;
      t = $tags;

      if (i.customSnippets[0].id === "0") {
        console.warn("BAD STATE! Not saving. Please check your import file.");
      } else {
        tsvscode.setState({ i, p, t });
        ExportCode();
        console.log("STATE SET FROM HOME!");
      }
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
          if (message.value !== "") {
            let text = message.value.text
            let filename = message.value.filename
            // $items = {
            //   customSnippets: [{ id: lastId, code: message.value, innerItems: "items4", name: "New Name", visible: "true", color: "white", tags: [""] }, ...$items.customSnippets],
            //   vsSnippets: [],
            // };
            $editItem = {id: lastId, code: text, innerItems: "items4", name: "New Name", "placeholders":[], visible: "true", color: "white", tags: [""]}
            $editMode = { id: lastId, state: "true", fileName:filename };
          }

          break;

          case "edit-code":
          if (message.value !== "") {
            // $items = {
            //   customSnippets: [{ id: lastId, code: message.value, innerItems: "items4", name: "New Name", visible: "true", color: "white", tags: [""] }, ...$items.customSnippets],
            //   vsSnippets: [],
            // };
            let id = message.value.id
            let filename = message.value.filename

            $editItem = $items?.customSnippets?.find(x => x?.id === id);
            $editMode = { id: id, state: "true", fileName: filename };
          }

          break;

        //TODO:Figure out how to pass code and update respective tabstops
        // case 'edit-item-string-change':
        //     let changedCode = message.value;
        //     EditItemCodeChange(changedCode);
        //   break;


        case "selection-to-search":
          SearchTerm = message.value;
          break;

          case "add-placeholder":
            CreateTabStop(message.value);
          //SearchTerm = message.value;
          break;

        case "import-code":
          if (typeof message.value === "string") {
            $items = JSON.parse(message.value);
          } else {
            $items = message.value;
          }
          console.log($items);
          break;

        case "import-code-from-file":
          if (typeof message.value === "string") {
            $items = JSON.parse(message.value);
          } else {
            $items = message.value;
          }
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

  function CheckExistingPlaceholders(item:item){
    if(item.placeholders === null || typeof(item.placeholders) === 'undefined' || item.placeholders.length === 0)
        {
          console.log("no placeholders")
          return -1;
        }
        else{
          console.log("Placeholders:" + item.placeholders.length)
          return item.placeholders.length
        }
  }

//TODO:Figure out how to pass code and update respective tabstops
  // function EditItemCodeChange(code:string){
  //     let val = code.search($editItem.placeholders[0]);
  //     console.log(val);
  // }



  function CreateTabStop(placeholderValue:string){
    let item = $editItem;
    var lastNumber = CheckExistingPlaceholders(item)
    if (lastNumber === -1)
    {
      item.placeholders = [];
      lastNumber = 1;
    }
    else{
      lastNumber = ++lastNumber;
    }

    var selectedString = placeholderValue;

    if (selectedString === "")
    {
      return;
    }

    console.log(selectedString);
    console.log(item.code);

    var newCode = item.code.replaceAll(selectedString, "${"+lastNumber+":"+selectedString+"}" )
    // item.placeholders.push(selectedString);

    let newPlaceholder = $editItem.placeholders;
    newPlaceholder.push(selectedString.toString())
    let newItem  = $editItem;

    newItem.placeholders = newPlaceholder;
    newItem.code = newCode;


    // const tempItems = $items.customSnippets.map(x => {
    //   if(x.placeholders === null || typeof(x.placeholders) === 'undefined')
    //   return;

    //   if(x.id === item.id){
    //     x.placeholders.push(selectedString.toString());
    //     x.code = newCode;
    //     return x;
    //   }
    //   else{
    //     return x;
    //   }
    // });

    //$items.customSnippets = [...tempItems]

    $editItem = {...newItem}
    console.log("New placeholder on new item.")
    console.log($editItem)

    UpdateCodeWithNewTabStop();


    //var selRange = selObj.getRangeAt(0);
    //console.log(selRange.toString());
  }

  function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function UpdateCodeWithNewTabStop(){
    tsvscode.postMessage({
      type: "UpdateCodeWithNewTabStop",
      value: $editItem.code,
    });
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
      type: "ImportDataFromFile",
      value: true,
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

  function CloseEditWindow() {
    tsvscode.postMessage({
      type: "closeEditWindow",
      value: $editMode,
    });
  }

  function SaveCodeFromEdit(){
    let foundItem = $items?.customSnippets?.find(x => x?.id === $editItem?.id);
    if(foundItem)
    {
      const index = $items?.customSnippets.indexOf(foundItem);
      $items.customSnippets.splice(index,1);
      $items.customSnippets = [$editItem, ...$items.customSnippets];
    }
    else{
      $items.customSnippets = [$editItem, ...$items.customSnippets];
    }
  }

  let clicked = 0;
</script>

<main>
  <!-- SIDEBAR -->
  {#if isSidebar === true}
    {#if $editMode.state === "false"}
      <Tags />
      <Dnd {SearchTerm} {FullCodeSearch} />
      <button
        on:click={() => {
          $page = "other";
        }}>Future Tab</button
      >
    {:else}
      <div>EDIT MODE</div>
      <EditScreen/>
      <button
        on:click={() => {
          $editMode.state = "false";
        }}>go back</button
      >
    {/if}
  {:else}
  {#if $editMode.state === "false"}
    <!-- PANEL -->
    <h1>Panel</h1>
    <div class="container">
      <div class="box">
        <Tags />
        <Dnd {SearchTerm} {FullCodeSearch} />
      </div>
      <!-- <div class="box" style="width:800px;">
        <div>
          <Board/>
        </div>
      </div> -->
    </div>
    {:else}
    <div>EDIT MODE</div>
    <EditScreen/>
    <button
      on:click={() => {
        $editMode.state = "false";
        $editItem = {};
        CloseEditWindow();
      }}>go back</button
    >
    <button
      on:click={() => {
        $editMode.state = "false";
        SaveCodeFromEdit();
        CloseEditWindow();
      }}>Save Code Block</button
    >
  {/if}
  {/if}


  {#if $editMode.state === "false"}
  <div>
    <!-- svelte-ignore missing-declaration -->
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
  <div>
    <button on:click={ImportCode}>Import Code </button>
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
  {/if}
</main>

<style>
  .container {
    display: flex; /* or inline-flex */
  }
</style>
