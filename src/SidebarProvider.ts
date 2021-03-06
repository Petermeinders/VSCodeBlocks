import { TextEncoder } from "util";
import * as vscode from "vscode";
import { getNonce } from "./getNonce";


export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) { }



  public LoadData() {
    vscode.commands.executeCommand("vsblocksnipets.importCodeFromFile", true);
  }


  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    this.LoadData();

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "SaveSettingsToFile": {
          if (!data.value) {
            return;
          }

          vscode.commands.executeCommand("vsblocksnipets.SaveSettingsToFile", data.value);
          break;
        }
        case "fullScreen": {
          if (!data.value) {
            return;
          }
          vscode.commands.executeCommand("workbench.action.toggleSidebarVisibility");
          vscode.commands.executeCommand("vsblocksnipets.startPanel", data.value);
          break;
        }
        case "UpdateCodeWithNewTabStop": {
          if (!data.value) {
            return;
          }
          


          vscode?.window?.activeTextEditor?.edit(builder => {
            const doc = vscode?.window?.activeTextEditor?.document;
            if (typeof (doc) !== 'undefined')
              builder.replace(new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end), data.value);
          });




          break;
        }
        case "ImportDataFromFile": {
          if (!data.value) {
            return;
          }

          vscode.commands.executeCommand("vsblocksnipets.importCodeFromFile", true);

          // vscode.workspace.openTextDocument(uri).then((document) => {
          //   let text = document.getText();
          break;
        }
        case "insertSnippet": {
          if (!data.value) {

            return;
          }
          const editor = vscode.window.activeTextEditor;
          const document = editor?.document;
          const cursorPos = editor?.selection.active as vscode.Position;
          var snip = new vscode.SnippetString(data.value);
          vscode.window.activeTextEditor?.insertSnippet(snip);

          //vscode.TextEdit.insert(cursorPos, data.value);
          // vscode.workspace.openTextDocument(uri).then((document) => {
          //   let text = document.getText();
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
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






  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );



    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="; img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource
      }; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}