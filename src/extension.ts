import { HellowWorldPanel } from './HelloWorldPanel';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { TextDecoder } from 'util';
import { stringify } from 'querystring';

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


	function delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}


	vscode.window.onDidChangeTextEditorSelection((event: vscode.TextEditorSelectionChangeEvent) => {
		
			//console.log(event.textEditor.selection);
			(async () => { 
				let text1 = event.textEditor.document.getText(event.textEditor.selection);
		
				await delay(300);

				let text = event.textEditor.document.getText(event.textEditor.selection);
				
				if(text !== null && text !== 'undefined' && text !== "" && text1 === text){
					console.log('after delay: ' + text);

					const wentToWindow = HellowWorldPanel.PassSearchStringToWindow(text);
					if(!wentToWindow)
					{
						sidebarProvider._view?.webview.postMessage({
							type: 'selection-to-search',
							value: text,
						});
					}
				}
			})();

			
		
	});

	


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.startPanel', (items) => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			// vscode.window.showInformationMessage('Hello World!! from VSBlockSnipets!');
			//vscode.window.showInputBox({value:"test"});

			HellowWorldPanel.createOrShow(context.extensionUri, "");
			vscode.commands.executeCommand("vsblocksnipets.passBlocksToWindow", items);
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
			// vscode.window.showInformationMessage(vscode.NotebookCellStatusBarItem.name);

			sidebarProvider._view?.webview.postMessage({
				type: 'add-code',
				value: text,
			});

			HellowWorldPanel.addPanelCode(text);

		}));


	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.importCode', (items) => {
			console.log("Passed Items:");
			console.log(items);

			const { activeTextEditor } = vscode.window;

			// if (!activeTextEditor) {
			// 	vscode.window.showInformationMessage("no active window");
			// 	return;
			// }
			if (typeof (activeTextEditor) !== 'undefined') {
				const text = activeTextEditor.document.getText(activeTextEditor.selection);
				vscode.window.showInformationMessage(text);
				

				if (items !== null && typeof (items) !== "undefined") {
					HellowWorldPanel.PassCodeToWindow(items);
				}
				else {
					sidebarProvider._view?.webview.postMessage({
						type: 'import-code',
						value: text,
					});
				}
			}

		}));


	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.importCodeFromFile', (fromSidebar) => {
			console.log("Importing Code From File:");

			//const { activeTextEditor } = vscode.window;

			// if (!activeTextEditor) {
			// 	vscode.window.showInformationMessage("no active window");
			// 	return;
			// }
			// await vscode.commands.executeCommand("workbench.action.closeSidebar");


			let uri = vscode.Uri.file('%USERPROFILE%\.vscode\extensions');

			const options: vscode.OpenDialogOptions = {
				canSelectMany: false,
				defaultUri: uri,
				openLabel: 'Select',
				canSelectFolders: false,
				canSelectFiles: true,

			};

			let fs = vscode.workspace.fs;
			let fileString;
			vscode.window.showOpenDialog(options).then((fileUri) => {
				if (typeof (fileUri) !== 'undefined') {
					let URI: vscode.Uri;
					URI = fileUri[0];

					fs.readFile(URI).then(data => {
						fileString = new TextDecoder().decode(data, { stream: true });

						if (fromSidebar) {
							sidebarProvider._view?.webview.postMessage({
								type: 'import-code-from-file',
								value: fileString,
							});
						}
						else {
							// const text = activeTextEditor.document.getText(activeTextEditor.selection);
							// vscode.window.showInformationMessage(text);

							HellowWorldPanel.PassCodeToWindow(fileString);
						}
					});
				}
			});
		}));


	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.passBlocksToWindow', (items) => {
			console.log("Passed Items:");
			console.log(items);

			const newString = JSON.stringify(items);


			HellowWorldPanel.PassCodeToWindow(newString);

		}));

		context.subscriptions.push(
			vscode.commands.registerCommand('vsblocksnipets.passBlocksToSidebar', (items) => {
				console.log("Passed Items:");
				console.log(items);
	
				const newString = JSON.stringify(items);

				sidebarProvider._view?.webview.postMessage({
					type: 'import-code',
					value: items,
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
