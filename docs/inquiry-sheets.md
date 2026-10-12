# linerealestate inquiry sheet

The owner has a private Google spreadsheet and Apps Script project named `linerealestate 문의 자동 기록`. Retrieve their addresses from the owner's Google Drive / Apps Script account; do not record private project URLs in this repository.

The `문의 기록` tab receives linerealestate inquiries only. Supabase remains the authoritative source; Kakao delivery is unchanged. The status column is the status at import time, not a live mirror. Manual consultation notes are preserved.

`scripts/inquiry-sheets.gs` is a credential-free template. The actual script uses a dedicated read-only inquiry token stored in encrypted notification settings and in the owner's private Apps Script project. Never put that token in Git, public files, URLs, or chat. Supabase server keys never leave the site configuration.

The private `/api/inquiries/sheets` endpoint requires the dedicated bearer token and returns at most 100 chronological rows per page. It rejects invalid cursors, omits IP hashes and notification settings, and disables caching. The script serializes runs with a lock, deduplicates by inquiry UUID, saves its cursor only after sheet writes, and imports up to five pages per run. Customer text is escaped to prevent spreadsheet formulas.

Run `installInquirySync` once after the owner grants Google permissions. This performs an initial import and creates one minute-based trigger; subsequent runs reuse it. Setup completed on 2026-10-12: execution succeeded, one time-based `syncInquiries` trigger was visible with 0% errors, and a clearly labeled synthetic inquiry appeared exactly once in the sheet. Anonymous feed requests returned 401 and invalid cursors returned 400. The test record is retained as a visible example, not an actual customer inquiry.
