<script lang="ts">
  // import Dnd from "../CodeBlocks/Dnd.svelte";
  // import Tags from "../CodeBlocks/Tags.svelte";
  import { onMount } from "svelte";
  import { activelySelectedText, activePath, activeSelectionMeta, debug, editItem, editMode, items, searchTerm } from "../../store";
  import { tags } from "../../store";
  import { page } from "../../store";
  import { codeMap } from "../../store";
  import { originItems } from "../../store";
  import EditScreen from "../EditScreen.svelte";
  import LinkedBlocks from "../CodeBlocks/LinkedBlocks.svelte";
  import { faBorderStyle, faChevronLeft, faChevronRight, faCog, faCubes, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import SettingsScreen from "../SettingsScreen.svelte";
  import Shared from "../Shared.svelte";
  import Pocket from "../CodeMap/Pocket.svelte";
  import Outline from "../CodeMap/Outline.svelte";
  import ParseVSCodeSnippet from "./VSCodeSnippets.svelte";
import { Sibling } from "../../../src/Models";
import type {FilteredTree} from "../../../src/Models";
import CodeMapMove from "../CodeMap/CodeMap.svelte";

  //Parent component for the code map and code blocks

  let common: Shared;
  let parseVSCodeSnippet: ParseVSCodeSnippet;
  let map: CodeMapMove;
  // let FullCodeSearch: boolean = true;
  let editScreen: EditScreen;
  
  let importError = false;
  $: importError;
  $: console.log("importError: ", importError);

  // On Store Changes
  $: {
    if ($items !== null && $items?.customSnippets?.length > 0) {
      $items?.customSnippets?.map((item) => {
        item.tags = item.tags ?? [""];
      });

      $items.customSnippets.map((item) => {
        item.linkedBlocks = item.linkedBlocks ?? [];
      });

      if ($items.vsSnippets === null || typeof $items.vsSnippets === "undefined") {
        $items.vsSnippets = ["vsSnippets1", "vsSnippets2"];
      }

      if (
        $items.settings === null ||
        typeof $items.settings === "undefined" ||
        typeof $items.settings.currentPanel === "undefined" ||
        typeof $items.settings.visibleOutlineBlocks === "undefined"
      ) {
        $items.settings = {
          isFuzzy: false,
          searchCode: false,
          currentPanel: "codeBlocks",
          visibleOutlineBlocks: [
            { name: "Array", checked: false },
            { name: "Boolean", checked: false },
            { name: "Class", checked: false },
            { name: "Constant", checked: false },
            { name: "Constructor", checked: false },
            { name: "Enum", checked: false },
            { name: "EnumMember", checked: false },
            { name: "Event", checked: false },
            { name: "Field", checked: false },
            { name: "File", checked: false },
            { name: "Function", checked: false },
            { name: "Interface", checked: false },
            { name: "Key", checked: false },
            { name: "Method", checked: true },
            { name: "Module", checked: false },
            { name: "Namespace", checked: false },
            { name: "Null", checked: false },
            { name: "Number", checked: false },
            { name: "Object", checked: false },
            { name: "Operator", checked: false },
            { name: "Package", checked: false },
            { name: "Property", checked: false },
            { name: "String", checked: false },
            { name: "Struct", checked: false },
            { name: "TypeParameter", checked: false },
            { name: "Variable", checked: false },
          ],
        };
      }

      if ($debug) {
        console.log("Saving Items");
        console.log($items);
      }

      let i;
      let p;
      let t;

      i = $items;
      p = $page;
      t = $tags;

      i.customSnippets.forEach((element) => {
        if (element.id.toString().includes("id:")) {
          let index = i.customSnippets.indexOf(element);
          console.log(index);
          i.customSnippets.splice(index, 1);
        }

        let findDuplicates = i.customSnippets.filter((item) => item.id === element.id);

        if (findDuplicates.length > 1) {
          if (debug) ErrorMessageVSCall("Duplicate codeblock found. Removing item.");
          let duplicateIndex = i.customSnippets.indexOf(findDuplicates[0]);
          i.customSnippets.splice(duplicateIndex, 1);
        }
      });

      if (i.customSnippets[0].id === "0") {
        console.warn("BAD STATE! Not saving. Please check your import file.");
        $items = originItems;
      } else {
        tsvscode.setState({ i, p, t });
        ExportCodeVSCall();
        console.log("STATE SET FROM HOME!");
      }
    } else {
      console.warn("BAD STATE!");
    }
  }

  // Before Render
  onMount(() => {
    //Prevent scrolling
    document.getElementById("home").parentElement.style.overflow = "hidden";
    
    let customSnippets =
[
   {
      id: "0",
      tempId:"",
      name: "test",
      code: "if(${1:condition} ||${1:condition}){${2:expression}})",
      language: "typescript",
      placeholders: [
         "condition",
         "expression"
      ],
      color: "white",
      visible: "",
      linkedBlocks: [],
      tags: [
         "tag1",
         "tag2"
      ]
   }
]

    $items = {
              customSnippets,
              vsSnippets: ["vsSnippets1", "vsSnippets2"],
              selectedTags: [""],
              settings: {
                isFuzzy: false,
                codeBlocksSaveLocation: "",
                codeBlocksSaveLocationBackup: "",
                codeMapSaveLocationRelative: "",
                searchCode: false,
                currentPanel: "",
                hideBlocksBar: false,
                showFolders: false,
                showFiles: true,
                showDefaultRelationship: true,
                showCustomRelationship: true,
                alwaysShowCodeBlockButtons: true,
                strictCodeMapOutlineWordMatch: false,
                mapEntireProject: false,
                colorCodetoMatchCodeBlocks: true,
                randomizeNewBlockColors: false,
                defaultBlockColor: "blue",
                codeMapFolderExclusion: "node_modules|packages",
                visibleOutlineBlocks: [
                  { name: "Array", checked: false },
                  { name: "Boolean", checked: false },
                  { name: "Class", checked: false },
                  { name: "Constant", checked: false },
                  { name: "Constructor", checked: false },
                  { name: "Enum", checked: false },
                  { name: "EnumMember", checked: false },
                  { name: "Event", checked: false },
                  { name: "Field", checked: false },
                  { name: "File", checked: false },
                  { name: "Function", checked: false },
                  { name: "Interface", checked: false },
                  { name: "Key", checked: false },
                  { name: "Method", checked: true },
                  { name: "Module", checked: false },
                  { name: "Namespace", checked: false },
                  { name: "Null", checked: false },
                  { name: "Number", checked: false },
                  { name: "Object", checked: false },
                  { name: "Operator", checked: false },
                  { name: "Package", checked: false },
                  { name: "Property", checked: false },
                  { name: "String", checked: false },
                  { name: "Struct", checked: false },
                  { name: "TypeParameter", checked: false },
                  { name: "Variable", checked: false },
                ],
              },
            };

            //Events that are called from TS files (aka calls back into the webview from VSCode)
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      let lastId = common.getNonce();
      switch (message.type) {
        case "add-code":
          if (message.value !== "") {
            let text = message.value.text;
            let filename = message.value.filename;
            $items.settings.currentPanel = "editMode";

            $editItem = {
              id: lastId,
              tempId: "",
              code: text,
              language: "",
              linkedBlocks: [],
              name: "New Name",
              placeholders: [],
              visible: "true",
              color: "white",
              tags: [""],
            };
            $editMode = {
              id: lastId,
              fileName: filename,
              importType: "addBlock",
            };
          }
          break;

        case "edit-code":
          if (message.value !== "") {
            let id = message.value.id;
            let filename = message.value.filename;

            $items.settings.currentPanel = "editMode";
            let editItemFound = $items?.customSnippets?.find((x) => x?.id === id);

            if (editItemFound) $editItem = editItemFound;

            $editMode = {
              id: id,
              fileName: filename,
              importType: "editBlock",
            };
            InfoMessageVSCall("Edit Mode started. Press cancel to return.");
          }
          break;

        case "update-lang":
          if (message.value !== "") {
            let langId = message.value;
            $editItem.language = langId;
          }
          break;

          case "create-folder-codeblock":
          if (message.value !== "") {
            let returnObj = message.value;
            AddFolderToCodeMap(returnObj);
          }
          break;

        //TODO:Figure out how to pass code and update respective tabstops
        // case 'edit-item-string-change':
        //     let changedCode = message.value;
        //     EditItemCodeChange(changedCode);
        //   break;

        //TODO: AI detect if block is found based on levenshtein.
        // case "code-compare":
        //   CodeCompare(message.value);
        //   break;

        case "import-vscode-snip":
          let text = message.value.text;
          let filename = message.value.filename;
          $items.settings.currentPanel = "editMode";

          $editItem = {
            id: lastId,
            tempId: "",
            code: text,
            language: "",
            linkedBlocks: [],
            name: "autofilled",
            placeholders: [],
            visible: "true",
            color: "white",
            tags: [""],
          };
          $editMode = {
            id: lastId,
            fileName: filename,
            importType: "vsSnippet",
          };

          break;

        case "filtered-tree":
          $codeMap = message.value;

          console.log($codeMap);
          break;

        case "selection-to-search":
          $searchTerm = message.value;
          break;

        case "selection-to-codeMap":
          $activeSelectionMeta.path = message.value.path;
          $activeSelectionMeta.startLine = message.value.startLine;
          $activeSelectionMeta.startCharacter = message.value.startCharacter;
          $activeSelectionMeta.endLine = message.value.endLine;
          $activeSelectionMeta.endCharacter = message.value.endCharacter;
          $activelySelectedText = message.value.searchString;
          $activePath = message.value.path;
          break;

        case "onActiveEditorChange":
          $codeMap.activeWindow.code = message.value.code ?? "";
          common.ColorCode(message.value.path);
          HideShowBlocks(message.value.path);
          CheckCodeBlocksAccuracy();

          break;

        case "code-from-active-window":
          let activeScreenCode = message.value;
          editScreen.SaveCodeFromEdit(activeScreenCode);
          break;

        case "code-vssnippet-from-active-window":
          let snippetCode = message.value;
          parseVSCodeSnippet.ParseVSCodeSnippet(snippetCode);
          break;

        case "add-placeholder":
          editScreen.CreateTabStop(message.value);
          break;
        
        case "on-drag-and-drop":
          let dragAndDropData = message.value;
          let path = dragAndDropData.path;
          let string = dragAndDropData.string;
          let name = dragAndDropData.name;

         

          $activeSelectionMeta.path = path;
          $activeSelectionMeta.startLine = "0";
          $activeSelectionMeta.startCharacter = "0";
          $activeSelectionMeta.endLine = "0";
          $activeSelectionMeta.endCharacter = "0";
          $activelySelectedText = name;
          $activeSelectionMeta.isStarred = true;
          $activePath = path;
          map.GenerateCodeBlockFromSelectedText(Sibling.Self);
          // map.ConvertGeneratedBlock();

          break

        case "import-code":
          if (message.value === "") {
            let customSnippets = [
              {
                id: "0",
                tempId: "",
                name: "test",
                code: "if(${1:condition} ||${1:condition}){${2:expression}})",
                language: "typescript",
                placeholders: ["condition", "expression"],
                color: "white",
                visible: "",
                linkedBlocks: [],
                tags: ["tag1", "tag2"],
              },
            ];

            $items = {
              customSnippets,
              vsSnippets: ["vsSnippets1", "vsSnippets2"],
              selectedTags: [""],
              settings: {
                isFuzzy: false,
                codeBlocksSaveLocation: "",
                codeBlocksSaveLocationBackup: "",
                codeMapSaveLocationRelative: "",
                searchCode: false,
                currentPanel: "codeBlocks",
                hideBlocksBar: false,
                showFolders: false,
                showFiles: true,
                showDefaultRelationship: true,
                showCustomRelationship: true,
                alwaysShowCodeBlockButtons: true,
                strictCodeMapOutlineWordMatch: false,
                mapEntireProject: false,
                colorCodetoMatchCodeBlocks: true,
                randomizeNewBlockColors: false,
                defaultBlockColor: "blue",
                codeMapFolderExclusion: "node_modules|packages",
                visibleOutlineBlocks: [
                  { name: "Array", checked: false },
                  { name: "Boolean", checked: false },
                  { name: "Class", checked: false },
                  { name: "Constant", checked: false },
                  { name: "Constructor", checked: false },
                  { name: "Enum", checked: false },
                  { name: "EnumMember", checked: false },
                  { name: "Event", checked: false },
                  { name: "Field", checked: false },
                  { name: "File", checked: false },
                  { name: "Function", checked: false },
                  { name: "Interface", checked: false },
                  { name: "Key", checked: false },
                  { name: "Method", checked: true },
                  { name: "Module", checked: false },
                  { name: "Namespace", checked: false },
                  { name: "Null", checked: false },
                  { name: "Number", checked: false },
                  { name: "Object", checked: false },
                  { name: "Operator", checked: false },
                  { name: "Package", checked: false },
                  { name: "Property", checked: false },
                  { name: "String", checked: false },
                  { name: "Struct", checked: false },
                  { name: "TypeParameter", checked: false },
                  { name: "Variable", checked: false },
                ],
              },
            };
          }
          else
          if (typeof message.value === "string") {
            try {
              $items = JSON.parse(message.value);
              if ($items.customSnippets)
              {
                $items.customSnippets.forEach((element) => {
                if (element.id.toString().includes("id:")) {
                  let index = $items.customSnippets.indexOf(element);
                  console.log(index);
                  $items.customSnippets.splice(index, 1);
                }
              });
              let settings = { codeMapFolderExclusion: $items.settings.codeMapFolderExclusion, mapEntireProject: $items.settings.mapEntireProject };
              tsvscode.postMessage({
                type: "GetFiles",
                value: settings,
              });
              }
             
            } catch (exception) {
              ErrorMessageVSCall("JSON Import Error");
              console.log(exception.message);
              $items = originItems;
            }
          } else {
            $items.customSnippets.forEach((element) => {
              if (element.id.toString().includes("id:")) {
                let index = $items.customSnippets.indexOf(element);
                console.log(index);
                $items.customSnippets.splice(index, 1);
              }
            });

            $items = message.value;
          }

          if ($debug) console.log($items);
          break;

        case "import-code-from-file":
          if (typeof message.value === "string") {
            $items = JSON.parse(message.value);
          } else {
            $items = message.value;
          }
          if ($debug) console.log($items);
          break;

        case "import-code-map-from-file":
          if (typeof message.value === "string") {
            $codeMap = JSON.parse(message.value);
          } else {
            $codeMap = message.value;
          }
          if ($debug) console.log($codeMap);
          break;

        case "changeNameMenu":
          let block = $codeMap.flatTree.find((block) => block.id === message.value.blockId);

          if (block) {
            block.name = message.value.newName;
          }
          break;

        case "PullSettingsFromConfig":
          $items.settings.codeMapSaveLocationRelative = message.value.codeMapSaveLocation;
        break;

        case "window-change":
          if ($codeMap !== null && $codeMap.activeWindow !== null) {
            $codeMap.activeWindow = { path: "", outline: {} };
          }
          let outineObject = JSON.parse(message.value.outline);

          $codeMap.activeWindow.path = message.value.path;
          $codeMap.activeWindow.outline = outineObject;

          if (!$codeMap.activeWindow.flatOutline) {
            $codeMap.activeWindow.flatOutline = [];
          }

          break;
      }
    });
  });

  //TODO:Figure out how to pass code and update respective tabstops
  // function EditItemCodeChange(code:string){
  //     let val = code.search($editItem.placeholders[0]);
  //     console.log(val);
  // }

  const HideShowBlocks = (path) => {
    $codeMap.flatTree.forEach((block) => {
      if (block.starred === false && block.path !== path) {
        block.visible = false;
      }

      if (block.path === path) {
        block.visible = true;
      }
    });
  };


  // All the methods for making calls to the VS backend
  const ExportCodeVSCall = () => {
    if ($debug) {
      console.log("Export Data Start!");
      console.log($items);
    }
  };

  function FullScreen() {
    if ($debug) console.log("Full Screen Mode!");
    tsvscode.postMessage({
      type: "fullScreen",
      value: $items,
    });
  }

  const InfoMessageVSCall = (message: any) => {
    tsvscode.postMessage({
      type: "onInfo",
      value: message,
    });
  };

  const ErrorMessageVSCall = (message: any) => {
    tsvscode.postMessage({
      type: "onError",
      value: message,
    });
  };

  const ShowSettings = () => {
    $items.settings.currentPanel = "settings";
    PullSettingsFromConfig();
  };

  const ShowCodeMap = () => {
    $items.settings.currentPanel = "codeMap";
  };

  const ShowCodeBlocks = () => {
    $items.settings.currentPanel = "codeBlocks";
  };

  function PullSettingsFromConfig(){
    tsvscode.postMessage({
      type: "PullConfigSettings",
      value: "",
    });
  }

  function PushSettingsToConfig(){

  }

  //This takes the folder path and gets all the files under it and creates code blocks from them
  const AddFolderToCodeMap = (returnObj) => {
    if ($debug) console.log("Add Folder to Code Map!");
    let foundBlocks: string[] = [];
    returnObj.folderName = returnObj.folderPath.split("/").pop();
    returnObj.folderPath = returnObj.folderPath.substring(1);
    returnObj.files.forEach((file) => {
      // let tempArray = file.path.split("\\");
      // tempArray.pop();
      // let folderPath = tempArray.join("/");
      // if (folderPath === returnObj.path) {
      //   foundBlocks.push(file);
      // }

      foundBlocks.push(file.path);

    });
    // let foundBlock = $codeMap.flatTree.find(x => x.path === path);
    if (foundBlocks?.length > 0){
      console.log(foundBlocks);

      //SENDING FOLDER FOR NOW UNTIL REFACTORING TO USE FILES!!!!!
      map.GenerateCodeBlockFromSelectedText(Sibling.Self, undefined, returnObj);

    }
  };

  // Every time user changes tabs, we need check the visible code blocks
  // and make sure code matches the lines stored on the blocks
  const CheckCodeBlocksAccuracy = () => {
    let activeWindowCode = $codeMap.activeWindow.code;

    $codeMap.flatTree.forEach((codeBlock) => {
      if (codeBlock.visible === true) {
        if (activeWindowCode.includes(codeBlock.code)) {
          var codeBlockLines = codeBlock.code.split("\n");
          let codeBlockFirstLine = codeBlockLines[0] === "" || codeBlockLines[0] ===  "\r" ? codeBlockLines[1] : codeBlockLines[0];
          let codeBlockLastLine =
            codeBlockLines[codeBlockLines.length - 1] === "" || codeBlockLines[codeBlockLines.length - 1] ===  "\r"
              ? codeBlockLines[codeBlockLines.length - 2]
              : codeBlockLines[codeBlockLines.length - 1];
          let foundStartLine = -1;
          let foundEndLine = -1;

          var lines = activeWindowCode.split("\n");
          for (var i = 0; i < lines.length; i++) {
            if (foundStartLine === -1 && lines[i].includes(codeBlockFirstLine)) {
              foundStartLine = i;
              let endval = foundStartLine + codeBlock.code.length;
            }

            if (foundEndLine === -1 && lines[i].includes(codeBlockLastLine)) {
              foundEndLine = i;
            }
          }

          if (foundStartLine !== -1 && foundEndLine !== -1) {
            codeBlock.startLine = foundStartLine.toString();
            codeBlock.endLine = foundEndLine.toString();
            //Check line numbers and update?
          } else {
            codeBlock.codeDiff = true;
            //Mark codeDiff = true;
          }
        }
      }
    });
  };
</script>

<main id="home">
  <Shared bind:this={common} />
  <ParseVSCodeSnippet bind:this={parseVSCodeSnippet} />
  <div hidden={$items.settings.currentPanel === "editMode" ? false : true}>
    <h1>EDIT MODE</h1>
    <EditScreen bind:this={editScreen} />
  </div>

  <div style="z-index:101; display:flex; justify-content: space-between;" hidden={$items.settings.currentPanel !== "editMode" ? false : true}>
    <h1 style="display: flex, align-items: center, justify-content: space-between; z-index:101;">
      CodeBlocks
    </h1>
    <div style="display: flex; justify-content: space-between; z-index:101;">
      <div>
        <span style="cursor: pointer; " on:click={() => ShowSettings()}
          ><Fa size="1x" icon={faCog} style="color:#007acc; padding-right: 4px; float:right; font-size: 3em;" />
        </span>
        <span style="cursor: pointer; " on:click={() => ShowCodeBlocks()}
          ><Fa size="1x" icon={faCubes} style="color:#007acc; padding-right: 4px; float:right; font-size: 3em;" />
        </span>
        <!-- <span style="cursor: pointer; " on:click={() => ShowCodeMap()}
          ><Fa size="1x" icon={faProjectDiagram} style="color:#007acc; padding-right: 4px; float:right" />
        </span> -->
      </div>
      	
      {#if importError === true}
        <div style="color:red;">
          JSON import error. Please fix your JSON file!
          <!-- <button on:click={() => DeleteUserSettings()}>JSON Import Error. Delete all user data?</button> -->
        </div>
      {/if}
    </div>
  </div>

  <div
    class={$items?.settings?.currentPanel === "codeBlocks" ? "containerHeader" : ""}
    hidden={$items?.settings?.currentPanel === "codeBlocks" ? false : true}
  >
    <div class="codeBlocksAndMapContainer">
      <div class={$items.settings.hideBlocksBar === true ? "" : "codeBlocksContainer"} hidden={$items?.settings?.hideBlocksBar}>
        <!-- PANEL -->
        <div class="container">
          <div id="code-container" class="code-container">
            <button on:click={() => ($items.settings.hideBlocksBar = true)} class={$items?.settings?.hideBlocksBar === true ? "hide" : ""} style="z-index:101;">
              <Fa icon={faChevronLeft} style="color:white;" />
            </button>
            <!-- not implemented yet -->
            <!-- TAGS ( Experimental )------------------------------------------------ -->
            <!-- <div style="display:flex; flex-direction: row;">
              <Tags />
              
            </div> -->
             <!-- /TAGS------------------------------------------------ -->
            <!-- <LinkedBlocks /> -->
            <!-- CODE BLOCKS ( Experimental )----------------------------------------------------- -->
              <!-- <Dnd {FullCodeSearch} /> -->
            <!-- / CODE BLOCKS----------------------------------------------------- -->

          </div>
        </div>
        <!-- CODE BLOCK BUTTONS ( Experimental ) --------------------------------------------- -->
          <!-- <div class="codeBlocksButtons">
            <div>
              <button class="tooltip" on:click={ExportCodeVSCall}
                >Export Code<span class="tooltiptext">Export JSON Code to chosen file. </span>
              </button>
            </div>
            <div>
              <button on:click={common.ImportCode}>Import Code </button>
            </div>
            <div>
              <button class="tooltip" on:click={parseVSCodeSnippet.ImportVSSnippet}
                >Import VS Snippet
                <span class="tooltiptext">Import selected text in the VSCode snippet format. Make sure json starts and ends with brackets.</span>
              </button>
            </div>
          </div> -->
        <!-- / CODE BLOCK BUTTONS --------------------------------------------- -->
        <!-- <div id="pocketAndMapGroups" class="pocketAndMapGroups" style="z-index:101;">
          <Pocket />
          <CodeMapGroups />
        </div>

        <div style="z-index:101;">
          <Outline />
        </div> -->
      </div>

      <button
        style="margin-right:10px; z-index:101;"
        on:click={() => ($items.settings.hideBlocksBar = false)}
        class={typeof $items.settings.hideBlocksBar === "undefined" || $items.settings.hideBlocksBar === false ? "hide" : ""}
      >
        <Fa icon={faChevronRight} style="color:white;" />
      </button>
      <!-- <CodeMap bind:this={map} /> -->
      <CodeMapMove bind:this={map} />
    </div>
  </div>
  <div hidden={$items?.settings?.currentPanel !== undefined ? ($items.settings.currentPanel === "settings" ? false : true) : true} style="z-index:101;">
    <SettingsScreen />
  </div>
</main>

<style>
  :global(body) {
    padding:1px;
  }

  .pocketAndMapGroups {
    display: flex;
    flex-direction: column;
    border: black;
    border-width: 1px;
    border-style: solid;
    min-height: 100px;
  }

  .codeBlocksAndMapContainer {
    display: flex !important;
    flex-direction: row;
  }

  .codeBlocksButtons {
    display: flex;
    flex-direction: row;
  }


  .codeBlocksContainer {
    width: 200px;
    display: flex;
    flex-direction: column;
    z-index: 101;
    background: #1e1e1e;
    border: #6cc0e8 solid 1px;
  }

  .containerHeader {
    display: flex;
    flex-direction: column;
  }

  .hide {
    visibility: hidden;
  }

  :global(.container) {
    display: flex; /* or inline-flex */
  }

  :global(.tooltip) {
    position: relative;
    display: inline-block;
    /* border-bottom: 1px dotted black; */
  }

  :global(input) {
    display: inline-block !important;
  }

  :global(.tooltip .tooltiptext) {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;

    /* Position the tooltip */
    position: absolute;
    top: -25px;
    left: -65px;
    z-index: 1;
  }

  :global(.tooltip:hover .tooltiptext) {
    visibility: visible;
  }

  :global(.code-container) {
    display: flex;
    flex-wrap: wrap;
  }

  :global(.item) {
    min-width: 200px;
  }

  :global(.colorInput) {
    /* max-height: 0px; */
    -webkit-transition: max-height 1s;
    -moz-transition: max-height 1s;
    transition: max-height 1s;
  }

  :global(.inputStyle) {
    background: #3c3c3c;
    margin-top: 3px;
    align-items: center;
  }

  :global(button) {
    width: auto;
    font-size: 12px;
  }

  :global(input) {
    font-size: 12px;
  }
</style>
