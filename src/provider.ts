'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';

export default class Provider implements vscode.TextDocumentContentProvider {

	static scheme = 'package';

	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _documents = new Map<string, string>();
	private _editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
	private _subscriptions: vscode.Disposable;

	constructor() {
		this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => this._documents.delete(doc.uri.toString()));
	}

	dispose() {
		this._subscriptions.dispose();
		this._documents = null;
		this._editorDecoration.dispose();
		this._onDidChange.dispose();
	}

	get onDidChange() {
		return this._onDidChange.event;
	}
	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

		// already loaded?
		let document = this._documents.get(uri.toString());
		if (document) {
			return document;
		}

		return vscode.workspace.findFiles("**/node_modules/**/package.json","").then(function (result) {
			let packageInfos = [];
			result.forEach(element => {
				let data: string = fs.readFileSync(element.path, "utf-8");
				let item: Object = JSON.parse(data);
				let packageInfo: Object = { name: item['name'], version: item['version'] };
				packageInfos.push(packageInfo);
			});
			let outputString: string = "";
			let items: string[] = [];
			packageInfos.forEach((element, index) => {
				var lineStr: string = element.name + ": " + element.version + "\n";
				items.push(`  ${index + 1}` + (lineStr && `  ${lineStr}`));
			});
			console.log(JSON.stringify(items));
			return items.join('\n');
		});
	}
}
