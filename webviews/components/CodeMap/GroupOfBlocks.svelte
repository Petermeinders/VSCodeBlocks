<script lang="ts">
import { beforeUpdate, onMount } from "svelte";
import type { FilteredTree, GroupedSquare } from "../../../src/Models";

    import { codeMap, groupedSquares } from "../../store";

    export let groupedSquare: GroupedSquare;
  
     let minX: number = 5;
     let minY: number = 22;
     let maxX: number = 55;
     let maxY: number = 66;
  
    export let sourceId: string;
    export let destId: string;
    export let color = "#ff0000";
    export let lineIndex = -1;

    onMount(async () => {
   
     minX  = 5;
     minY  = 22;
     maxX  = 55;
     maxY  = 66;
    });

    beforeUpdate(() => {
      console.log("Grouped Square:");
      console.log(groupedSquare);
      CalculateMaxMin(groupedSquare);
  });

  const CalculateMaxMin = (groupedSquare: GroupedSquare) => {
    let minX: number = 9999;
    let minY: number = 9999;
    let maxX: number = -9999;
    let maxY: number = -9999;

    groupedSquare.blocks.forEach((block) => {
      if (+block.locationX < minX) {
        minX = +block.locationX;
      }
      if (+block.locationY < minY) {
        minY = +block.locationY;
      }
      if (+block.locationX > maxX) {
        maxX = +block.locationX;
      }
      if (+block.locationY > maxY) {
        maxY = +block.locationY;
      }
    });

    groupedSquare.minX = minX - 100;
    groupedSquare.minY = minY - 100;
    groupedSquare.maxX = maxX + 200;
    groupedSquare.maxY = maxY + 200;


    //return { minX, minY, maxX, maxY };
  };
  
  
  </script>
  
  <main>
  
    <svg style="z-index:-99; width:1000vh; height:1000vh; position: absolute; top:-500vh; left:-500vh">
     
      <!-- {@debug groupedSquare } -->
  
    <!-- Top line -->
      <line
        data-sourceId={sourceId}
        data-destId={destId}
        x1 = "calc(500vh + {groupedSquare.minX}px)"
        y1 = "calc(500vh + {groupedSquare.minY}px)"
        x2 = "calc(500vh + {groupedSquare.maxX}px)"
        y2 = "calc(500vh + {groupedSquare.minY}px)"
        style="stroke:{color};stroke-width:3"
      />

        <!-- Left line -->
        <line
        data-sourceId={sourceId}
        data-destId={destId}
        x1 = "calc(500vh + {groupedSquare.minX}px)"
        y1 = "calc(500vh + {groupedSquare.minY}px)"
        x2 = "calc(500vh + {groupedSquare.minX}px)"
        y2 = "calc(500vh + {groupedSquare.maxY}px)"
        style="stroke:{color};stroke-width:3"
      />

      
        <!-- Right line -->
        <line
        data-sourceId={sourceId}
        data-destId={destId}
        x1 = "calc(500vh + {groupedSquare.maxX}px)"
        y1 = "calc(500vh + {groupedSquare.minY}px)"
        x2 = "calc(500vh + {groupedSquare.maxX}px)"
        y2 = "calc(500vh + {groupedSquare.maxY}px)"
        style="stroke:{color};stroke-width:3"
      />

      
        <!-- Bottom line -->
        <line
        data-sourceId={sourceId}
        data-destId={destId}
        x1 = "calc(500vh + {groupedSquare.minX}px)"
        y1 = "calc(500vh + {groupedSquare.maxY}px)"
        x2 = "calc(500vh + {groupedSquare.maxX}px)"
        y2 = "calc(500vh + {groupedSquare.maxY}px)"
        style="stroke:{color};stroke-width:3"
      />


      
      Sorry, your browser does not support inline SVG.
    </svg>
  </main>
  
  <style>
  </style>
  