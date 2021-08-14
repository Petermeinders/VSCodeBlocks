<script lang="ts">
    export let x1: number;
    export let x2: number;
    export let y1: number;
    export let y2: number;
    export let id: string;
    
    let fullId = "line" + id;
  </script>
  
  <main>

      <!-- {#if y1 && x1 && x2 && y2} -->

        <svg height="auto" width="auto" style="z-index:-99;">
      <!-- {@debug x1, y1, x2, y2} -->
{console.log("NEW LINE")}
          <line id={fullId} x1={x1} y1={y1} x2={x2} y2={y2} style="stroke:rgb(255,0,0);stroke-width:2" />
          Sorry, your browser does not support inline SVG.
        </svg>
      <!-- {/if} -->

  </main>
  
  <style>
  </style>
  