import * as sourcegraph from 'sourcegraph'

export function activate(context: sourcegraph.ExtensionContext): void {
    context.subscriptions.add(
        sourcegraph.languages.registerHoverProvider(['*'], {
            provideHover: () => ({
                contents: {
                    value: 'Hello world from sourcegraph-bookmarks-extension! 🎉🎉🎉',
                    kind: sourcegraph.MarkupKind.Markdown
                }
            }),
        })
    )
}

// Sourcegraph extension documentation: https://docs.sourcegraph.com/extensions/authoring
