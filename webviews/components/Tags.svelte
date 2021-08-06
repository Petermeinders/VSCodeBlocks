<script lang="ts">
  import { items } from "../store";
  import { tags } from "../store";
  import { slide } from "svelte/transition";
  import Common from "./Common.svelte";

  let common: Common;

// $:{
//   $items.selectedTags
//   updateActiveTagsCSS();
// }


  let isOpen = false;
  const ToggleTags = (e: MouseEvent) => {
    // $tags?.forEach(tag => {
    //   $items.selectedTags.forEach(selectedTag => {
    //   if(tag === selectedTag)
    //   {

    //   }
    // })
    // })

    isOpen = !isOpen;
  };

  function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  console.log("Tags:");
  console.log($tags);

  function filterBlocksByTag(e, tag: string) {
    tag = tag.toUpperCase();
    let selectedTags = $items.selectedTags ?? [];

    if (tag !== "NONE") {
      if (selectedTags.indexOf(tag) === -1) {
        //Tag not yet added.
        selectedTags.push(tag);

        $items.selectedTags = [...selectedTags];

       
        console.log($items.selectedTags);
       // e.target.classList.add("tagSelected");
      } else {
        //Duplicate found
        //e.target.classList.remove("tagSelected");
        let x = selectedTags.includes(tag) && selectedTags.splice(selectedTags.indexOf(tag), 1);
      }

  //Gets list of active tags and updates blocks.
  common.updateTagView();


      // $items.customSnippets.forEach((item) => {
      //   if (item.visible !== "None") console.log(item);
      // });
    } else {
      //Show ALL
      $items.selectedTags = [];
      let i = $items.customSnippets.filter((x) => {
        if (typeof x.tags !== "undefined" && typeof $items.selectedTags !== "undefined") {
          x.visible = "";
          return x;
        }
      });
      $items.customSnippets = [...i];
    }

    //This doesn't work since the component gets reloaded after new derived value
    //e.target.classList.add('selectedTag')
  }

  

  let borderStyle: "solid" | "none" = "none";

  const updateActiveTagsCSS = (tag) => {
      $items.selectedTags.forEach((selectedTag) => {
        if (tag === selectedTag) {
          return "true";
        }
      });


    return "false";
  }

  let x = false;
</script>

<main class="item">
  <Common bind:this={common} />
  <div class="tagSelected" />
  <div>
    <button on:click={(event) => ToggleTags(event)} aria-expanded={isOpen}>
      <svg style="tran" width="20" height="20" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 16" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg>
      Tags
    </button>
    {#if isOpen && typeof $tags !== "undefined"}
      <ul transition:slide={{ duration: 300 }}>
        {#each $tags as tag (tag)}
         {#if $items.selectedTags.indexOf(tag) === -1}
         <div
         class="cursorPointer"
         style="border-width:1px; border-color:white; border-style:{borderStyle};"
         on:click={(event) => filterBlocksByTag(event, tag)}
       >
         {tag}
       </div>
       {:else}
       <div
       class="cursorPointer selected"
       style="border-width:1px; border-color:white; border-style:{borderStyle};"
       on:click={(event) => filterBlocksByTag(event, tag)}
     >
       {tag}
     </div>
         {/if}


        {/each}
      </ul>
    {/if}
  </div>
</main>

<style>
  .cursorPointer {
    cursor: pointer;
  }

  .selected {
    /* background-color: #ff3e00; */
    /* color: white; */
    font-weight: bold;
  }

  button {
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

  .tagSelected {
    font-weight: bold;
  }

  /* .selectedTag {
    font-weight: bold;
  } */
</style>
