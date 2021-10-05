<script lang="ts">
  // @ts-nocheck
  import {codeMap} from "../../store";
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import Common from ".././Common.svelte";

  let common: Common;

  const flipDurationMs = 300;
  function handleDndConsider(e:any) {
    $codeMap.pocket = e.detail.items;
  }
  function handleDndFinalize(e:any) {
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
            <button id={item.id} type="button" style="width:50px;" on:click={(event) => common.MoveToCanvasFromPocket(event)}>Add</button>
            {item.name.substring(0, 20)}
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
    min-height:100px;
}
</style>