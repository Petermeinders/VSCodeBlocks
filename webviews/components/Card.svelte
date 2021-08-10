<script>

  export let left = 30;
  export let top = 30;
  export let currentZoom = 1;
  export let card;




</script>
<div class="ds-selected" style="display:none"></div>
<!-- <button type="button" class="card one">1</button> -->


<section style="top:{top}px; left:{left}px" class="card  {card.type === 'directory' ? 'directory' : 'file'}">
  <div class="card-inner">
    <slot></slot>
  </div>
</section>


<style>
  * {
    user-select: none;
  }

  .card {
    padding:20px;
    user-select: none;
    /* width: 50px;
  height: 50px; */
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border: 0;
  }

  .ds-selected {
    outline: 3px solid black;
    outline-offset: 3px;
    color: black;
    font-weight: bold;
  }

  .card:focus {
    border: 1px solid blue;
  }

  .directory {
    border: solid 3px #864fc5;
    background: #b26effcc;
  }

  .file {
    border: solid 3px #4e58bf;
    background: #6e88ffcc;
  }


</style>
