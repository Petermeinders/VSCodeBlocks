<script lang="ts">
  //Cut out for now until I have time to implement some of these features
  import {
    codeMap,
    currentZoom,
    currentlySelected,
    items,
    debug,
    activelySelectedText,
    activeSelectionMeta,
    rightClickedBlockEvent,
    groupedSquares,
    blockContainerStore,
    zoom,
    moveAbles,
  } from "../../store";
  import type { FilteredTree, Group, BlockContainerInterface, ZoomElement } from "../../../src/Models";
  import Shared from "../Shared.svelte";
  import type { OnSelectEnd } from "svelte-selecto";

  let common: Shared;
  let moveable: Moveable;
  let isMoving = false;
  let faketree = [];
  let changedFile = "";
  let selecto: Selecto;
  let zoomElements: ZoomElement[] = [];
  let hasCanvasRenderedYet;

  const onBlockSelectEnd = (e: OnSelectEnd) => {
    console.log("blocks selected");
    console.log(e);
    HideShowLinesForSelectedBlocks(e);
  };

  const HideShowLinesForSelectedBlocks = (e: OnSelectEnd) => {
    let elementList;
    let selectedBlock = new Array<FilteredTree>();

    $moveAbles.forEach((moveable) => {
      let move = moveable.getInstance();
      if (move.target.classList.contains("selected")) {
        move.renderDirections = ["n", "nw", "ne", "s", "se", "sw", "e", "w"];
      } else {
        move.renderDirections = [];
      }
    });

  };

  
  //Might use in future?
  function getMatrixFrom3D(element) {
    if (element !== null) {
      const values = element.style.transform.split(/\w+\(|\);?/);
      const transform = values[1].split(/,\s?/g).map(parseInt);

      return {
        x: transform[0],
        y: transform[1],
        z: transform[2],
      };
    }
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  function HideBorderOnMove() {
    if (selecto) {
      selecto.selectableTargets = document.querySelectorAll(".groupBorder");
      console.log(selecto?.selectableTargets);
      document.querySelector(".groupBorder").style.visibility = "hidden";
    }
  }
  
  function ShowBorderAfterMove() {
    if (selecto) {
      selecto.selectableTargets = document.querySelectorAll(".selecto-area .cube");
      console.log(selecto?.selectableTargets);
      document.querySelector(".moveable-control-box").style.display = "block";
    }
  }

  const OnBlockDragOVERSelect = ({ detail: e }) => {
    console.log("SELECTED!");
    console.log(selecto.getSelectedTargets());
  };


  function CheckIfBlockIsInAGroup(block) {
    $codeMap.groups.forEach((group) => {
      if (group.groupId.includes(block.id)) {
        return group;
      }
    });
  }

   //Future function to help organize selected blocks on click
   function OrganizeSelected() {
    console.log($currentlySelected);

    $currentlySelected.reverse();

    let childPos = $currentlySelected[0].getBoundingClientRect();
    let parentPos = $currentlySelected[0].parentElement.getBoundingClientRect();
    let firstX = childPos.x - parentPos.x;
    let firstY = childPos.y - parentPos.y;

    $currentlySelected.forEach((item) => {
      item.getBoundingClientRect();
      let translate = "translate3d(" + firstX + "px, " + firstY + "px, 1px) scale(" + $currentZoom + ")";

      item.style.transform = translate;
      firstY += 56;
      ds.addSelection(item);
    });
  }

  //Possibly implement containers later
  function OnNewContainerClick() {
    let newContainer: BlockContainerInterface = {
      id: common.getNonce(),
      name: "Name Here!",
      blocks: [],
      locationX: 0,
      locationY: 0,
    };
    $blockContainerStore.push(newContainer);
    $blockContainerStore = $blockContainerStore;
    console.log($blockContainerStore);
  }

  function AddEventListenerForClick() {
    const groupSelect = document.getElementsByClassName("moveable-area")?.item(0);
    if (groupSelect) {
      groupSelect.addEventListener("contextmenu", function (event) {
        console.log("newCLick");
        event.preventDefault();
        if (event.button !== 2) {
          return;
        }

        common.expand(event, moveable);
        console.log(event.defaultPrevented);
      });
    }
  }

  function UpdateGroups() {
    //Update Groups
    if ($codeMap.groups.length > 0) {
      $codeMap.groups.forEach((group) => {
        if (group.blockIds.length > 0) {
          let selectoBorder = document.querySelector(".moveable-area");
          if (selectoBorder) {
            console.log(selecto.getInstance().getSelectedTargets());
          }
        }
      });
    }
  }

  function UpdateControlBoxBorder() {
    const blueBorder = document.querySelector("div[data-styled-id='rCS19atnxs']");
    let foundElement = zoomElements.findIndex((f) => f?.element?.classList?.contains("moveable-control-box"));

    if (foundElement === -1) {
      zoomElements.push({ element: blueBorder, transformationType: "translate3d" });
    } else {
      zoomElements.splice(
        zoomElements.findIndex((f) => f?.element?.classList?.contains("moveable-control-box")),
        1,
        { element: blueBorder, transformationType: "translate3d" }
      );
    }
  }

</script>