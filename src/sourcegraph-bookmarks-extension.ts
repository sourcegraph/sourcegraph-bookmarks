import * as sourcegraph from 'sourcegraph'

interface Bookmark {
    uri: string
    // TODO: use @sourcegraph/extension-api-types, `Range`, `Position`
    range?: {
        start: {
            line: number
            character: number
        }
        end: {
            line: number
            character: number
        }
    }
}

/**
 * Subset of user settings that are used by this extension.
 */
interface Settings {
    savedBookmarks: Bookmark[]
}

export function activate(context: sourcegraph.ExtensionContext): void {
    // TODO: ensure command palette command is only active when there is a selection.
    // - Observe active editor, observe its selections.
    // - When there is a selection, set context key (e.g. `bookmarks.activeSelection`) using sourcegraph.internal.updateContext
    // - We can use this context key in the command palette's `when` context key expression

    context.subscriptions.add(
        sourcegraph.commands.registerCommand('bookmarks.toggle', () => {
            const editor = sourcegraph.app.activeWindow?.activeViewComponent
            if (editor?.type === 'CodeEditor') {
                // TODO: Create `Bookmark` object, push to user settings `bookmarks.savedBookmarks` array
            }
        })
    )

    // TODO: store uri and raw Range (from extension-api-types),
    // instantiate Location objects from this.

    const LOCATION_PROVIDER_ID = 'bookmarks.savedBookmarkLocations'

    // Register a location provider with user-saved bookmarks
    context.subscriptions.add(
        sourcegraph.languages.registerLocationProvider(LOCATION_PROVIDER_ID, ['*'], {
            provideLocations: () => {
                // TODO: Observe user settings. Map each emission
                // to sourcegraph.Location type (`new sourcegraph.Location`).

                console.log('calling location provider')
                return []
            },
        })
    )

    // Create a panel view that uses this location provider
    const panel = sourcegraph.app.createPanelView('bookmarks')
    panel.title = 'Bookmarks'
    panel.component = { locationProvider: LOCATION_PROVIDER_ID }
}

// Sourcegraph extension documentation: https://docs.sourcegraph.com/extensions/authoring
