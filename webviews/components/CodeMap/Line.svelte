<script lang="ts">
    export let x1: number;
    export let x2: number;
    export let y1: number;
    export let y2: number;
    export let id: string;
    
    export let sourceId
    export let destId;
    export let color = "#ff0000";
  </script>
  
  <main>

      <!-- {#if y1 && x1 && x2 && y2} -->

        <svg style="z-index:-99; width:100%; height:100%;     position: absolute;">
      <!-- {@debug x1, y1, x2, y2} -->
          <line data-sourceId={sourceId} data-destId={destId} x1={x1} y1={y1} x2={x2} y2={y2} style="stroke:{color};stroke-width:2" />
          Sorry, your browser does not support inline SVG.
        </svg>
      <!-- {/if} -->

  </main>
  
  <style>

  </style>
  