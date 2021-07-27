<script lang="ts">
  import { items } from "../store";
  import { tags } from "../store";
  import { slide } from "svelte/transition";
  // export let entry
  let isOpen = false;
  const toggle = () => (isOpen = !isOpen);

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

  function filterBlocksByTag(tag: string) {
    console.log("TIME TOFIND TAGS!");
    let i = $items.customSnippets.filter((x) => { 
      if (typeof x.tags !== "undefined") { //Tag found
        if (x.tags.findIndex((y) => y.includes(tag)) !== -1 || tag === "None") {
          x.visible = "";
        } else {
          x.visible = "none";
        }
      } else { //Tag missing
        if( tag === "None") //Selected tag is none so make everything visible
        {
          x.visible = "";
        }
        else { //Selected tag is none so hide anything missing selected tag
          x.visible = "none";
        }
      }
      return x;
    });
    $items.customSnippets = [...i];

    //This doesn't work since the component gets reloaded after new derived value
    //e.target.classList.add('selectedTag')
  }

  let borderStyle: "solid" | "none" = "none";
</script>

<main class="item">
  <div>
    <button on:click={toggle} aria-expanded={isOpen}>
      <svg style="tran" width="20" height="20" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 16" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg>
      Tags
    </button>
    {#if isOpen && typeof($tags) !== 'undefined'}
      <ul transition:slide={{ duration: 300 }}>
        {#each $tags as tag (getNonce())}
          <div class="cursorPointer " style="border-width:1px; border-color:white; border-style:{borderStyle};" on:click={(event) => filterBlocksByTag(tag)}>{tag}</div>
        {/each}
      </ul>
    {/if}
  </div>
</main>

<style>
  .cursorPointer {
    cursor: pointer;
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

  /* .selectedTag {
    font-weight: bold;
  } */
</style>
