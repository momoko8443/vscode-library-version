'use strict';

import * as vscode from 'vscode';

export default class Provider implements vscode.TextDocumentContentProvider {

	static scheme = 'package';

	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _documents = new Map<string, string>();
	private _editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
	private _subscriptions: vscode.Disposable;
	private _packageInfos: any[] = [];
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

		return vscode.workspace.findFiles("**/node_modules/**/package.json", "").then(result => {
			let packageInfos = [];

			return this.buildVersions(result).then((packageInfos) => {
				let outputString: string = "";
				let items: string[] = [];
				packageInfos.forEach((element, index) => {
					var lineStr: string = element.name + ": " + element.version + "\n";
					items.push(`  ${index + 1}` + (lineStr && `  ${lineStr}`));
				});
				return items.join('\n');
			});
		});
	}

	private buildVersions(packages: vscode.Uri[]): any | Thenable<any> {
		let promiseArray:any[] = [];
		packages.forEach(element => {
			promiseArray.push(this.buildVersionItem(element));
		});
		return Promise.all(promiseArray).then(()=>{
			return this._packageInfos;
		});
	}


	private buildVersionItem(path: vscode.Uri): any | Thenable<any> {
		return vscode.workspace.openTextDocument(path).then((document) => {
			let item: Object = JSON.parse(document.getText());
			let packageInfo: Object = { name: item['name'], version: item['version'] };
			this._packageInfos.push(packageInfo);
			return packageInfo;
		});
	}
}
