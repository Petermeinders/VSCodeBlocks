<script lang="ts">
    import {editItem} from "../store";
    import Fa from "svelte-fa";
    import { faTint} from "@fortawesome/free-solid-svg-icons";
      import 'vanilla-colorful';
    
  
    export let color = "#1e88e5";
    let ColorPickerVisible = false;
    export let currentBlock; 
    // export let ColorChange = (color:string) => {};
  
  function handleColorChanged(event:any) {
    if (currentBlock && color)
    {
      ColorChange(currentBlock, event.detail.value);
      color =  event.detail.value;
    }
    else{
      color =  event.detail.value;
      $editItem.color = color;
    }

  
  }

  function ColorChange(currentBlock, color)
  {
    currentBlock.color = color;
  }

  function handleClick() {
      if (ColorPickerVisible)
        ColorPickerVisible = false;
        else 
        ColorPickerVisible = true;
	}

    function lostFocus(){
        ColorPickerVisible = false;
    }
  
  </script>
 {#if ColorPickerVisible === false}
   <button on:click={handleClick} style="width:40px; height:30px; border:white solid 1px; background-color:{color}">
    <Fa icon={faTint} style="color:yellow; padding-right: 4px;  " />
  </button>
 {:else}
  <main style="position:absolute;">
    <div style="display:flex" class="inputStyle colorInput ">
        <div>
          <hex-color-picker  on:blur={lostFocus} color="{color}" on:color-changed="{handleColorChanged}"></hex-color-picker>
          <output><button on:click={handleClick}  style="width:40px; height:30px; background-color:{color}"></button>{color}</output>
        </div>
      </div>
  </main>
  {/if}
  
  
  <style>
      output {
          display: block;
          margin-top: 10px;
          font-size: 1.25rem;
          text-align: center;
      }
  </style>
  