<script>

  export let left = 30;
  export let top = 30;
  export let currentZoom = 1;
  export let card;


  export let tree;

</script>
<!-- <button type="button" class="card one">1</button> -->


<!-- <section style="top:{top}px; left:{left}px" class="card  {card.type === 'directory' ? 'directory' : 'file'}">
  <div class="card-inner">
    <slot></slot>
  </div>
</section> -->
<!-- {@debug treeItem} -->

{#if tree}
<ul>
    {#each tree as treeItem, i}
    {#if i < 5}
    <li>
            <slot {treeItem}>No slot</slot>
            {#if treeItem.children}
                <svelte:self tree={treeItem.children} let:treeItem={treeItem}>
                    <slot {treeItem}>No slot</slot>
                </svelte:self>
            {/if}
          </li>
        {/if}
    {/each}
  </ul>
{/if}

<style>
  * {
    user-select: none;
  }

 

</style>
