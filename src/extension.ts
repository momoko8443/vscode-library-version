'use strict';

import { workspace, languages, window, commands, ExtensionContext, Disposable, Uri } from 'vscode';
import * as fs from 'fs';
import ContentProvider from './provider';

export function activate(context: ExtensionContext) {

    const content4NpmProvider = workspace.registerTextDocumentContentProvider('npm-package', new ContentProvider('npm-package'));
    const content4BowerProvider = workspace.registerTextDocumentContentProvider('bower-package', new ContentProvider('bower-package'));
    const command4NpmRegistration = commands.registerCommand('extension.showNpmPackageVersion', () => {
        const uri = Uri.parse('npm-package:npm-package.versions');
        return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, 1));
    });
    const command4BowerRegistration = commands.registerCommand('extension.showBowerPackageVersion', () => {
        const uri = Uri.parse('bower-package:bower-package.versions');
        return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, 1));
    });


    context.subscriptions.push(
        content4NpmProvider,
        content4BowerProvider,
        command4NpmRegistration,
        command4BowerRegistration
    );
}

export function deactivate() {
}