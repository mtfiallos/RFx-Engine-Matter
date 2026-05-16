# Development Roadmap

## Phase 1: Infrastructure & Storage Reality
- [ ] Transition from simulated/mock file parsing to real file handling.
- [ ] Integrate Google Drive API for persistent file storage.
  - Structure: Internal/Templates folder vs Submissions/Client folders.
- [ ] Configure OAuth scopes for Drive access.

## Phase 2: GEM Implementation (The "Requirements Hunter")
- [ ] Ingest the user's 17+ Prompts and GEM Instructions.
- [ ] Build the "Requirements Hunter" execution pipeline using Gemini API.
- [ ] Implement the capability to truly parse extracted text from PDFs/Word Docs and pass to Gemini.
- [ ] Extract overt, implied, inferred, and hidden requirements into the DB.

## Phase 3: Scorecard & Automation
- [ ] Implement the Scorecard generator GEM.
- [ ] Map Requirements Hunter outputs to the Scorecard's 16 sections.
- [ ] Automate the population of the scorecard artifact.

---
*Note: This file tracks our internal development progress.*
