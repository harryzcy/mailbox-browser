# State Management

States shared across components are managed through React Contexts. There are currently two groups of states: global configurations and draft emails.

## Configuration

Configuration is handled via `ConfigContext`. The config data is loaded in `EmailRoot` once during initial loading using the `set` action, and then it's only read in other components.

## Draft Emails

`DraftEmailContext` manages the state of draft emails. It acts as a working directory for draft emails, while the backend database persists the data. Any changes are stored in working directory and then persisted by sending requests at specific intervals or at certain events.

The state consists of the following:

- `activeEmail`: the active draft email that's rendered in full-screen mode.
- `updateWaitlist`: the waitlist queue of emails to be updated via HTTP requests.
- `emails`: The full list of emails that's opened and displayed in tabs.

The following actions manages the state:

- `add`: Adds a new draft email to the working directory. This is dispatched when user creates a new draft email by clicking the *New* button or by starting a email reply/forward.
- `load`: Loads an email to the working directory
- `open`: Opens a draft email in Draft tab
- `minimize`: Convert full-page draft to minimized state
- `close`: Close a draft email completely.
- `update`: Update a draft email when any of subject, content, recipient, etc is changed, optionally append to the update waitlist.
- `remove-waitlist`: Remove email from the update waitlist.
- `clear-waitlist`: Clear all emails in the update waitlist.
