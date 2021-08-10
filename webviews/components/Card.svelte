<script>
  export let left = 30;
  export let top = 30;
  export let currentZoom = 1;
  export let card;
  let moving = false;

  function start() {
    moving = true;
  }

  function stop() {
    moving = false;
  }

  function move(e) {
       let zoomFactor = 1;

    //   if (currentZoom > 1)
    //     zoomFactor = 1 - currentZoom;
    //   if (currentZoom < 1)
    //     zoomFactor = 1 + currentZoom;

    if (moving) {
      left += e.movementX * zoomFactor ;
      top += e.movementY * zoomFactor;
    }
  }

  $: console.log(moving);
</script>

<section on:mousedown={start} style="left:{left}px; top:{top}px" class="card {card.type === 'directory' ? 'directory' : 'file'}">
  <div class="card-inner">
    <slot />
  </div>
</section>

<svelte:window on:mouseup={stop} on:mousemove={move} />

<style>
  .card {
    user-select: none;
    position: absolute;
    cursor: move;
    padding: 5px;
  }

  .directory{
    border: solid 3px #864fc5;
    background: #b26effcc;
  }

  .file{
    border: solid 3px #4e58bf;
    background: #6e88ffcc;
  }
</style>
