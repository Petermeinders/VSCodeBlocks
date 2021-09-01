import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import * as fs from "fs";
import { Console } from "console";
import * as dirTree from "directory-tree";
// import _ from 'lodash-es';
import deepdash from "deepdash";
import _ = require("lodash");
import * as util from "util";
import { isArray } from "lodash";

export class HellowWorldPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */

  public static currentPanel: HellowWorldPanel | undefined;

  public static readonly viewType = "hello-world";

  public readonly _panel: vscode.WebviewPanel;
  public readonly _extensionUri: vscode.Uri;
  public _disposables: vscode.Disposable[] = [];
  public static testobj = { children: [], containerName: "", detail: "", kind: 0, name: "", location: {}, range: {} };

  public static createOrShow(extensionUri: vscode.Uri, message: string) {
    // const column = vscode.window.activeTextEditor
    //   ? vscode.window.activeTextEditor.viewColumn
    //   : undefined;

    const column = 2;

    // If we already have a panel, show it.
    if (HellowWorldPanel.currentPanel) {
      //HellowWorldPanel.currentPanel._panel.reveal(column);
      HellowWorldPanel.currentPanel._update();

      if (message !== "") {
        HellowWorldPanel.currentPanel._panel.webview.postMessage({
          type: "add-code",
          value: message,
        });
      }

      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(HellowWorldPanel.viewType, "CodeBlocks", column || vscode.ViewColumn.One, {
      // Enable javascript in the webview
      enableScripts: true,
      retainContextWhenHidden: true,

      // And restrict the webview to only loading content from our extension's `media` directory.
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media"), vscode.Uri.joinPath(extensionUri, "out/compiled")],
    });

    panel.onDidChangeViewState(
      e => {
        const panel = e.webviewPanel;
        console.log(panel);
      },
      null,
    );

    HellowWorldPanel.currentPanel = new HellowWorldPanel(panel, extensionUri);
    if (message !== "") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "add-code",
        value: message,
      });
    }
  }

  public static delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static addPanelCode(text: string, filename: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      let editObject = { text, filename };
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "add-code",
        value: editObject,
      });
    }
  }

  public static importVSCodeSnippet(text: string, filename: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      let editObject = { text, filename };
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "import-vscode-snip",
        value: editObject,
      });
    }
  }

  public static addPanelCodeEditMode(id: string, filename: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      let editObject = { id, filename };
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "edit-code",
        value: editObject,
      });
    }
  }

  public static updateLanguage(langId: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "update-lang",
        value: langId,
      });
    }
  }

  public static addPlaceHolder(value: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "add-placeholder",
        value: value,
      });
    }
  }

  public static PassCodeToWindow(items: any) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "import-code",
        value: items,
      });
    } else {
      console.log("error");
    }
  }

  public static PassActiveWindow(path, outline) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined" && typeof outline !== "undefined") {
      // let outlineString = JSON.stringify(newoutline);
      // let finalOutlinnee = HellowWorldPanel.CloneOutline(outline);

      const _ = require("lodash");
      require("deepdash")(_);

      let newList = _.pickDeep(outline, ["children", "name", "kind", "containerName", "location", "range", "uri", "path", "_start", "_end", "_character", "_line" ]);


      _.eachDeep(newList, (value, key, parentValue, context) => {
        if (typeof value === "object" && typeof(value.name) !== 'undefined') {
          value.id = getNonce();
        }
      })
 
      let newobj = _.cloneDeep(outline[0]);


      newobj.toJSON = function () {};


      // let newoutlinething = _.eachDeep(newobj, (value, key, parentValue, context) => {
      //     if (parentValue.toJSON !== 'undefined')
      //     {
      //       parentValue.toJSON =  function () {
      //            return { children:this.children, name: this.name, kind: this.kind, location: this.location, containerName: this.containerName };
      //         };
      //     }
      // });


      let newjson = JSON.stringify(newList);

      //    let testobj = {};

      // testobj.children = newChildren;
      // testobj.containerName = outline.containerName;
      // testobj.detail = outline.detail;
      // testobj.kind = outline.kind;
      // testobj.name = outline.name;
      // testobj.location = outline.location;
      // testobj.range = outline.range;

     // let outlineString = JSON.stringify(newobj);

      let activeWindow = { path: path, outline: newjson };
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "window-change",
        value: activeWindow,
      });
    } else {
      console.log("error or empty window selected");
    }
  }

  public static CloneOutline(newoutline) {
    if (isArray(newoutline)) {
      newoutline.forEach((child) => {
        HellowWorldPanel.testobj.children = child.children;
        HellowWorldPanel.testobj.containerName = child.containerName;
        HellowWorldPanel.testobj.detail = child.detail;
        HellowWorldPanel.testobj.kind = child.kind;
        HellowWorldPanel.testobj.name = child.name;
        HellowWorldPanel.testobj.location = child.location;
        HellowWorldPanel.testobj.range = child.range;

        if (child.children.length > 0) {
          this.CloneOutline(HellowWorldPanel.testobj);
        }
      });
    } else {
    }
  }

  public static CodeMapToWindow(items: any) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "import-code-map-from-file",
        value: items,
      });
    } else {
      console.log("error");
    }
  }

  public static GetCodeFromEditScreen(value: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "code-from-active-window",
        value: value,
      });
    }
  }

  public static GetCodeFromEditScreenForSnippet(value: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "code-vssnippet-from-active-window",
        value: value,
      });
    }
  }

  public static GetOutline(path) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      let uri = vscode.window.activeTextEditor.document.uri;

      vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", uri).then((outline) => {
        console.log(outline);
        HellowWorldPanel.PassActiveWindow(path, outline);

        // let range = outline[0].children[1].children[0].range;
        // vscode.workspace.openTextDocument(uri).then(y => {
        //  y.getText(range);
        // })
      });
    }
  }

  //TODO:Figure out how to pass code and update respective tabstops
  // public static PassEditItemChange(code: string){
  //   if (typeof (HellowWorldPanel.currentPanel) !== 'undefined') {
  //     HellowWorldPanel.currentPanel._panel.webview.postMessage({
  //       type: 'edit-item-string-change',
  //       value: code,
  //     });
  //   });
  // }

  //TODO: AI detect if block is found based on levenshtein.
  // public static PasCodeChangeToWindow(code: string) {
  //   if (typeof (HellowWorldPanel.currentPanel) !== 'undefined') {
  //     HellowWorldPanel.currentPanel._panel.webview.postMessage({
  //       type: 'code-compare',
  //       value: code,
  //     });
  //     return true;

  //   }

  // }

  public static PassSearchStringToWindow(searchString: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "selection-to-search",
        value: searchString,
      });
      return true;
    }
  }

  public static PassSelectionToCodeMap(searchString: string) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "selection-to-codeMap",
        value: searchString,
      });
      return true;
    }
  }

  public static GetActiveEditor(hasText: any) {
    let editor = vscode.window.activeTextEditor;
    let viewColum = vscode?.window?.visibleTextEditors[0]?.viewColumn;
    let text;

    if (!editor) editor = vscode?.window?.visibleTextEditors[0];

    if (hasText) {
      text = editor.document.getText(editor.selection);

      if (text === "" && vscode?.window?.visibleTextEditors.length > 1) {
        editor = vscode?.window?.visibleTextEditors[1];
        viewColum = vscode?.window?.visibleTextEditors[1]?.viewColumn;
      }
    }
    if (editor.document.fileName === "tasks" && vscode?.window?.visibleTextEditors.length > 1) {
      if (typeof vscode?.window?.visibleTextEditors[0]?.viewColumn === "undefined") return vscode?.window?.visibleTextEditors[1];
    }

    if (!editor) {
      vscode.window.showInformationMessage("no active window");
      return;
    }
    return editor;
  }

  public static kill() {
    HellowWorldPanel.currentPanel?.dispose();
    HellowWorldPanel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    HellowWorldPanel.currentPanel = new HellowWorldPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // // Handle messages from the webview
    // this._panel.webview.onDidReceiveMessage(
    //   (message) => {
    //     switch (message.command) {
    //       case "alert":
    //         vscode.window.showErrorMessage(message.text);
    //         return;
    //     }
    //   },
    //   null,
    //   this._disposables
    // );
  }

  public ReturnFileTree(codeMap: any) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "filtered-tree",
        value: codeMap,
      });
    } else {
      console.log("tree error");
    }
  }

  public GetFilesInFolder(uri: vscode.Uri, fileFolders, prevFolderName) {
    // const filteredTree = dirTree("/some/path", { extensions: /\.txt/ });
    // vscode.workspace.fs.readDirectory(uri).then((files) => {
    //   files.forEach((file) => {
    //     let newstring = uri.fsPath+ "/" + file[0];
    //     if (file[1] === vscode.FileType.Directory) {
    //       //FOLDER
    //       //console.log("folder: " + file[0]);
    //       const newURI = vscode.Uri.file(newstring);
    //       let newFolder = {name:"", val:uri, subFolder:{}};
    //       newFolder.name = file[0];
    //       newFolder.val = uri;
    //       // newFolder.subFolder =
    //       fileFolders.folders[prevFolderName].subFolder[file[0]] = newFolder;
    //       this.GetFilesInFolder(newURI, fileFolders, file[0]);
    //     }
    //     else{
    //       //FILE
    //       //console.log("file: " + file[0]);
    //     }
    //   });
    // });
  }

  public dispose() {
    HellowWorldPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);
    webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }

        case "insertSnippet": {
          if (!data.value) {
            return;
          }
          let editor = vscode.window.activeTextEditor;
          if (typeof editor === "undefined") {
            editor = vscode.window.visibleTextEditors[0];
          }
          const document = editor?.document;
          const cursorPos = editor?.selection.active as vscode.Position;
          var snip = new vscode.SnippetString(data.value);
          editor.insertSnippet(snip);

          //vscode.TextEdit.insert(cursorPos, data.value);
          // vscode.workspace.openTextDocument(uri).then((document) => {
          //   let text = document.getText();
          break;
        }

        case "createTabStop": {
          if (!data.value) {
            return;
          }
          vscode.commands.executeCommand("vsblocksnipets.addPlaceholder");
          break;
        }

        case "GetFiles": {
          //vscode.commands.executeCommand("vsblocksnipets.addPlaceholder");
          let rootFolder = vscode.workspace.workspaceFolders[0];
          let fileFolders = { folders: {}, files: [] };

          const filteredTree = dirTree(rootFolder.uri.fsPath, { exclude: new RegExp(/node_modules|\.git/) });

          const _ = require("lodash");
          require("deepdash")(_);
          let i = 0;

          let filtrate = _.eachDeep(filteredTree, (value, key, parentValue, context, options = { pathFormat: "array" }) => {
            if (typeof value === "object" && !Array.isArray(value)) {
              value.id = i;
              i = ++i;

              if (!value.x1) {
                value.x1 = 0;
                value.y1 = 0;
                value.x2 = 0;
                value.y2 = 0;
              }

              if (value.children) {
                value.children.forEach((child) => {
                  child.parentId = value.id;
                });
              }

              if (!value.locationX) {
                value.locationX = 0;
                value.locationY = 0;
              }

              if (typeof value.visible === "undefined") {
                value.visible = false;
              }

              // vscode.workspace.openTextDocument()
              // vscode.workspace.
              // vscode.languages.registerReferenceProvider()
              // let fold = vscode.languages.registerFoldingRangeProvider();
              // vscode.FoldingRangeProvider.provideFoldingRanges()
              // vscode.workspace.fs.readFile()
            }
          });

          // let uri = vscode.workspace.textDocuments[0].uri;

          // vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", uri).then(x => {
          // 	console.log(x);
          // 	let range = x[0].children[1].children[0].range;
          // 	// vscode.workspace.openTextDocument(uri).then(y => {
          // 	// 	y.getText(range);
          // 	// })
          // });

          let codeMap = { canvas: {}, pocket: [], activeWindow: {} };

          codeMap.canvas = filtrate;
          codeMap.pocket = [];
          codeMap.activeWindow = {};
          // TreeObj.settings;
          console.log("Filtrate", codeMap);

          // console.log(filteredTree);

          this.ReturnFileTree(codeMap);

          break;
        }

        case "saveData": {
          if (!data.value) {
            return;
          }

          vscode.commands.executeCommand("vsblocksnipets.SaveDataToFile", data.value);

          break;
        }

        case "saveCodeMap": {
          if (!data.value) {
            return;
          }

          vscode.commands.executeCommand("vsblocksnipets.SaveCodeMapToFile", data.value);

          break;
        }

        case "showSidebar": {
          if (!data.value) {
            return;
          }
          vscode.commands.executeCommand("workbench.action.closeActiveEditor");
          vscode.commands.executeCommand("workbench.action.toggleSidebarVisibility");
          vscode.commands.executeCommand("vsblocksnipets.passBlocksToSidebar", data.value);
          //      vscode.commands.executeCommand("vsblocksnipets.startPanel", data.value);

          break;
        }

        case "addCodeBlockFromSelection": {
          if (!data.value) {
            return;
          }
          vscode.commands.executeCommand("vsblocksnipets.addCode");
          //      vscode.commands.executeCommand("vsblocksnipets.startPanel", data.value);

          break;
        }

        case "GetCodeFromEditScreen": {
          if (!data.value) {
            return;
          }
          let editor = HellowWorldPanel.GetActiveEditor(false);

          if (!editor) {
            vscode.window.showInformationMessage("no active window");
            return;
          }

          let text = editor.document.getText();
          let viewColum = editor.viewColumn;

          let code = editor.document.getText();
          HellowWorldPanel.GetCodeFromEditScreen(code);
          //vscode.commands.executeCommand("vsblocksnipets.GetCodeFromEditScreen");
          //      vscode.commands.executeCommand("vsblocksnipets.startPanel", data.value);

          break;
        }

        case "ConvertSnippetToBlock": {
          if (!data.value) {
            return;
          }
          let editor = HellowWorldPanel.GetActiveEditor(false);

          if (!editor) {
            vscode.window.showInformationMessage("no active window");
            return;
          }

          let text = editor.document.getText();
          let viewColum = editor.viewColumn;

          let code = editor.document.getText();
          HellowWorldPanel.GetCodeFromEditScreenForSnippet(code);
          //vscode.commands.executeCommand("vsblocksnipets.GetCodeFromEditScreen");
          //      vscode.commands.executeCommand("vsblocksnipets.startPanel", data.value);

          break;
        }

        case "ImportVSCodeSnippet": {
          if (!data.value) {
            return;
          }
          vscode.commands.executeCommand("vsblocksnipets.importVSCodeSnippet");
          //      vscode.commands.executeCommand("vsblocksnipets.startPanel", data.value);

          break;
        }

        case "closeEditWindow": {
          if (!data.value) {
            return;
          }

          //let filename = vscode.window.visibleTextEditors[0]?.document.fileName;
          let filename = HellowWorldPanel.GetActiveEditor(false)?.document.fileName;
          let doc = HellowWorldPanel.GetActiveEditor(false)?.document;

          if (filename === data.value.fileName) {
            if (filename === "HelloWorld") {
              doc = vscode?.window?.visibleTextEditors[1]?.document;
              vscode.window.showTextDocument(doc);
              vscode.commands.executeCommand("workbench.action.revertAndCloseActiveEditor");
            } else {
              //doc = vscode?.window?.visibleTextEditors[0]?.document;
              //vscode.window.showTextDocument(doc);
              vscode.commands.executeCommand("workbench.action.focusFirstEditorGroup");
              await HellowWorldPanel.delay(300);
              vscode.commands.executeCommand("workbench.action.revertAndCloseActiveEditor");
            }
          }
          break;
        }

        case "ImportDataFromFile": {
          if (!data.value) {
            return;
          }

          vscode.commands.executeCommand("vsblocksnipets.importCodeFromFile", false);

          // vscode.workspace.openTextDocument(uri).then((document) => {
          //   let text = document.getText();
          break;
        }

        case "LoadCodeMapFromFile": {
          if (!data.value) {
            return;
          }

          vscode.commands.executeCommand("vsblocksnipets.loadCodeMapFromFile", false);

          // vscode.workspace.openTextDocument(uri).then((document) => {
          //   let text = document.getText();
          break;
        }

        case "OpenFile": {
          if (!data.value) {
            return;
          }



          let viewColum = vscode?.window?.visibleTextEditors[0]?.viewColumn;

          let fileURI = vscode.Uri.file(data.value.path);
          vscode.workspace.openTextDocument(fileURI).then((document) => {
            vscode.window.showTextDocument(document, viewColum).then(editor => {
              
            if (data.value.type === "outline")
            {
              let range = editor.document.lineAt(data.value.startLine).range;
              editor.selection =  new vscode.Selection(range.start, range.end);
              editor.revealRange(range);
            }
            });

          });

         

          //   let text = document.getText();
          break;
        }

        case "editCode": {
          if (!data.value) {
            return;
          }
          let filename = vscode?.window?.visibleTextEditors[0]?.document.fileName;
          vscode.commands.executeCommand("vsblocksnipets.editCode", data.value.code, data.value.id, data.value.language);

          // vscode.workspace.openTextDocument(uri).then((document) => {
          //   let text = document.getText();
          break;
        }

        case "UpdateCodeWithNewTabStop": {
          if (!data.value) {
            return;
          }

          let editor = vscode.window.activeTextEditor;
          let viewColum = vscode?.window?.visibleTextEditors[0]?.viewColumn;

          if (!editor) editor = vscode?.window?.visibleTextEditors[0];

          if (!editor) {
            vscode.window.showInformationMessage("no active window");
            return;
          }

          editor.edit((builder) => {
            const doc = editor?.document;
            if (typeof doc !== "undefined")
              builder.replace(new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end), data.value);
          });

          break;
        }

        case "UpdateCodeOnPlaceHolderChange": {
          if (!data.value) {
            return;
          }

          let doc = vscode?.window?.activeTextEditor?.document;
          let window = vscode?.window?.activeTextEditor;

          if (typeof doc === "undefined") {
            doc = vscode?.window?.visibleTextEditors[0]?.document;
            window = vscode?.window?.visibleTextEditors[0];
            if (typeof doc === "undefined") {
              //console.log(vscode.window.visibleTextEditors[0].document.fileName);
              doc = vscode?.window?.visibleTextEditors[1]?.document;
              window = vscode?.window?.visibleTextEditors[1];
            }
          }

          window?.edit((builder) => {
            if (typeof doc !== "undefined")
              builder.replace(new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end), data.value);
          });
          break;
        }

        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        // case "tokens": {
        //   await Util.globalState.update(accessTokenKey, data.accessToken);
        //   await Util.globalState.update(refreshTokenKey, data.refreshToken);
        //   break;
        // }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out/compiled", "HelloWorld.js")
      // vscode.Uri.joinPath(this._extensionUri, "media", "compiled/main.js")
    );

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, "media", "reset.css");
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css");

    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css"));

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
    // const cssUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "out", "compiled/swiper.css")
    // );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
        const tsvscode = acquireVsCodeApi();
      </script>
			</head>
      <body>
			</body>
            <script src="${scriptUri}" nonce="${nonce}">
			</html>`;
  }
}
