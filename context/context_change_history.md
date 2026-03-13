# Context Change History

## Entry Format
- Keep entries in chronological order and append new entries at the end of the list.
- Recommended format: `YYYY-MM-DD | type:<type> | part:<scope> | summary:<summary> | risks:<risks> | tests:<tests> | commit:<commit> | links:<links>`

## Entries
- YYYY-MM-DD | type:setup | part:project-bootstrap | summary: Replace with the first real change. | risks:replace | tests:replace | commit:PENDING | links:context/next_context_sync.md

## Archive Notes
- Archive older entries into `context/archive/` when the history file becomes too long.
- Use `npm run context:archive-history -- --keep-latest 100` to keep the newest entries in the main file.
