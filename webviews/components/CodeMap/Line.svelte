<script lang="ts">
  import { codeMap, lines } from "../../store";

  export let x1: number;
  export let x2: number;
  export let y1: number;
  export let y2: number;
  export let id: string;

  export let sourceId;
  export let destId;
  export let color = "#ff0000";
  export let lineIndex = -1;

  function DeleteLine(sourceId, destId) {
    let sourceBlock = $codeMap.flatTree.find((x) => x.id === sourceId);
    let destBlock = $codeMap.flatTree.find((x) => x.id === destId);

    if (sourceBlock && destBlock) {
      let index = sourceBlock?.linkedTargetBlocks.indexOf(destBlock.id);

      if (index !== -1) {
        sourceBlock?.linkedTargetBlocks.splice(index, 1);

        console.log("remove Line: " + lineIndex);
        $lines.splice(lineIndex, 1);
        $lines = $lines;
      } 
      else 
      {
        index = destBlock?.linkedTargetBlocks.indexOf(sourceBlock.id);
        destBlock?.linkedTargetBlocks.splice(index, 1);

        console.log("remove Line: " + lineIndex);
        $lines.splice(lineIndex, 1);
        $lines = $lines;
      }
    }
  }
</script>

<main>
  <!-- {#if y1 && x1 && x2 && y2} -->

  <svg style="z-index:-99; width:100%; height:100%;     position: absolute;">
    <marker id="triangle" viewBox="0 0 10 10" refX="1" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="10" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f00" />
    </marker>
    <marker id="triangleStart" viewBox="0 0 10 10" refX="1" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="10" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="blue" />
    </marker>
    <line
      on:click={() => DeleteLine(sourceId, destId)}
      data-sourceId={sourceId}
      data-destId={destId}
      {x1}
      {y1}
      {x2}
      {y2}
      marker-start="url(#triangleStart)"
      marker-end="url(#triangle)"
      style="stroke:{color};stroke-width:3"
    />
    Sorry, your browser does not support inline SVG.
  </svg>
  <!-- {/if} -->
</main>

<style>
</style>
