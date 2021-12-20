import { BehaviorSubject, map } from 'rxjs'
import * as sourcegraph from 'sourcegraph'

interface Bookmark {
    id: string
    uri: string
    // TODO: use @sourcegraph/extension-api-types, `Range`, `Position`
    range: {
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

function saveBookmark(bookmark: Bookmark): void {
    const bookmarks: Bookmark[] = sourcegraph.configuration.get().value['bookmarks.savedBookmarks'] || []
    const existingIndex = bookmarks.findIndex(item => item.id === bookmark.id)
    if (existingIndex >= 0) {
        bookmarks.splice(existingIndex, 1)
    } else {
        bookmarks.push(bookmark)
    }
    sourcegraph.configuration.get().update('bookmarks.savedBookmarks', bookmarks)
}

function getBookmarks(): Bookmark[] {
    const bookmarks = sourcegraph.configuration.get().value['bookmarks.savedBookmarks'] || []
    return bookmarks
}

const bookmarks$ = new BehaviorSubject<Bookmark[]>(getBookmarks())

export function activate(context: sourcegraph.ExtensionContext): void {
    // TODO: ensure command palette command is only active when there is a selection.
    // - Observe active editor, observe its selections.
    // - When there is a selection, set context key (e.g. `bookmarks.activeSelection`) using sourcegraph.internal.updateContext
    // - We can use this context key in the command palette's `when` context key expression

    context.subscriptions.add(
        sourcegraph.commands.registerCommand('bookmarks.toggle', () => {
            const editor = sourcegraph.app.activeWindow?.activeViewComponent
            if (editor?.type === 'CodeEditor' && editor.selection) {
                const { start, end } = editor.selection
                const bookmark: Bookmark = {
                    id: editor.document.uri + start.character + start.line + end.character + end.line,
                    uri: editor.document.uri,
                    range: {
                        start: {
                            // Weirdly this is required in order to create a pure object with
                            character: start.character,
                            line: start.line,
                        },
                        end: {
                            character: end.character,
                            line: end.line,
                        },
                    },
                }
                saveBookmark(bookmark)
            } else {
                // TODO: use notifications API
                alert('Active CodeEditor with selected line is required.')
            }
        })
    )

    // TODO: store uri and raw Range (from extension-api-types),
    // instantiate Location objects from this.

    const LOCATION_PROVIDER_ID = 'bookmarks.savedBookmarkLocations'

    sourcegraph.configuration.subscribe(() => {
        bookmarks$.next(getBookmarks())
    })

    // FIXME: currently this loaded only after clicking "Find references"
    // Register a location provider with user-saved bookmarks
    context.subscriptions.add(
        sourcegraph.languages.registerLocationProvider(LOCATION_PROVIDER_ID, ['*'], {
            provideLocations: () =>
                bookmarks$.pipe(
                    map(bookmarks =>
                        bookmarks.map(
                            ({ uri, range }) =>
                                new sourcegraph.Location(
                                    new URL(uri),
                                    new sourcegraph.Range(
                                        range.start.line,
                                        range.start.character,
                                        range.end.line,
                                        range.end.character
                                    )
                                )
                        )
                    )
                ),
        })
    )

    // Create a panel view that uses this location provider
    const panel = sourcegraph.app.createPanelView('bookmarks')
    panel.title = 'Bookmarks'
    panel.component = { locationProvider: LOCATION_PROVIDER_ID }
}
// Sourcegraph extension documentation: https://docs.sourcegraph.com/extensions/authoring
