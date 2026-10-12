<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Listing assistance and publication

Read `docs/admin-workflow.md` when a user provides a SUN listing number or asks to prepare, revise or publish listing content. Use `scripts/admin-content.mjs export` to retrieve the private original and `revise` to save a separate approval candidate. Keep originals intact; do not invent prices, facilities or transaction facts. Store downloaded originals and working files only in the ignored `.tmp/content` directory. Never print credentials, authentication links or private notes into public artifacts.

The user explicitly authorized on 2026-10-12 that requests in this chat to add or revise listing/case photos or content include approval to publish those requested changes. Prepare a separate revision, verify it, then run `publish REVISION_UUID --human-approved` without asking for another confirmation. This standing authorization is limited to the requested content changes; requests for a preview, draft, or no publication must remain unpublished. Manual `/admin` submissions keep their existing approval flow. Preserve the version check and do not silently replace an already approved candidate. Do not invent transaction facts or extend this authorization to unrelated destructive or account/security changes.

Use port 3010 for this project. Do not stop or reuse port 3000, which belongs to another project. Keep this project's Supabase tables and storage buckets under the `lineestate` names; do not change the other project's data or authentication settings.

All completed cases now use managed lineestate data, including the original four cases. Never edit lib/real-cases.json or static UI to update a case; use its SUN number. Existing links map through lib/content/legacy-work-routes.json. For every photo, preserve aspect ratio, set longest edge exactly 1200px, save WebP only (browser photo.ts or Node photo-node.mjs). Do not store new raw originals. Historical raw-file deletion requires separate scope approval.
