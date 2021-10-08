<script lang="ts">
    // @ts-nocheck
    import { codeMap, items } from "../../store";
    import { flip } from "svelte/animate";
    import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS } from "svelte-dnd-action";
    import Common from ".././Common.svelte";
    import CodeIcons from "../CodeIcons.svelte"
    // import codeIcons from "codeIcons";
  
    let common: Common;
    let draggingItem = {};
    let shouldIgnoreDndEvents = false;
  
    const flipDurationMs = 300;
    function handleDndConsider(e: any) {
      const { trigger, id } = e.detail.info;
      if (trigger === TRIGGERS.DRAG_STARTED) {
        //THIS WHOLE MESS IS FOR THE GETBOUNDINGRECTANGLE error thing
        draggingItem = e.detail.items.find((x) => x.id.toString().includes("dnd-shadow"));
        draggingItem.tempId = e.detail.info.id;
        document.addEventListener("mouseup", codeBlocksMouseUp);
        const idx = $codeMap.activeWindow.flatOutline.findIndex((item) => item.id === id);
        const newId = `${id}_copy_${Math.round(Math.random() * 100000)}`;
        // the line below was added in order to be compatible with version svelte-dnd-action 0.7.4 and above
        e.detail.items = e.detail.items.filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
        e.detail.items.splice(idx, 0, {
          ...$codeMap.activeWindow.flatOutline[idx],
          id: newId,
          tempId: id,
        });
        $codeMap.activeWindow.flatOutline = e.detail.items;
        shouldIgnoreDndEvents = true;
      } else if (!shouldIgnoreDndEvents) {
        $codeMap.activeWindow.flatOutline = e.detail.items;
      } else {
        $codeMap.activeWindow.flatOutline =  [...$codeMap.activeWindow.flatOutline];

      }
    }
  
    function handleDndFinalize(e: any) {
      if (!shouldIgnoreDndEvents) {
          $codeMap.activeWindow.flatOutline = e.detail.items;
      } else { //THIS WHOLE MESS IS FOR THE GETBOUNDINGRECTANGLE error thing
        let newItems = $codeMap.activeWindow.flatOutline;
        let origin = newItems.find(x => x.id === e.detail.info.id)
        let index = newItems.indexOf(origin);
        newItems.splice(index, 1);
        newItems.map((item) => {
          if (item.tempId === e.detail.info.id) {
            item.id = item.tempId;
            item.tempId = "";
            return item;
          } else {
            return item;
          }
        });
        $codeMap.activeWindow.flatOutline = [...newItems];
        shouldIgnoreDndEvents = false;
      }
    }
  
    function codeBlocksMouseUp(event) {
      console.log("enddrag");
      console.log(draggingItem);
  
      let pointerX = event.clientX ?? 0;
      let pointerY = event.clientY ?? 0;
  
      let selectedBlock = document.getElementById("dnd-action-dragged-el");
  
      selectedBlock.style.display = "none";
      let bottomElement = document.elementFromPoint(pointerX, pointerY);
      let isOverCanvas = common.ParentHasId(bottomElement, "area");
      console.log(bottomElement);
  
      if (isOverCanvas) {
        let newFlatItem = {};
        newFlatItem.code = draggingItem.code;
        newFlatItem.color =  $items.settings.randomizeNewBlockColors ? "#" + Math.floor(Math.random() * 16777215).toString(16) : draggingItem.color;
        newFlatItem.language = draggingItem.language;
        newFlatItem.linkedBlocks = draggingItem.linkedBlocks;
        newFlatItem.name = draggingItem.name.substring(0, 25);
        newFlatItem.placeholders = draggingItem.placeholders;
        newFlatItem.tags = draggingItem.tags;
        newFlatItem.tempId = draggingItem.tempId;
        newFlatItem.visible = true;
  
        newFlatItem.id = draggingItem.tempId;
        newFlatItem.parentId = "undefined";
        newFlatItem.path = draggingItem.path;
        newFlatItem.type = "outline";
        newFlatItem.open = false;
        newFlatItem.children = [];
        newFlatItem.extension = draggingItem.extension;
        newFlatItem.locationX = event.clientX - 200 ?? 0;
        newFlatItem.locationY = event.clientY - 50 ?? 0;
        newFlatItem.startLine = draggingItem.startLine;
        newFlatItem.startCharacter = draggingItem.startCharacter;
        newFlatItem.endLine = draggingItem.endLine;
        newFlatItem.endCharacter = draggingItem.endCharacter;
        newFlatItem.linkedTargetBlocks = draggingItem.linkedBlocks ?? [];
        newFlatItem.linkedBlocks = draggingItem.linkedBlocks ?? [];
        newFlatItem.starred = true;
  
        if (typeof $codeMap.flatTree.find((x) => x.id === newFlatItem.id) === "undefined") {
          $codeMap.flatTree.push(newFlatItem);
        } else {
          let existingItem = $codeMap.flatTree.find((x) => x.id === newFlatItem.id);
          existingItem.visible = true;
        }
  
        event.srcElement.parentElement.style.display = "block";
      }
  
      document.removeEventListener("mouseup", codeBlocksMouseUp);
    }

    function ClickOutline(item: FilteredTree) {
        console.log(item.startLine + " " + item.endLine);

        tsvscode.postMessage({
      type: "OpenFile",
      value: item,
    });
    }
  </script>
  
  <main>
    <Common bind:this={common} />
    {#if $codeMap?.activeWindow?.flatOutline}
      <div style="">
        <h2>Outline</h2>
        <section
          class="outline"
          style="margin:auto; width: 100%;"
          autoAriaDisabled:true
          use:dndzone={{ items: $codeMap?.activeWindow?.flatOutline, flipDurationMs }}
          on:consider={handleDndConsider}
          on:finalize={handleDndFinalize}
        >
          {#each $codeMap?.activeWindow?.flatOutline as item (item.id)}
            {#if $items.settings.visibleOutlineBlocks.find(ext => ext.name === item.extension).checked}
            <div on:click={() => ClickOutline(item)} id={item.id} class=".outline-item outline-item" >
              <CodeIcons blockType={item.extension}/>
          
            <!-- <button id={item.id} type="button" style="width:50px;" on:click={(event) => common.MoveToCanvasFromOutline(event)}>-></button> -->
            {item.name.substring(0, 25)}
          </div>
          {:else}
          <div>
          </div>
            {/if}
            
          {/each}
        </section>
      </div>
    {/if}
  </main>
  
  <style>
    /* .outline {
      max-height: 150px;
      overflow: scroll;
      min-height: 100px;
    } */

  
    .outline-item {
      display: flex;
      flex-direction: row;
      margin-top: 5px;
    }
  </style>
  