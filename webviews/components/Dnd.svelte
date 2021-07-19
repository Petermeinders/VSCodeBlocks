<script lang="ts">
  import { flip } from "svelte/animate";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS } from "svelte-dnd-action";
  import { afterUpdate, beforeUpdate, onMount } from "svelte";
  import { items } from "../store.ts";
  import { text, xlink_attr } from "svelte/internal";
  import Fa from 'svelte-fa'
  import { faFlag, faTint, faTag, faFont, faArrowCircleRight, faPencilAlt } from '@fortawesome/free-solid-svg-icons'
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
    $items.customSnippets = e.detail.items;

    if (e.detail.info.trigger === "draggedEntered") {
      console.log("dragEntered!");
    }
  }
  function handleDndFinalize(e) {
    $items.customSnippets = e.detail.items;
    if (e.detail.info.trigger === "draggedEntered") {
      console.log("dragEntered!");
    }
  }

  function deleteItem(itemList, item) {
    console.log($items.customSnippets);

    let itemsLeft = itemList.filter((j) => j.id !== item.id);
    $items.customSnippets = [...itemsLeft];
  }

  function changedName(item) {
    let i = $items.customSnippets.filter((x) => {
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

  function pasteCodeFromBlock(item) {
    tsvscode.postMessage({
      type: "insertSnippet",
      value: item.code,
    });
  }

   function onItemDoubleClick(item){
    console.log("double clicked. Future implementation.")
   }

  function searchCode(e) {
    console.log(e);
    console.log(e.target.value);
    const foundFirst = $items.customSnippets.find((element) => element.name.toLowerCase().includes(e.target.value.toLowerCase()));
    // const foundArray = $items.customSnippets.filter((item) => item.name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1 || item.tags.indexOf(e.target.value) !== -1);
    const foundArray = $items.customSnippets.filter((item) => item.name.toLowerCase().indexOf(e.target.value.toLowerCase().trim()) !== -1 || item.tags.findIndex( x => x.toLowerCase().trim() === e.target.value.toLowerCase().trim()) !== -1);
    console.log(foundArray);

    let newArray = [];
    if (foundArray.length > 0) {
      foundArray.forEach((element) => {
        let index = $items.customSnippets.indexOf(element);
        $items.customSnippets.splice(index, 1);
        newArray.push(element);
      });

      $items.customSnippets = [...newArray, ...$items.customSnippets];
      // $items.customSnippets = [{ id: element.id, name: element.name, code: element.code }, ...$items.customSnippets];
    } else {
      console.log("Not found!");
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

  function ShowColorPicker(item){
      console.log(item.id);
      console.log(document.getElementById(item.id));

      if(document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.contains('hide')) {
        document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.remove('hide');
        document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.add('show');
      }
      else {
        document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.add('hide');
        document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.remove('show');
      }


      //TODO: Refactor out JS mess.
      if(document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.contains('show')) {
        document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.add('hide');
        document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.remove('show');
      }

  }

  function changeColor(e, item) {
    console.log(e);
    console.log(item);
    item.color = e.target.value;
    $items.customSnippets = $items.customSnippets.map((i) =>{
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

      if(document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.contains('hide')) {
        document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.remove('hide');
        document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.add('show');
      }
      else {
        document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.add('hide');
        document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.remove('show');
      }


      //TODO: Refactor out JS mess.
      if(document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.contains('show')) {
        document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.add('hide');
        document.getElementById(item.id).getElementsByClassName('colorInput')[0].classList.remove('show');
      }
  }

  function changeTags(e, item){
    console.log(e);
    console.log(item);
    //  item.tags = e.target.value;
    $items.customSnippets = $items.customSnippets.map((i) =>{
      if (i.id === item.id)
      {
        var array = e.target.value.split(',');
        i.tags = array;
      }
      return i;
    })
    document.getElementById(item.id).getElementsByClassName('tagInput')[0].classList.toggle('hide')
  }

  function editCodeBlock(e, item){
    document.getElementById(item.id).getElementsByClassName('codeblock')[0].classList.toggle('hide');
  }


  function getSelectionText() {
    var text = "", startRange=0, endRange=0;
    if (window.getSelection) {
        text = window.getSelection().toString();
        startRange = window.getSelection().anchorOffset;
        endRange = window.getSelection().focusOffset;
    } else if (document.selection && document.selection.type != "Control"){
        text = document.selection.createRange().text;
    }

    return [text, endRange, startRange];
}

  function CheckExistingPlaceholders(item){
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

  function CreateTabStop(e, item){
    var lastNumber = CheckExistingPlaceholders(item);
    if (lastNumber === -1)
    {
      item.placeholders = [];
      lastNumber = 1;
    }
    else{
      lastNumber = ++lastNumber;
    }

    var selObj = getSelectionText();
    var selectedString = selObj[0];

    if (selectedString === "")
    {
      return;
    }

    console.log(selObj[0]);
    console.log(item.code);

    var newCode = item.code.replaceAll(selectedString, "${"+lastNumber+":"+selectedString+"}" )
    // item.placeholders.push(selectedString);

    const tempItems = $items.customSnippets.map(x => {
      if(x.id === item.id){
        x.placeholders.push(selectedString);
        x.code = newCode;
        return x;
      }
      else{
        return x;
      }
    });

    $items.customSnippets =[...tempItems]

    document.getElementById(item.id).getElementsByClassName('codeblock')[0].classList.remove('hide');



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

  function OnPlaceHolderChange(e, item, placeholder) {
    let prevValue = placeholder; //e.target.getAttribute('data-prev');

    // if (prevValue === null)
    //   e.target.setAttribute('data-prev', e.target.value);

    console.log("Previous:" + e.target.getAttribute('data-prev'));
    e.target.setAttribute('data-prev', e.target.value);
    console.log("NEW:" + e.target.getAttribute('data-prev'));

    var indexValue = item.placeholders.indexOf(e.target.value);

      indexValue = ++indexValue;


    if (e.target.value === "")
    {
      var newCode = item.code.replaceAll("${"+indexValue+":"+prevValue+"}", prevValue  )
    }
    else{
      var newCode = item.code.replaceAll("${"+indexValue+":"+prevValue+"}", "${"+indexValue+":"+e.target.value+"}"  )
    }
    const tempItems = $items.customSnippets.map(x => {
      if(x.id === item.id){
        if (e.target.value !== "") //If empty, delete!
        {
          x.code = newCode;
          return x;
        }
        else{
          x.code = newCode;
          let index = x.placeholders.indexOf("");
          x.placeholders.splice(index, 1);
          console.log("Clearning Value!")
          console.log(x)
          return x;
        }
      }
      else{
        return x;
      }
    });
    $items.customSnippets =[...tempItems]
  }

  function OnCodeChange(e, item){
    // item.placeholders =
    // item.map(i => {
    //   i.placehol
    //   if(i.placeholders.)
    // })
  }


  setDebugMode(true);

  const listName="Code Blocks";
</script>

<main>
  <input type="text" placeholder="Search" on:change={searchCode} />
{console.log($items.customSnippets)}
  <section aria-label="{listName}" autoAriaDisabled:true use:dndzone={{ items: $items.customSnippets, flipDurationMs }} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
    {#each $items.customSnippets as item (item.id)}
      <div aria-label={item.name} id={item.id} animate:flip={{ duration: flipDurationMs }} on:dblclick={onItemDoubleClick(item)} class="cell" style="border-color:{item.color}; display:{item.visible}">
        <div>
          <div style="background: #3c3c3c;     margin-top: 3px; align-items: center; " class="hide colorInput">
            <Fa icon={faTint}  style="color:yellow; padding-right: 4px;  " />
            <input type="text" id="{getNonce()}" style="float:left;" value="{item.color}" class="" placeholder="red" on:change={event => changeColor(event, item)}/>
          </div>

            <div style=" background: #3c3c3c;     margin-top: 3px; align-items: center;" class="hide tagInput">
              <Fa icon={faTag}  style="color:#007acc; padding-right: 4px;"/>
              <input type="text" id="{getNonce()}" style="float:left;" value="{item.tags}"  placeholder="tag1, tag2" on:change={event => changeTags(event, item)}/>
            </div>


            <div style="background: #3c3c3c;     margin-top: 3px; align-items: center;" class="show">
              <Fa icon={faFont}  style="color:{item.color}; padding-right: 4px;"/>
              <input type="text" bind:value={item.name} on:change={() => changedName(item)} />

            </div>
        </div>
        <div>
          <span style="cursor: pointer;" on:click={ShowColorPicker(item)}><Fa icon={faTint}  style="color:yellow; padding-right: 4px;" /> </span>
          <span style="cursor: pointer;" on:click={ShowTags(item)}><Fa icon={faTag}  style="color:#007acc; padding-right: 4px;" /> </span>
          <span style=" cursor: pointer;" on:click={pasteCodeFromBlock(item)}><Fa icon={faArrowCircleRight}  style="color:#00c300; padding-right: 4px;" /> </span>
          <span style=" cursor: pointer;" on:click={event => editCodeBlock(event, item)}><Fa icon={faPencilAlt}  style="color:orange; padding-right: 4px;" /> </span>


          <span on:click={deleteItem($items.customSnippets, item)} class="show" style="float:right; cursor: pointer;">x</span>
        </div>
        <div class="hide codeblock">
          <textarea disabled style="height:100px;"  bind:value={item.code} on:change={(event) => OnCodeChange(event, item)}></textarea>
        <!-- <span class="tooltiptext">{item.code}</span> -->
          <button on:click={event => CreateTabStop(event, item)}>Selection to variable </button>

          {#if item.placeholders !== null && typeof(item.placeholders) !== 'undefined' && item.placeholders.length > 0}

            {#each item.placeholders as placeholder}
            <input type="text" bind:value={placeholder} on:change={(event) => OnPlaceHolderChange(event, item, placeholder.toString())} />
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
    width:auto;
    padding: 0.3em;
    border: 1px solid black;
    /* this will allow the dragged element to scroll the list */
    overflow: scroll;
    height: 600px;
  }
  .cell {
    /* width: 100%; */
    width:auto;
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
		display: flex;
	}

  textarea{
    width:auto;
  }

</style>


