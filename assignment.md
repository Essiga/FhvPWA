 Chat PWA

A PWA for the given chat server implementation has to be implemented. Similar to other known applications like these it
should be able to:

- Show a list of all ongoing conversations (can be retrieved via the `/conversations` endpoint, which has a `user`
query parameter to filter conversations by the participating users)
- Open an existing chat by choosing it from the list including its entire messaging history (can be retrieved via the
`/conversations/:id/messages` endpoint)
- Sending a new message in a chat (using a `POST` request to `/conversations/:id/messages`)

The PWA should specifically implement the features provided by the browser as follows:

1. Make every page a separate URL, so that bookmarking, reloading, browsers history etc. is working correctly. This can
e.g. be done using the hash history of the npm `history` package.
2. Cache the images of users using a service worker so that they are only retrieved from the server once.
3. Build an app shell and make it available for offline usage. Also add an app manifest to allow the application to be
installed.
4. Add an entry to the `localStorage`, which stores which chat has been opened last, so that reopening starts where the
user has left off.
5. Store users in an IndexedDB database so that they can be read even if there is no internet connectivity.
6. Lazily store the conversations in IndexedDB and load them from there if there is no internet connection, so that at
least old messages that have already been loaded can be read offline.

**It is not allowed to use any framework (i.e. this assignment has to be implemented using plain JavaScript), since we
want you to learn all the basics about PWAs.** Some concepts like the app shell would be rather hard to implement
properly using certain frameworks or libraries anyway.

The result will not be a fully functional chat application, therefore the following features are out of scope and do
not have to be implemented:

- Login and registration, i.e. the application just opens and a user of your choice (`daniel`, `manuel`, `guenther` or
`franz`) is already logged in
- Writing messages while offline
- Automatically updating the displayed messages when a new one is sent by other participants
- Starting a completely new conversation

The following list shows all criteria that must be considered when grading the application in the peer review step.

- Does it show a list of ongoing conversations?
- Does it show the messages of a conversation when it is clicked?
- Can it send a new message to the server?
- Does it update the URL correctly?
- Does a reload show the same page as before?
- Are images cached using a service worker?
- Is the application installable?
- Does the application use an app shell, which is available offline?
- Does it jump to the most recent conversation when the application is reopened on the root URL?
- Are users read from the IndexedDB database?
- Are conversations stored in IndexedDB and used as an offline fallback?
- Is the application responsive?

The result of the peer review is the grade of this assignment, if the student being graded has also reviewed the
solution of a peer, otherwise the student will not get any points for this assignment at all.

Each week a randomly chosen student has to present the implementation progress in regards to the course content from
the previous week.
