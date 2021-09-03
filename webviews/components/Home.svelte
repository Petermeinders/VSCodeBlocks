<script lang="ts">
  import Dnd from "./Dnd.svelte";
  import Tags from "./Tags.svelte";
  import { onMount } from "svelte";
  import { activelySelectedText, activePath, debug, editItem, editMode, items } from "../store";
  import { tags } from "../store";
  import { page } from "../store";
  import { codeMap } from "../store";
  import EditScreen from "./EditScreen.svelte";
  import levenshtein from "fast-levenshtein";
  import LinkedBlocks from "./LinkedBlocks.svelte";
  import { faCog, faCubes, faProjectDiagram } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import Canvas from "./CodeMap/Canvas.svelte";
  import type currentPanel from "./store.svelte";
import SettingsScreen from "./SettingsScreen.svelte";
import { values } from "lodash";
import Common from "./Common.svelte";


let common: Common;


  let SearchTerm: string = "";
  let FullCodeSearch: boolean = true;

  // $: $items.settings.currentPanel;

  $: {
    if ($items !== null && $items.customSnippets[0] !== undefined) {
      $items.customSnippets.map((item) => {
        item.tags = item.tags ?? [""];
      });

      $items.customSnippets.map((item) => {
        item.linkedBlocks = item.linkedBlocks ?? [];
      });

      if ($items.vsSnippets === null || typeof $items.vsSnippets === "undefined") {
        $items.vsSnippets = ["vsSnippets1", "vsSnippets2"];
      }

      if ($items.settings === null || typeof($items.settings) === "undefined" || typeof($items.settings.currentPanel) === "undefined" || typeof($items.settings.visibleOutlineBlocks) === "undefined") {
        $items.settings = {
          isFuzzy: false,
          searchCode: false,
          currentPanel: "codeBlocks",
          visibleOutlineBlocks: [
         {name: "Array", checked: false},
         {name: "Boolean", checked: false},
         {name: "Class", checked: false},
         {name: "Constant", checked: false},
         {name: "Constructor", checked: false},
         {name: "Enum", checked: false},
         {name: "EnumMember", checked: false},
         {name: "Event", checked: false},
         {name: "Field", checked: false},
         {name: "File", checked: false},
         {name: "Function", checked: false},
         {name: "Interface", checked: false},
         {name: "Key", checked: false},
         {name: "Method", checked: true},
         {name: "Module", checked: false},
         {name: "Namespace", checked: false},
         {name: "Null", checked: false},
         {name: "Number", checked: false},
         {name: "Object", checked: false},
         {name: "Operator", checked: false},
         {name: "Package", checked: false},
         {name: "Property", checked: false},
         {name: "String", checked: false},
         {name: "Struct", checked: false},
         {name: "TypeParameter", checked: false},
         {name: "Variable", checked: false}
      ]
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
        if (element.id.includes("id:")) {
          let index = i.customSnippets.indexOf(element);
          console.log(index);
          i.customSnippets.splice(index, 1);
        }
        // let findDuplicates = i.customSnippets.foreach(item => {
        //   if(i.customSnippets.filter())
        // })

        let findDuplicates = i.customSnippets.filter((item) => item.id === element.id);

        if (findDuplicates.length > 1) {
          if (debug) ErrorMessage("Duplicate codeblock found. Removing item.");
          let duplicateIndex = i.customSnippets.indexOf(findDuplicates[0]);
          i.customSnippets.splice(duplicateIndex, 1);
        }
      });

      if (i.customSnippets[0].id === "0") {
        console.warn("BAD STATE! Not saving. Please check your import file.");
      } else {
        tsvscode.setState({ i, p, t });
        ExportCode();
        console.log("STATE SET FROM HOME!");
      }
    } else {
      console.warn("BAD STATE!");
    }
  }

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      let lastId = getNonce();
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
            $editItem = $items?.customSnippets?.find((x) => x?.id === id);
            $editMode = {
              id: id,
              fileName: filename,
              importType: "editBlock",
            };
            InfoMessage("Edit Mode started. Press cancel to return.");
          }
          break;

        case "update-lang":
          if (message.value !== "") {
            let langId = message.value;
            $editItem.language = langId;
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

          //ParseVSCodeSnippet(text);
          break;

        case "filtered-tree":
          $codeMap = message.value;
        
          console.log($codeMap);
          break;

        case "selection-to-search":
          SearchTerm = message.value;
          break;

          case "selection-to-codeMap":
          $activelySelectedText = message.value.searchString;
          $activePath = message.value.path;
          break;

        case "code-from-active-window":
          let activeScreenCode = message.value;
          SaveCodeFromEdit(activeScreenCode);
          break;

        case "code-vssnippet-from-active-window":
          let snippetCode = message.value;
          ParseVSCodeSnippet(snippetCode);
          break;

        case "add-placeholder":
          CreateTabStop(message.value);
          break;

        case "import-code":
          if (typeof message.value === "string") {
            try {
              $items = JSON.parse(message.value);

              $items.customSnippets.forEach((element) => {
                if (element.id.includes("id:")) {
                  let index = $items.customSnippets.indexOf(element);
                  console.log(index);
                  $items.customSnippets.splice(index, 1);
                }
              });
              tsvscode.postMessage({
      type: "GetFiles",
      value: $items.settings.codeMapFolderExclusion,
    });
            } catch {
              ErrorMessage("JSON Import Error");
            }
          } else {
            $items.customSnippets.forEach((element) => {
              if (element.id.includes("id:")) {
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

          case "window-change":
            
              if (!$codeMap.activeWindow)
              {
                $codeMap.activeWindow = {path:"", outline:{}};
              }
               let outineObject = JSON.parse(message.value.outline);

                $codeMap.activeWindow.path = message.value.path;
                $codeMap.activeWindow.outline = outineObject;
            
          break;
      }
    });
  });

  function ParseVSCodeSnippet(text) {
    //TODO: add vscode message on parse failure.
    const vsSnip = JSON.parse(text);
    const snippetNumber = Object.keys(vsSnip).length;

    for (let snip in vsSnip) {
      const bodArray = vsSnip[snip].body;
      const description = vsSnip[snip].description;
      const prefix = vsSnip[snip].prefix;
      const name = snip;
      const body = bodArray.join("\n");
      let regex = /\$\{\d*:|\$\{\\d*\|/g;
      let placeholdersArray: any[] = [];

      bodArray.forEach((line) => {
        let str = line,
          re = regex,
          match;

        let openBrackets = [];

        while ((match = re.exec(str))) {
          openBrackets.push(match.index);
          //console.log(match.index); // logs 1 through 9
        }

        // let openBracket = regex.exec(line);

        if (openBrackets.length > 0) {
          openBrackets.forEach((bracket) => {
            if (bracket !== -1) bracket = ++bracket;

            if (bracket !== -1) {
              let closingBracket = findOpenParen(line, bracket);

              if (line[closingBracket] !== "}") closingBracket = --closingBracket;

              let snipValue = line.substring(bracket, ++closingBracket);

              const indexMinusOne = snipValue.length - 1;
              const cleanedSnip = snipValue.substring(3, indexMinusOne);
              console.log(cleanedSnip);

              placeholdersArray.push(cleanedSnip);
            }
          });
        }
      });

      let filteredArray = [...new Set(placeholdersArray)];

      let tags: string[] = [];
      if (Array.isArray(prefix)) {
        tags = prefix;
      }

      $editItem.tags.forEach((tag) => {
        tags.push(tag);
      });

      //let importItem = { id: getNonce(), name: name.substr(0, 25), code: body, language: "temp", placeholders: filteredArray, color: "white", visible: "true", tags: tags };
      let importItem = {
        id: getNonce(),
        tempId: "",
        linkedBlocks: [],
        name: name.substr(0, 25),
        code: body,
        language: $editItem.language,
        placeholders: filteredArray,
        color: "white",
        visible: "true",
        tags: tags,
      };

      $items.customSnippets.push(importItem);
      if ($debug) console.log(importItem);
    }

    InfoMessage("VSCode Snippet Imported!");
  }

  function findOpenParen(text: string, openPos) {
    let closePos = openPos;
    let counter = 1;
    while (counter > 0) {
      let c = text[++closePos];
      if (c == "{") {
        counter++;
      } else if (c == "}") {
        counter--;
      } else if (typeof c === "undefined") {
        return -1;
      }
    }
    return closePos;
  }

  function CheckExistingPlaceholders(item: item) {
    if (item.placeholders === null || typeof item.placeholders === "undefined" || item.placeholders.length === 0) {
      if ($debug) console.log("no placeholders");
      return -1;
    } else {
      if ($debug) console.log("Placeholders:" + item.placeholders.length);
      return item.placeholders.length;
    }
  }

  //TODO:Figure out how to pass code and update respective tabstops
  // function EditItemCodeChange(code:string){
  //     let val = code.search($editItem.placeholders[0]);
  //     console.log(val);
  // }

  function CreateTabStop(placeholderValue: string) {
    let item = $editItem;
    var lastNumber = CheckExistingPlaceholders(item);
    if (lastNumber === -1) {
      item.placeholders = [];
      lastNumber = 1;
    } else {
      lastNumber = ++lastNumber;
    }

    var selectedString = placeholderValue;

    if (selectedString === "") {
      return;
    }

    if ($debug) {
      console.log(selectedString);
      console.log(item.code);
    }

    var newCode = item.code.replaceAll(selectedString, "${" + lastNumber + ":" + selectedString + "}");
    // item.placeholders.push(selectedString);

    let newPlaceholder = $editItem.placeholders;
    newPlaceholder.push(selectedString.toString());
    let newItem = $editItem;

    newItem.placeholders = newPlaceholder;
    newItem.code = newCode;

    $editItem = { ...newItem };
    if ($debug) {
      console.log("New placeholder on new item.");
      console.log($editItem);
    }

    UpdateCodeWithNewTabStop();
  }

  function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function UpdateCodeWithNewTabStop() {
    tsvscode.postMessage({
      type: "UpdateCodeWithNewTabStop",
      value: $editItem.code,
    });
  }

  function ExportCode() {
    if ($debug) {
      console.log("Export Data Start!");
      console.log($items);
    }

    tsvscode.postMessage({
      type: "saveData",
      value: $items,
    });
  }



  function FullScreen() {
    if ($debug) console.log("Full Screen Mode!");
    tsvscode.postMessage({
      type: "fullScreen",
      value: $items,
    });
  }

  function ImportVSSnippet() {
    tsvscode.postMessage({
      type: "ImportVSCodeSnippet",
      value: $editMode,
    });
  }

  function InfoMessage(message: any) {
    tsvscode.postMessage({
      type: "onInfo",
      value: message,
    });
  }

  function ErrorMessage(message: any) {
    tsvscode.postMessage({
      type: "onError",
      value: message,
    });
  }

  function SaveCodeFromEdit(latesCode: string) {
    let existingBlock = $items?.customSnippets?.find((x) => x?.id === $editItem?.id);
    console.log(latesCode);
    if (existingBlock) {
      existingBlock.code = latesCode;
      const index = $items?.customSnippets.indexOf(existingBlock);
      $items.customSnippets.splice(index, 1);
      $items.customSnippets = [$editItem, ...$items.customSnippets];
      InfoMessage("Saved changes to ." + existingBlock.name);
    } else {
      $editItem.code = latesCode;
      $items.customSnippets = [$editItem, ...$items.customSnippets];
      InfoMessage("Added new codeblock.");
    }
  }

  function ShowSettings() {
    $items.settings.currentPanel = "settings" ;
  }

  function ShowCodeMap() {
    $items.settings.currentPanel = "codeMap";
  }

  const ShowCodeBlocks = () => {
    $items.settings.currentPanel = "codeBlocks";
  };

  let clicked = 0;
</script>

<main>
  <Common bind:this={common} />

   
  <div hidden={$items.settings.currentPanel === "editMode" ? false : true}>
    <h1>EDIT MODE</h1>
    <EditScreen />
  </div>
  <div hidden={$items.settings.currentPanel === "codeMap" ? false : true}>
  <div style="display: flex, align-items: center">
    <h1 style="display: flex, align-items: center, justify-content: space-between;">
      CodeMap
      <span style="cursor: pointer; " on:click={() => ShowSettings()}
        ><Fa size="1x" icon={faCog} style="color:#007acc; padding-right: 4px; float:right" />
      </span>
      <span style="cursor: pointer; " on:click={() => ShowCodeBlocks()}
        ><Fa size="1x" icon={faCubes} style="color:#007acc; padding-right: 4px; float:right" />
      </span>
    </h1>
  </div>
    <Canvas />
</div>
<div hidden={$items.settings.currentPanel === "settings" ? false : true}>
    <div style="display: flex, align-items: center">
      <h1 style="display: flex, align-items: center, justify-content: space-between;">
        Settings
        <span style="cursor: pointer; " on:click={() => ShowCodeBlocks()}
          ><Fa size="1x" icon={faCubes} style="color:#007acc; padding-right: 4px; float:right" />
        </span>
        <span style="cursor: pointer; " on:click={() => ShowCodeMap()}
          ><Fa size="1x" icon={faProjectDiagram} style="color:#007acc; padding-right: 4px; float:right" />
        </span>
      </h1>
    </div>
    <SettingsScreen />
  </div>
  <div hidden={$items.settings.currentPanel === "codeBlocks" ? false : true}>
     <!-- PANEL -->
     <div style="display: flex, align-items: center">
      <h1 style="display: flex, align-items: center, justify-content: space-between;">
        CodeBlocks
        <span style="cursor: pointer; " on:click={() => ShowSettings()}
          ><Fa size="1x" icon={faCog} style="color:#007acc; padding-right: 4px; float:right" />
        </span>
        <span style="cursor: pointer; " on:click={() => ShowCodeMap()}
          ><Fa size="1x" icon={faProjectDiagram} style="color:#007acc; padding-right: 4px; float:right" />
        </span>
      </h1>
    </div>
    <div class="container">
      <div class="code-container">
        <Tags />
        <LinkedBlocks />
        <Dnd {SearchTerm} {FullCodeSearch} />
      </div>
    </div>

    
  <!-- BUTTONS -->
    <div>
      <button class="tooltip" on:click={ExportCode}>Export Code<span class="tooltiptext">Export JSON Code to chosen file. </span> </button>
    </div>
    <div>
      <button on:click={common.ImportCode}>Import Code </button>
    </div>
    <div>
      <button class="tooltip" on:click={ImportVSSnippet}
        >Import VS Snippet
        <span class="tooltiptext">Import selected text in the VSCode snippet format. Make sure json starts and ends with brackets.</span>
      </button>
    </div>
  </div>

</main>

<style>
  :global(.container) {
    display: flex; /* or inline-flex */
  }

  :global(.tooltip) {
    position: relative;
    display: inline-block;
    /* border-bottom: 1px dotted black; */
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
</style>
