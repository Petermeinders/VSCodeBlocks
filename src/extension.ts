import { HellowWorldPanel } from './Panel';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { TextDecoder, TextEncoder } from 'util';
import { stringify } from 'querystring';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// This function of code will only be executed once when your extension is activated

	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"vsblocksnipets-sidebar",
			sidebarProvider
		)
	);

	//Run extension on vscode start!
	vscode.commands.executeCommand("vsblocksnipets.startPanelWithoutItems");

	const item2 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	item2.text = "$(beaker) CodeBlocks";
	item2.command = "vsblocksnipets.startPanelWithoutItems";
	item2.show();

	function delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	vscode.window.onDidChangeActiveTextEditor(event => {
		if (event) {
			console.log(event.document.isClosed);
			//console.log(event.document.isUntitled);
			// (async () => {
			// 	console.log("TextEditor CHANGED!");
			// })();
		}

	});


	vscode.window.onDidChangeTextEditorSelection((event: vscode.TextEditorSelectionChangeEvent) => {

		//console.log(event.textEditor.selection);
		(async () => {
			let text1 = event.textEditor.document.getText(event.textEditor.selection);
			//TODO: AI detect if block is found based on levenshtein.
			// let code = event.textEditor.document.getText();
			// HellowWorldPanel.PasCodeChangeToWindow(text1);

			//TODO:Figure out how to pass code and update respective tabstops
			//const currentItem = HellowWorldPanel.PassEditItemChange(code);

			await delay(300);

			let text = event.textEditor.document.getText(event.textEditor.selection);

			if (text !== null && text !== 'undefined' && text1 === text) {
				//console.log('after delay: ' + text);

				const wentToWindow = HellowWorldPanel.PassSearchStringToWindow(text);
				if (!wentToWindow) {
					sidebarProvider._view?.webview.postMessage({
						type: 'selection-to-search',
						value: text,
					});
				}
			}
		})();

	});



	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.SaveDataToFile', (data) => {
			// vscode.window.showInformationMessage(data.value.customSnippets);

			//TODO: Need this check anymore?
			data.customSnippets.forEach((element) => {
				if (element.id.includes("id:")) {
					let index = data.customSnippets.indexOf(element);
					throw TypeError("Guess this is still used....");
					console.log(index);
					data.customSnippets.splice(index, 1);
				}
			});

			const config = vscode.workspace.getConfiguration('vsblocksnipets');
			const saveLocation = config.get('codeBlockSaveLocation');

			let fs = vscode.workspace.fs;

			if (typeof (data) === 'undefined') {
				console.log("data is null. can't save null data.");
				return;
			}

			if (saveLocation === "testvalue") {
				let uri = vscode.Uri.file('%USERPROFILE%\.vscode\extensions');

				const options: vscode.OpenDialogOptions = {
					canSelectMany: false,
					defaultUri: uri,
					openLabel: 'Select',
					canSelectFolders: false,
					canSelectFiles: true,

				};

				vscode.window.showOpenDialog(options).then((fileUri) => {
					let URI: vscode.Uri;
					if (typeof (fileUri) !== 'undefined') {
						URI = fileUri[0];

						let codeString = JSON.stringify(data);
						let uint8array = new TextEncoder().encode(codeString);
						fs.writeFile(URI, uint8array);

					}
					else {
						console.log("Error");
					}
				});
			}
			else {
				//vscode.window.showInformationMessage("Saving JSON:  " + saveLocation);
				let URI = vscode.Uri.file(<string>saveLocation);
				if (typeof (saveLocation) !== 'undefined') {

					let codeString = JSON.stringify(data);
					let uint8array = new TextEncoder().encode(codeString);
					fs.writeFile(URI, uint8array);

				}
				else {
					console.log("Error saving file");
				}
			}
		}));


		context.subscriptions.push(
			vscode.commands.registerCommand('vsblocksnipets.SaveCodeMapToFile', (data) => {
				// vscode.window.showInformationMessage(data.value.customSnippets);
	
				const config = vscode.workspace.getConfiguration('vsblocksnipets');
				const saveLocation = config.get('codeMapSaveLocation');
	
				let fs = vscode.workspace.fs;
	
				if (typeof (data) === 'undefined') {
					console.log("data is null. can't save null data.");
					return;
				}
	
				if (saveLocation === 'testvalue') {
					let uri = vscode.Uri.file('%USERPROFILE%\.vscode\extensions');
	
					const options: vscode.OpenDialogOptions = {
						canSelectMany: false,
						defaultUri: uri,
						openLabel: 'Select',
						canSelectFolders: false,
						canSelectFiles: true,
	
					};
	
					vscode.window.showOpenDialog(options).then((fileUri) => {
						let URI: vscode.Uri;
						if (typeof (fileUri) !== 'undefined') {
							URI = fileUri[0];
	
							let codeString = JSON.stringify(data);
							let uint8array = new TextEncoder().encode(codeString);
							fs.writeFile(URI, uint8array);

							config.update("codeMapSaveLocation", fileUri[0].fsPath, vscode.ConfigurationTarget.Global)
								//take action here
							
	
						}
						else {
							console.log("Error");
						}
					});
				}
				else {
					let URI = vscode.Uri.file(<string>saveLocation);
					if (typeof (saveLocation) !== 'undefined') {
	
						let codeString = JSON.stringify(data);
						let uint8array = new TextEncoder().encode(codeString);
						fs.writeFile(URI, uint8array);
	
					}
					else {
						console.log("Error saving file");
					}
				}
			}));





	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.addPlaceholder', () => {
			let editor = vscode.window.activeTextEditor;

			if (!editor)
				editor = vscode?.window?.visibleTextEditors[0];

			let text = "";
			if (typeof (editor) !== 'undefined') {
				text = editor.document.getText(editor.selection);
			}

			HellowWorldPanel.addPlaceHolder(text);
		}));



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
		vscode.commands.registerCommand('vsblocksnipets.startPanelWithoutItems', () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			// vscode.window.showInformationMessage('Hello World!! from VSBlockSnipets!');
			//vscode.window.showInputBox({value:"test"});

			HellowWorldPanel.createOrShow(context.extensionUri, "");
			vscode.commands.executeCommand("vsblocksnipets.importCodeFromFile", false);
		}));


	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.addCode', async () => {
			let fileName;

			let editor = GetActiveEditor(true);

			if (!editor) {
				vscode.window.showInformationMessage("no active window");
				return;
			}

			let text = editor.document.getText(editor.selection);
			let viewColum = editor.viewColumn;

			vscode.workspace.openTextDocument({ content: text }).then(document => {
				vscode.window.showTextDocument(document, viewColum);
				fileName = document.fileName;
				HellowWorldPanel.addPanelCode(text, fileName);

				//vscode.commands.executeCommand("workbench.action.showCommands");
				(async () => {
					await delay(300);

					vscode.commands.executeCommand("workbench.action.editor.changeLanguageMode").then(lang => {
						let langId = vscode.window.activeTextEditor.document.languageId;
						HellowWorldPanel.updateLanguage(langId);
					});

				})();
			}
			);

			//vscode.window.showInformationMessage(vscode.NotebookCellStatusBarItem.name);

			// sidebarProvider._view?.webview.postMessage({
			// 	type: 'add-code',
			// 	value: text,
			// });


		}));

	function GetActiveEditor(hasText: any) {

		let editor = vscode.window.activeTextEditor;
		let viewColum = vscode?.window?.visibleTextEditors[0]?.viewColumn;
		let text;

		if (!editor)
			editor = vscode?.window?.visibleTextEditors[0];

		if (hasText) {
			text = editor.document.getText(editor.selection);

			if (text === '' && vscode?.window?.visibleTextEditors.length > 1) {
				editor = vscode?.window?.visibleTextEditors[1];
				viewColum = vscode?.window?.visibleTextEditors[1]?.viewColumn;
			}

		}
		if (editor.document.fileName === 'tasks' && vscode?.window?.visibleTextEditors.length > 1) {
			if (typeof (vscode?.window?.visibleTextEditors[0]?.viewColumn) === 'undefined')
				return vscode?.window?.visibleTextEditors[1];
		}


		if (!editor) {
			vscode.window.showInformationMessage("no active window");
			return;
		}
		return editor;
	}


	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.importVSCodeSnippet', () => {
			let fileName;
			let editor = vscode.window.activeTextEditor;
			let viewColum = vscode?.window?.visibleTextEditors[0]?.viewColumn;

			if (!editor)
				editor = vscode?.window?.visibleTextEditors[0];

			if (!editor) {
				vscode.window.showInformationMessage("no active window");
				return;
			}

			const text = editor.document.getText(editor.selection);

			// const answer = await vscode.window.showInformationMessage(
			// 	"how was your day",
			// 	"good", 
			// 	"bad"	
			// );
			// vscode.workspace.openTextDocument({content:text});

			vscode.workspace.openTextDocument({ content: text }).then(document => {
				vscode.window.showTextDocument(document, viewColum);
				fileName = document.fileName;
				HellowWorldPanel.importVSCodeSnippet(text, fileName);

				//vscode.commands.executeCommand("workbench.action.showCommands");
				// (async () => {
				// 	await delay(300);
				// 	vscode.commands.executeCommand("workbench.action.editor.changeLanguageMode");
				// })();
			}
			);
		}));



	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.editCode', async (text, id, language) => {
			let editor = GetActiveEditor(false);
			let doc = editor?.document;
			let filename = doc?.fileName ?? "";
			let viewColum = 1;

			if (filename === 'HelloWorld' || filename === 'tasks') {
				doc = vscode?.window?.visibleTextEditors[1]?.document;

				//vscode.window.showTextDocument(doc, viewColum);

				vscode.workspace.openTextDocument({ content: text }).then(document => {
					vscode.window.showTextDocument(document, viewColum);
					filename = document.fileName;
					HellowWorldPanel.addPanelCodeEditMode(id, filename);

					//vscode.commands.executeCommand("workbench.action.showCommands");
					(async () => {
						await delay(300);
						if (language === "") {
							vscode.commands.executeCommand("workbench.action.editor.changeLanguageMode").then(lang => {
								let langId = vscode.window.activeTextEditor.document.languageId;

								console.log(langId);
							});
						}
						else {
							vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, language);
						}



					})();
				});
			}
			else {


				if (!doc) {
					vscode.window.showInformationMessage("no active window");
					return;
				}
				vscode.window.showTextDocument(doc, viewColum);

				let textContent = text;

				vscode.workspace.openTextDocument({ content: textContent }).then(document => {
					const edit = new vscode.WorkspaceEdit();
					edit.insert(document.uri, new vscode.Position(0, 0), textContent);
					vscode.window.showTextDocument(document);
					filename = document.fileName;
					HellowWorldPanel.addPanelCodeEditMode(id, filename);

					//vscode.commands.executeCommand("workbench.action.showCommands");
					(async () => {
						await delay(300);

						if (language === "") {
							//call to check for language on edit item


							vscode.commands.executeCommand("workbench.action.editor.changeLanguageMode").then(lang => {
								let langId = vscode.window.activeTextEditor.document.languageId;
								console.log(langId);
								HellowWorldPanel.updateLanguage(langId);
							});
						}
						else {
							vscode.languages.setTextDocumentLanguage(vscode.window.activeTextEditor.document, language);

						}
					})();
				});
			}




			// sidebarProvider._view?.webview.postMessage({
			// 	type: 'add-code',
			// 	value: text,
			// });


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

			const config = vscode.workspace.getConfiguration('vsblocksnipets');
			const saveLocation = config.get('codeBlockSaveLocation');

			let fs = vscode.workspace.fs;
			let fileString;


			if (saveLocation === "testvalue") {
				vscode.window.showInformationMessage(config.has('codeBlockSaveLocation').toString());

				let uri = vscode.Uri.file('%USERPROFILE%\.vscode\extensions');


				const options: vscode.OpenDialogOptions = {
					canSelectMany: false,
					defaultUri: uri,
					openLabel: 'Select',
					canSelectFolders: false,
					canSelectFiles: true,

				};


				vscode.window.showOpenDialog(options).then((fileUri) => {
					if (typeof (fileUri) !== 'undefined') {
						let URI: vscode.Uri;
						URI = fileUri[0];
						vscode.window.showInformationMessage(fileUri[0].fsPath);

						config.update("codeBlockSaveLocation", fileUri[0].fsPath, vscode.ConfigurationTarget.Global).then(() => {
							//take action here
						});


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
			}
			else {
				//vscode.window.showInformationMessage("Loading JSON:  " + saveLocation);
				var save = <string>saveLocation;
				let uri = vscode.Uri.file(save);

				fs.readFile(uri).then(data => {
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
			//configuration.update("codeBlockSaveLocation", URI, vscode.ConfigurationTarget.Global).then(() => {
			// take action here
			//});

		}));

		context.subscriptions.push(
			vscode.commands.registerCommand('vsblocksnipets.loadCodeMapFromFile', (fromSidebar) => {
				console.log("Importing Code Map From File:");
	
				const config = vscode.workspace.getConfiguration('vsblocksnipets');
				const saveLocation = config.get('codeMapSaveLocation');
	
				let fs = vscode.workspace.fs;
				let fileString;
	
	
				if (saveLocation === "testvalue") {
					vscode.window.showInformationMessage(config.has('codeMapSaveLocation').toString());
	
					let uri = vscode.Uri.file('%USERPROFILE%\.vscode\extensions');
	
	
					const options: vscode.OpenDialogOptions = {
						canSelectMany: false,
						defaultUri: uri,
						openLabel: 'Select',
						canSelectFolders: false,
						canSelectFiles: true,
	
					};
	
	
					vscode.window.showOpenDialog(options).then((fileUri) => {
						if (typeof (fileUri) !== 'undefined') {
							let URI: vscode.Uri;
							URI = fileUri[0];
							vscode.window.showInformationMessage(fileUri[0].fsPath);
	
							config.update("codeMapSaveLocation", fileUri[0].fsPath, vscode.ConfigurationTarget.Global).then(() => {
								//take action here
							});
	
	
							fs.readFile(URI).then(data => {
								fileString = new TextDecoder().decode(data, { stream: true });
	
	
	
								if (fromSidebar) {
									sidebarProvider._view?.webview.postMessage({
										type: 'import-code-map-from-file',
										value: fileString,
									});
								}
								else {
									// const text = activeTextEditor.document.getText(activeTextEditor.selection);
									// vscode.window.showInformationMessage(text);
	
									HellowWorldPanel.CodeMapToWindow(fileString);
								}
							});
						}
					});
				}
				else {
					//vscode.window.showInformationMessage("Loading JSON:  " + saveLocation);
					var save = <string>saveLocation;
					let uri = vscode.Uri.file(save);
	
					fs.readFile(uri).then(data => {
						fileString = new TextDecoder().decode(data, { stream: true });
	
	
	
						if (fromSidebar) {
							// sidebarProvider._view?.webview.postMessage({
							// 	type: 'import-code-from-file',
							// 	value: fileString,
							// });
						}
						else {
							// const text = activeTextEditor.document.getText(activeTextEditor.selection);
							// vscode.window.showInformationMessage(text);
	
							HellowWorldPanel.CodeMapToWindow(fileString);
						}
					});
				}
				//configuration.update("codeBlockSaveLocation", URI, vscode.ConfigurationTarget.Global).then(() => {
				// take action here
				//});
	
			}));


	context.subscriptions.push(
		vscode.commands.registerCommand('vsblocksnipets.passBlocksToWindow', (items) => {
			console.log("Passed Items:");
			console.log(items);

			const newString = JSON.stringify(items);


			HellowWorldPanel.PassCodeToWindow(newString);

		}));

		context.subscriptions.push(
			vscode.commands.registerCommand('vsblocksnipets.returnFileTree', (fileTree) => {
	
				const fileTreeString = JSON.stringify(fileTree);
	
	
				HellowWorldPanel.PassCodeToWindow(fileTreeString);
	
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
