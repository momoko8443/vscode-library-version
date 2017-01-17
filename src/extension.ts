'use strict';

import { workspace, languages, window, commands, ExtensionContext, Disposable, Uri } from 'vscode';
import * as fs from 'fs';
import ContentProvider from './provider';

export function activate(context: ExtensionContext) {

    //console.log('Congratulations, your extension "library-version" is now active!');

    const provider = new ContentProvider();

    const providerRegistrations = Disposable.from(
        workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider)
    );
    const commandRegistration = commands.registerCommand('extension.showNpmPackageVersion', () => {
        const uri = Uri.parse(`${ContentProvider.scheme}:package.versions`);
        return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, 1));
    });

    context.subscriptions.push(
        provider,
        commandRegistration,
        providerRegistrations
    );
}

export function deactivate() {
}