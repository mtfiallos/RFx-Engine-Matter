/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MANIFEST = {
  package: "RFx_Engine_Project_Files_v9_RFX_TRUEUP_05_NGP002_Assumptions_Closure_Flat_Package.zip",
  version: "v9",
  files: [
    "01_RFx_Orchestrator_Gem_Instructions.docx",
    "03_RFx_Requirements_Hunter_Gem_Instructions.docx",
    "04_RFx_Scorecard_Builder_Gem_Instructions.docx",
    "06_RFx_Remediation_Rescore_Gem_Instructions.docx",
    "07_RFx_Response_Builder_Gem_Instructions.docx",
    "AI-Identity.txt",
    "Generic_RFx_Assumptions_and_Dependencies_Register_Template.docx",
    "Generic_RFx_Assumptions_and_Dependencies_Register_Template.xlsx",
    "Generic_RFx_Blank_Templates_Reconciled_v7.zip",
    "Generic_RFx_Risk_and_Mitigation_Register_Template.docx",
    "Generic_RFx_Risk_and_Mitigation_Register_Template.xlsx",
    "RFX_TRUEUP_05_Assumptions_Dependencies_Closure_Findings.docx",
    "RFx_Engine_Expansion_Backlog_v6_NGP002_Assumptions_Closed.docx",
    "RFx_Engine_Expansion_Backlog_v6_NGP002_Assumptions_Closed.xlsx",
    "RFx_Google_Gems_Master_and_Individual_DOCX_Package.zip",
    "RFx_Prompt_Library_v2_MASTER_Integrated_DOCX_Bundle.zip",
    "RFx_Prompt_NGP001_Risk_and_Mitigation_Builder.docx",
    "RFx_Prompt_NGP002_Assumptions_and_Dependencies_Register_Builder.docx",
    "RFx_Remediation_Plan_Prompt.docx",
    "RFx_TRUEUP_05_Assumptions_Dependencies_Alignment_Matrix.xlsx",
    "RFx_TRUEUP_CONTROL_PACK_v9.md",
    "PROJECT_PACKAGE_MANIFEST_v9.md",
    "firebase-blueprint.json",
    "firestore.rules"
  ]
};

export const CONTROL_PACK = {
  completedTask: "RFX-TRUEUP-05 - NGP-002 Assumptions & Dependencies Register Closure",
  summary: "NGP-002 is now closed as an embedded gap. TRUEUP-05 adds a formal Assumptions & Dependencies Register control and updates the prompt / Gem chain so assumptions, dependencies, clarifications, exceptions, pricing notes, and accepted residual risks have their own handoff path.",
  nextTask: "RFX-TRUEUP-06 - NGP-104 SME Question Extractor / Routed Question Queue Closure.",
  devilsAdvocate: "Assumptions and dependencies are only useful if they create action. Without a routed question queue, they become cleaner-looking parked issues. TRUEUP-06 should convert register rows into buyer questions, SME asks, pricing asks, legal asks, and delivery-owner asks with owners and due dates.",
  gateRule: "Create or update the Assumptions & Dependencies Register when any proposal response, risk mitigation, requirement interpretation, pricing model, legal/commercial position, delivery plan, or remediation action depends on a condition that is not fully confirmed.",
  message: "Firebase Persistence Layer v1.0.0 Online. Multi-user RFx Submission engine active.",
  ownerRule: "The OWNER role has absolute and unrestricted permissions to see anything and everything always. Ensure that OWNER does and always will have this capability across all RBAC definitions."
};

export const GEM_CHAIN_LOGIC = [
  { id: "01", name: "Orchestrator", role: "Flow Control", detail: "Directs handoff paths for Risks and Assumptions." },
  { id: "03", name: "Requirements Hunter", role: "Extraction", detail: "Populates the NGP-004 Traceability Matrix." },
  { id: "04", name: "Scorecard Builder", role: "Evaluation", detail: "Builds weighting matrix using Mode 1 v3.1 templates." },
  { id: "07", name: "Response Builder", role: "Drafting", detail: "Generates drafts anchored to ReqID from matrix." },
  { id: "06", name: "Remediation Rescore", role: "Optimization", detail: "Iterates response quality based on delta scoring." }
];
