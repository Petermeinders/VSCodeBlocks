import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import * as fs from "fs";
import { Console } from "console";
import * as dirTree from "directory-tree";

export class HellowWorldPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: HellowWorldPanel | undefined;

  public static readonly viewType = "hello-world";

  public readonly _panel: vscode.WebviewPanel;
  public readonly _extensionUri: vscode.Uri;
  public _disposables: vscode.Disposable[] = [];

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

      // And restrict the webview to only loading content from our extension's `media` directory.
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media"), vscode.Uri.joinPath(extensionUri, "out/compiled")],
    });

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

  public ReturnFileTree(filteredTree: any) {
    if (typeof HellowWorldPanel.currentPanel !== "undefined") {
      HellowWorldPanel.currentPanel._panel.webview.postMessage({
        type: "filtered-tree",
        value: filteredTree,
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
          let fileFolders = {folders:{}, files:[]};

          const filteredTree = dirTree(rootFolder.uri.fsPath);
          console.log(filteredTree);

          this.ReturnFileTree(filteredTree);

          // let files = vscode.workspace.fs.readDirectory(rootFolder.uri).then((files) => {
          //   files.forEach((file) => {
          //     let newstring = rootFolder.uri.fsPath+ "/" + file[0];
          //     const uri:vscode.Uri = vscode.Uri.file(newstring);
          //     vscode.workspace.workspaceFolders;
          //     // const stats = vscode.workspace.fs.stat(uri).then(stat =>{
          //     //     console.log(stat);
          //     // });

          //     if (file[1] === vscode.FileType.Directory) {
          //       let newFolder = {name:"", val:uri, subFolder:{}};
          //       newFolder.name = file[0];
          //       newFolder.val = uri;
          //       // newFolder.subFolder = 

          //       fileFolders.folders[file[0]] = newFolder;
          //       this.GetFilesInFolder(uri, fileFolders, newFolder.name);
          //       //console.log(uri);
          //       //console.log(vscode.workspace.workspaceFolders?.map(folder => folder.uri.path));
          //       console.log(fileFolders);
          //     }
          //   });
          // });

          //   => {
          //     files.forEach((file) => {
          //         const uri = vscode.Uri.file(file);
          //         console.log(uri);
          //     });
          // });

          //console.log("getfiles");
          break;
        }

        case "saveData": {
          if (!data.value) {
            return;
          }
          // // vscode.window.showInformationMessage(data.value.customSnippets);
          // const language = 'markdown';
          // const content = JSON.stringify(data.value);

          // let uri = vscode.Uri.file('%USERPROFILE%\.vscode\extensions');

          // const options: vscode.OpenDialogOptions = {
          //   canSelectMany: false,
          //   defaultUri: uri,
          //   openLabel: 'Select',
          //   canSelectFolders: false,
          //   canSelectFiles: true,

          // };

          // let fs = vscode.workspace.fs;
          // vscode.window.showOpenDialog(options).then((fileUri) => {
          //   let URI:vscode.Uri;
          //   if(typeof(fileUri) !== 'undefined')
          //   {
          //     URI = fileUri[0];

          //   let codeString = JSON.stringify(data.value);
          //   let uint8array = new TextEncoder().encode(codeString);
          //   fs.writeFile(URI, uint8array);

          //   }
          //   else{
          //     console.log("Error");
          //   }
          // });

          vscode.commands.executeCommand("vsblocksnipets.SaveDataToFile", data.value);

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