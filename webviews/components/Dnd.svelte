<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS } from "svelte-dnd-action";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { items } from "../store.ts";
  import { text } from "svelte/internal";
  import Fa from 'svelte-fa'
  import { faFlag, faTint, faTag } from '@fortawesome/free-solid-svg-icons'
  import {setDebugMode} from "svelte-dnd-action";

  function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  const flipDurationMs = 300;
  function handleDndConsider(e) {
    $items = e.detail.items;

    if (e.detail.info.trigger === "draggedEntered") {
      console.log("dragEntered!");
    }
  }
  function handleDndFinalize(e) {
    $items = e.detail.items;
    if (e.detail.info.trigger === "draggedEntered") {
      console.log("dragEntered!");
    }
  }

  function deleteItem(itemList, item) {
    console.log($items);

    let itemsLeft = itemList.filter((j) => j.id !== item.id);
    $items = [...itemsLeft];
  }

  function changedName(item) {
    let i = $items.filter((x) => {
      if (x.id === item.id) {
        x.name = item.name;
        console.log(x);
      }
      return x;
    });
    tsvscode.setState({ i });
  }

  console.log("thing here!");

  afterUpdate((e) => {});

  function returnFirstLine(item) {
    const s = item.code.split("\n");
    return s[0];
  }

  function handleDblClick(item) {
    tsvscode.postMessage({
      type: "onItemDoubleClick",
      value: item.code,
    });
  }

  function searchCode(e) {
    console.log(e);
    console.log(e.target.value);
    const foundFirst = $items.find((element) => element.name.toLowerCase().includes(e.target.value.toLowerCase()));
    // const foundArray = $items.filter((item) => item.name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1 || item.tags.indexOf(e.target.value) !== -1);
    const foundArray = $items.filter((item) => item.name.toLowerCase().indexOf(e.target.value.toLowerCase().trim()) !== -1 || item.tags.findIndex( x => x.toLowerCase().trim() === e.target.value.toLowerCase().trim()) !== -1);
    console.log(foundArray);

    let newArray = [];
    if (foundArray.length > 0) {
      foundArray.forEach((element) => {
        let index = $items.indexOf(element);
        $items.splice(index, 1);
        newArray.push(element);
      });

      $items = [...newArray, ...$items];
      // $items = [{ id: element.id, name: element.name, code: element.code }, ...$items];
    } else {
      console.log("Not found!");
    }

    // const index = $items.indexOf(foundFirst);
    // if (index > -1) {
    //   $items.splice(index, 1);
    //   $items = [{ id: foundFirst.id, name: foundFirst.name, code: foundFirst.code }, ...$items];
    // }
    // else{
    //   console.log("Not found!");
    // }
  }
  
  function ShowColorPicker(item){
      console.log(item.id);
      console.log(document.getElementById(item.id));
      document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.toggle('hide')
      //TODO: Refactor out JS mess.
      if(document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.toggle('hide') === false) {
        document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.toggle('hide')
      }

  }

  function changeColor(e, item) {
    console.log(e);
    console.log(item);
    item.color = e.target.value;
    $items = $items.map((i) =>{
      if (i.id === item.id)
      {
        i.color = item.color;
      }
      return i;
    })
    document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.toggle('hide')
  }

  function ShowTags(item){
    console.log(item.id);
      console.log(document.getElementById(item.id));
      document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.toggle('hide')
      //TODO: Refactor out JS mess.
      if(document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.toggle('hide') === false) {
        document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.toggle('hide')
      }
  }

  function changeTags(e, item){
    console.log(e);
    console.log(item);
    //  item.tags = e.target.value;
    $items = $items.map((i) =>{
      if (i.id === item.id)
      {
        var array = e.target.value.split(',');
        i.tags = array;
      }
      return i;
    })
    document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.toggle('hide')
  }

  setDebugMode(true);

  const listName="Code Blocks";
</script>

<main>
  <input type="text" placeholder="Search" on:change={searchCode} />

  <section aria-label="{listName}" autoAriaDisabled:true use:dndzone={{ items: $items, flipDurationMs }} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
    {console.log($items)}
    {#each $items as item (item.id)}
      <div aria-label={item.name} id={item.id} animate:flip={{ duration: flipDurationMs }} on:dblclick={handleDblClick(item)} class="cell" style="border-color:{item.color}; display:{item.visible}">
        <div>
          <input type="text" id="{getNonce()}" style="float:left;" value="{item.color}" class="hide colorInput" placeholder="red" on:change={event => changeColor(event, item)}/>
          <input type="text" id="{getNonce()}" style="float:left;" value="{item.tags}" class="hide tagInput" placeholder="tag1, tag2" on:change={event => changeTags(event, item)}/>


          <input type="text" bind:value={item.name} on:change={() => changedName(item)} /> <span on:click={deleteItem($items, item)} style="float:right; cursor: pointer;">x</span>          
          <span style="float:left; cursor: pointer;" on:click={ShowColorPicker(item)}><Fa icon={faTint}  style="color:{item.color}; padding-right: 4px;" /> </span>
          <span style="float:left; cursor: pointer;" on:click={ShowTags(item)}><Fa icon={faTag}  style="color:{item.color}; padding-right: 4px;" /> </span>
        
        </div>
        {returnFirstLine(item)}
        <!-- <span class="tooltiptext">{item.code}</span> -->
      </div>
    {/each}
  </section>
</main>

<style>
  section {
    width: 100%;
    padding: 0.3em;
    border: 1px solid black;
    /* this will allow the dragged element to scroll the list */
    overflow: scroll;
    height: 600px;
  }
  .cell {
    width: 95%;
    padding: 0.2em;
    border: 1px solid rgb(255, 255, 255);
    margin: 0.15em 0;
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
		display: inline;
	}
</style>