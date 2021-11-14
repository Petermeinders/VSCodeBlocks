<script lang="ts">
      import { activelySelectedText, activePath, activeSelectionMeta, debug, editItem, editMode, items, searchTerm } from "../../store";
      import Shared from "../Shared.svelte";


      let common: Shared;

      export const ImportVSSnippet = () => {
    tsvscode.postMessage({
      type: "ImportVSCodeSnippet",
      value: $editMode,
    });
  }


    export const ParseVSCodeSnippet = (text) => {
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
        id: common.getNonce(),
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

  function InfoMessage(message: any) {
    tsvscode.postMessage({
      type: "onInfo",
      value: message,
    });
  }
</script>