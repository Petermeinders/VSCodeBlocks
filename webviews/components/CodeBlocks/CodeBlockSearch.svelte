<script lang="ts">

  import { items, searchTerm } from "../../../webviews/store";
  import Fa from "svelte-fa";
  import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";




  export let searchCode = (event:any, FullCodeSearch:any) => {};
  export let FullCodeSearch: boolean;

  function ClearSearchInput(){
    $searchTerm = "";
    searchCode("",false);

    let searchBox = <HTMLInputElement> document.getElementById("CodeBlocksSearchInput");
    
    if (searchBox)
      searchBox.value = $searchTerm;
  }

</script>


<main>
    <div class="SearchBox" style="display:flex; align-items: center; background: #3c3c3c">
        <button style="background:#3c3c3c;" on:click={ClearSearchInput}><Fa icon={faTimesCircle} style="color:white; padding-right: 4px; padding-left: 4px; cursor:pointer;" /></button>
        <input id="CodeBlocksSearchInput" type="text" placeholder="Search" value={($searchTerm ?? "")} on:change={(event) => searchCode(event, FullCodeSearch)} />
        <span class="tooltip">
          <input type="checkbox" id="searchCode" name="searchCode" value="false" bind:checked={$items.settings.searchCode} />
          <span class="tooltiptext">Search Code</span>
        </span>
        <span class="tooltip"
          ><input title="Text to show" type="checkbox" id="isFuzzy" name="isFuzzy" bind:checked={$items.settings.isFuzzy} />
          <span class="tooltiptext">Fuzzy Search</span>
        </span>
      </div>
</main>


<style>

</style>
