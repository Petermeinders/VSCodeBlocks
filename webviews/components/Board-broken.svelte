<script>
  // This is done in a single file for clarity. A more factored version here: https://svelte.dev/repl/288f827275db4054b23c437a572234f6?version=3.38.2
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import { items } from "../store.ts";
  import HorizontalList from './Horizontal.svelte';


  let columnItems = [
    {
      id: 77,
      name: "TODO",
        
      items: $items,
        // {id: 41, name: "item41"},
        // {id: 42, name: "item42"},
        // {id: 43, name: "item43"},
        // {id: 44, name: "item44"},
        // {id: 45, name: "item45"},
        // {id: 46, name: "item46"},
        // {id: 47, name: "item47"},
        // {id: 48, name: "item48"},
        // {id: 49, name: "item49"}
      
    },
    {
      id: 88,
      name: "DOING",
      items: [],
    },

  ];



  function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  const flipDurationMs = 200;
  function handleDndConsiderColumns(e) {
    columnItems = e.detail.items;
  }
  function handleDndFinalizeColumns(e) {
    columnItems = e.detail.items;
  }
  function handleDndConsiderCards(cid, e) {
    const colIdx = columnItems.findIndex((c) => c.id === cid);
    columnItems[colIdx].items = e.detail.items;
    columnItems = [...columnItems];
  }
  function handleDndFinalizeCards(cid, e) {
    const colIdx = columnItems.findIndex((c) => c.id === cid);
    columnItems[colIdx].items = e.detail.items;
    columnItems = [...columnItems];
  }
  function handleClick(e) {
    alert("dragabble elements are still clickable :)");
  }



   let containerWidth = '200vw';
   let itemWidth = '5em';
	function handleDndConsider(e) {
		items = e.detail.items;
	}
	function handleDndFinalize(e) {
		items = e.detail.items;
	}
</script>

<section class="board" use:dndzone={{ items: columnItems, flipDurationMs, type: "columns" }} 
on:consider={handleDndConsiderColumns} 
on:finalize={handleDndFinalizeColumns}>
  {#each columnItems as column (column.id)}
    <div class="column" animate:flip={{ duration: flipDurationMs }}>
      <div class="column-title">{column.name}</div>
      <div class="column-content"
        use:dndzone={{ items: column.items, flipDurationMs }}
        on:consider={(e) => handleDndConsiderCards(column.id, e)}
        on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
      >
      <!-- {console.log(e)} -->
        {#each column.items as item (item.id)}

          <div class="card" animate:flip={{ duration: flipDurationMs }} on:click={handleClick}>
            {item.name}
            <!-- <HorizontalList items={item.innerItems}/> -->
            <div class="innerSection" style="width:{containerWidth}" use:dndzone={{items:item.innerItems, flipDurationMs}} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
                {#each item.innerItems as inner(item.id)}
                    <div class="inner" style="flex: 0 0 {itemWidth}" animate:flip="{{duration: flipDurationMs}}">
                        {inner.name}	
                    </div>
                {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</section>

<style>
  .board {
    height: 90vh;
    width: 100%;
    padding: 0.5em;
    margin-bottom: 40px;
  }
  .column {
    height: 100%;
    width: 250px;
    padding: 0.5em;
    margin: 1em;
    float: left;
    border: 1px solid #333333;
    /*Notice we make sure this container doesn't scroll so that the title stays on top and the dndzone inside is scrollable*/
    overflow-y: hidden;
  }
  .column-content {
    height: 100%;
    /* Notice that the scroll container needs to be the dndzone if you want dragging near the edge to trigger scrolling */
    overflow-y: scroll;
  }
  .column-title {
    margin-bottom: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .card {
    height: 15%;
    width: 100%;
    margin: 0.4em 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #dddddd;
    border: 1px solid #333333;
  }

  .innerSection {
    height: 60px;
		padding: 0.3em;
		border: 1px solid black;
		display: flex;
		overflow-x: scroll;
	}
	.inner {
    height: 45px;
    display: inline-block;
		padding: 0.9em;
		border: 1px solid blue;
		margin: 0 0.15em;
	}
</style>
