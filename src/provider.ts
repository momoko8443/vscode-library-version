'use strict';

import * as vscode from 'vscode';

export default class Provider implements vscode.TextDocumentContentProvider {

	private _scheme: string = '';
	private _document: string = null;
	private _subscriptions: vscode.Disposable;
	private _packageInfos: any[] = [];
	constructor(scheme: string) {
		this._scheme = scheme;
		this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => {
			this._document = null;
		});
	}


	dispose() {
		this._subscriptions.dispose();
		this._document = null;
	}

	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

		if (this._document) {
			return this._document;
		}
		let includePath:string = "**/node_modules/**/package.json";
		if(this._scheme === 'bower-package'){
			includePath = "**/bower_components/**/package.json";
		}

		return vscode.workspace.findFiles(includePath, "").then(result => {
			let packageInfos = [];

			return this.buildVersions(result).then((packageInfos) => {
				let outputString: string = "";
				let items: string[] = [];
				packageInfos.sort(function(a, b){
					if(a.name > b.name){
						return 1;
					}
					if(a.name < b.name){
						return -1;
					}
					return 0;
				});
				packageInfos.forEach((element, index) => {
					var lineStr: string = element.name + ": " + element.version + "\n";
					items.push(`  ${index + 1}` + (lineStr && `  ${lineStr}`));
				});
				
				return items.join('\n');
			});
		});
	}

	private buildVersions(packages: vscode.Uri[]): any | Thenable<any> {
		let promiseArray: any[] = [];
		packages.forEach(element => {
			promiseArray.push(this.buildVersionItem(element));
		});
		return Promise.all(promiseArray).then(() => {
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
