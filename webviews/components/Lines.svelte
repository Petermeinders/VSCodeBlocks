<script lang="ts">
  import type { FilteredTree, items } from "../store";
  import { filteredTree } from "../store";
  import lodash from "lodash";
  import deepdash from "deepdash";

  // export let x1: number;
  // export let x2: number;
  // export let y1: number;
  // export let y2: number;
  const _ = deepdash(lodash);
  let lines = [];

  function MapThemLines() {
    let filtrate = _.eachDeep($filteredTree, (value, key, parentValue, context) => {
      if (typeof(value) === "object") {
          if (value.type === "file")
          {
            let parent = getParent(value.parentId);
            if (parent)
            {
              let newLine = {
              x2: value.x2,
              y2: value.y2,
              x1: parent.parent.x1,
              y1: parent.parent.y1
            }
            lines.push(newLine);
            }
          }
      }
    });
  }
  MapThemLines();

  function getParent(parentId){
    
let parent =  _.findDeep($filteredTree, (value, key, parentValue, context) =>{
  if (typeof(parentValue) === "object") {
              if(value === parentId && parentValue.id === parentId)
              {
                console.log("Found IT!");
                console.log(value);    
                  return true;
              }
            }
          });
          return parent;
  }
</script>

<main>
  {#each lines as line}
    {console.log(lines)}
    {#if line.y1, line.x1 && line.x2 && line.y2}
      <svg height="210" width="500">
        <line x1={line.x1} y1={line.y2} x2={line.x2} y2={line.y2} style="stroke:rgb(255,0,0);stroke-width:2" />
        Sorry, your browser does not support inline SVG.
      </svg>
    {/if}
  {/each}
</main>

<style>
</style>
