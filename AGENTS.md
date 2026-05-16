# Agent Instructions

- **No Mocking or Simulation**: 
This is a real production application being built to process enterprise RFPs. Do not use random, localized "mock" generation for file reading or document parsing. When the user asks to extract from a file, we need actual infrastructure to process the file context.
- **Workflow / Process**: The core engine of this app relies on 17+ specific "GEM" instructions. The app acts as an Orchestrator that takes user input, routes it to the correct GEM prompt (like Requirements Hunter), and produces outputs.
- **Data Persistence**: We are using Firebase for DB metadata, and moving towards Google Drive for File Storage.
