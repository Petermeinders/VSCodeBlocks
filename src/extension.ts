import { HellowWorldPanel } from './HelloWorldPanel';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "vsblocksnipets" is now active!');



	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"vsblocksnipets-sidebar",
			sidebarProvider
		)
	);

	const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
		item.text = "$(beaker) Add Code";
		item.command = "vsblocksnipets.addCode";
		item.show();


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.helloWorld', () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			vscode.window.showInformationMessage('Hello World!! from VSBlockSnipets!');
			//vscode.window.showInputBox({value:"test"});

			// var inputbox = vscode.window.createInputBox();
			// inputbox.
			// inputbox.show();

			// vscode.workspace.sett.

			HellowWorldPanel.createOrShow(context.extensionUri);

			// var snip = new vscode.SnippetString("for (const ${2:element} of ${1:array}) {\", \"\t$0\", \"}");
			// vscode.window.activeTextEditor?.insertSnippet(snip);

			
		}));

		

	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.addCode', () => {
			const { activeTextEditor } = vscode.window;

			if (!activeTextEditor) {
				vscode.window.showInformationMessage("no active window");
				return;
			}
			const text = activeTextEditor.document.getText(activeTextEditor.selection);
			vscode.window.showInformationMessage(text);

			sidebarProvider._view?.webview.postMessage({
				type: 'add-code',
				value:text,
			});

		}));

		
	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.importCode', () => {
			const { activeTextEditor } = vscode.window;

			if (!activeTextEditor) {
				vscode.window.showInformationMessage("no active window");
				return;
			}
			const text = activeTextEditor.document.getText(activeTextEditor.selection);
			vscode.window.showInformationMessage(text);

			sidebarProvider._view?.webview.postMessage({
				type: 'import-code',
				value:text,
			});

		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.refresh', async () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			vscode.window.showInformationMessage('Hello World!! from VSBlockSnipets!');
			await vscode.commands.executeCommand("workbench.action.closeSidebar");
			await vscode.commands.executeCommand("workbench.view.extension.vsblocksnipets-sidebar-view");

			// HellowWorldPanel.kill();
			// HellowWorldPanel.createOrShow(context.extensionUri);
		})
	);


	context.subscriptions.push(
		vscode.commands.registerCommand("vsblocksnipets.askQuestion", async () => {
			const answer = await vscode.window.showInformationMessage(
				"How was your day?",
				"Good",
				"Bad"
			);

			if (answer === "Bad") {
				vscode.window.showInformationMessage('Sorry to hear that!');
			}
			else {
				console.log({ answer });
			}
		}));
}

// this method is called when your extension is deactivated
export function deactivate() { }
