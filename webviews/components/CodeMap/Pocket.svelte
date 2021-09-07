<script lang="ts">
  import {
    codeMap,
    newRender,
    currentZoom,
    perimeterItem,
    currentlySelected,
    derivedGroups,
    items,
    debug,
    activelySelectedText,
    activePath,
    lines,
  } from "../../store";
  import Card from "./Card.svelte";
  import { onMount, afterUpdate, beforeUpdate, tick } from "svelte";
  import DragSelect from "dragselect";
  import lodash, { cloneDeep, flatMap } from "lodash";
  import deepdash from "deepdash";
  import Line from "./Line.svelte";
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import Common from ".././Common.svelte";
  import Fa from "svelte-fa";
  import { faCog, faCubes, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

  let common: Common;

  const flipDurationMs = 300;
  function handleDndConsider(e) {
    $codeMap.pocket = e.detail.items;
  }
  function handleDndFinalize(e) {
    $codeMap.pocket = e.detail.items;
  }

</script>

<main>
    <Common bind:this={common} />
    {#if $codeMap?.pocket}
    <div style="">
      <h2>Pocket</h2>
      <section class="pocket"
        style="margin:auto; width: 100%;"
        use:dndzone={{ items: $codeMap.pocket, flipDurationMs }}
        on:consider={handleDndConsider}
        on:finalize={handleDndFinalize}
      >
        {#each $codeMap.pocket as item (item.id)}
          <div id={item.id} class="pocketblock" animate:flip={{ duration: flipDurationMs }}>
            {item.name}
            <button id={item.id} type="button" style="width:50px;" on:click={(event) => common.MoveToCanvas(event)}>Add</button>
          </div>
        {/each}
      </section>
    </div>
  {/if}
</main>

<style>
.pocket{
    max-height: 150px;
    overflow: scroll;
}
</style>