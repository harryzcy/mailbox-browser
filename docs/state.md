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

- `new`: Adds a new draft email (not a reply or forward) to the working directory. This is dispatched when user clicks **New** button.
- `new-reply`: Adds a new draft reply to the working directory.
- `new-forward`: Adds a new draft forward to the working directory.
- `open`: Opens a draft email in Draft tab.
- `load`: Loads an email to the working directory. This should be done by making a HTTP request and using the response content. If the email is already in the working directory, the email should be opened instead (identical to `open`).
- `minimize`: Convert full-page draft to minimized state
- `remove`: Remove an email from the working directory.
- `update`: Update a draft email when any of subject, content, recipient, etc is changed, optionally append to the update waitlist.
