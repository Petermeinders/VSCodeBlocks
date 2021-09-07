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


</script>

<main>
    <Common bind:this={common} />
    {#if $derivedGroups}
    <div style="" class="groupList codeMapGroup">
      <h2>Groups</h2>
      {#each $derivedGroups as group (group.groupId)}
        <div id={group.groupId} style="display:flex; align-items: center;">
          <input type="text" value={group.name} class="groupInput" on:change={(event) => common.onGroupNameChange(group, event)} />
          <span style="cursor: pointer;" on:click={() => common.HideGroup(group)}><Fa icon={faEyeSlash} style="color:#007acc; padding-right: 4px;" /> </span>
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>
  .codeMapGroup{
    max-height: 150px;
    overflow: scroll;
}  
</style>