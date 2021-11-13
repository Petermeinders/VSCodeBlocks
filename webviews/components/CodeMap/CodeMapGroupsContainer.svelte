<script lang="ts">
  import { derivedGroups } from "../../store";
  import Shared from "../Shared.svelte";
  import Fa from "svelte-fa";
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";

  let common: Shared;
</script>

<main>
  <Shared bind:this={common} />
  {#if $derivedGroups}
    <div style="" class="groupList codeMapGroup">
      <h2>Groups</h2>
      {#each $derivedGroups as group (group.groupId)}
        <div id={group.groupId} style="display:flex; align-items: center;">
          <input type="text" value={group.name} class="groupInput" on:change={(event) => common.onGroupNameChange(group, event)} />
          <span style="cursor: pointer;" on:click={() => common.HideGroup(group)}
            ><Fa icon={faEyeSlash} style="color:#007acc; padding-right: 4px;" />
          </span>
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>
  .codeMapGroup {
    max-height: 150px;
    overflow: scroll;
  }
</style>
