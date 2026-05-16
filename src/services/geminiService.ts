import { GoogleGenAI, Type } from "@google/genai";
import { Assumption, Risk } from "./rfxService";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function handleGeminiError(error: any) {
  let errorMessage = error?.message || '';
  if (typeof error === 'string') errorMessage = error;
  
  let isQuotaError = false;

  try {
    const parsed = JSON.parse(errorMessage.replace(/^\[.*?\]\s*/, ''));
    if (parsed?.error?.code === 429 || parsed?.error?.status === 'RESOURCE_EXHAUSTED') {
      isQuotaError = true;
    }
  } catch(e) {}
  
  if (
    isQuotaError ||
    error?.status === 429 || 
    error?.status === 'RESOURCE_EXHAUSTED' || 
    errorMessage.includes('exceeded your current quota') ||
    errorMessage.includes('429')
  ) {
    throw new Error('Gemini API quota exceeded. Please check your plan and billing details at: https://ai.google.dev/gemini-api/docs/rate-limits');
  }

  throw error;
}

export async function generateChatResponse(messages: { role: string, content: string }[]) {
  try {
    const formattedMessages = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    // Prefix system instruction to first message or use config
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: formattedMessages,
      config: {
        systemInstruction: "You are Elyria, an AI Assistant for the Elyria Matrix RFx Engine. You help users manage RFx submissions, review templates, and analyze requirements. Keep your answers concise, professional, and directly helpful.",
      }
    });

    return response.text || "I was unable to generate a response.";
  } catch (error) {
    console.warn("Chat Error:", error);
    try {
      handleGeminiError(error);
    } catch(e: any) {
      return e.message || "I encountered an error connecting to the intelligence core.";
    }
  }
}

export async function generateBidScore(submissionData: any) {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Analyze the following RFx (Request for X) submission data to generate a Bid / No-Bid Decision Scorecard.
    Evaluate the historical parameters, tech requirements, and margin analysis.
    
    Submission Data:
    ${JSON.stringify(submissionData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior RFx bidding strategist. Output JSON detailing a Go/No-Go score, insights, and historical comparison reasoning.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Overall score out of 100" },
            scoreDelta: { type: Type.STRING, description: "e.g. +4% vs historical average" },
            capabilitiesMatch: { type: Type.NUMBER, description: "Capabilities match percentage out of 100" },
            marginViability: { type: Type.NUMBER, description: "Margin viability percentage out of 100" },
            riskProfile: { type: Type.STRING, description: "e.g. Low, Moderate, High" },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "One of: Strong Technical Fit, Compliance Gap, Pricing Strategy, Other" },
                  text: { type: Type.STRING, description: "Insight description text" },
                  severity: { type: Type.STRING, description: "One of: positive, negative, neutral" }
                },
                required: ["type", "text", "severity"]
              }
            },
            historyComparison: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  metric: { type: Type.STRING, description: "e.g. Margin, Risk, Win Rate" },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, description: "up, down, neutral" },
                  explanation: { type: Type.STRING, description: "Reason for the adjustment or trend based on past bids" }
                },
                required: ["metric", "value", "trend", "explanation"]
              }
            }
          },
          required: ["score", "scoreDelta", "capabilitiesMatch", "marginViability", "riskProfile", "insights", "historyComparison"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error: any) {
    try {
       handleGeminiError(error);
    } catch(e: any) {
       console.warn("Gemini Bid Score Error:", e.message);
       throw e;
    }
  }
}

export async function generateComplianceScan(requirements: any[]) {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Analyze the following extracted requirements against standard compliance frameworks (e.g. SOC2, ISO 27001, HIPAA).
    For each requirement, identify relevant security framework controls, assess whether standard modern cloud architectures pass them natively, and note any manual review needed.

    Requirements:
    ${JSON.stringify(requirements, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a Compliance Rules Engine. Output JSON detailing pass/fail counts and itemized mapping.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                passed: { type: Type.NUMBER },
                failed: { type: Type.NUMBER },
                manual: { type: Type.NUMBER }
              },
              required: ["passed", "failed", "manual"]
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  requirement: { type: Type.STRING },
                  framework: { type: Type.STRING, description: "e.g. SOC2 CC6.1" },
                  status: { type: Type.STRING, description: "One of: pass, fail, manual" },
                  note: { type: Type.STRING, description: "AI Match / Resolution details" }
                },
                required: ["id", "requirement", "framework", "status", "note"]
              }
            }
          },
          required: ["summary", "items"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error: any) {
    try {
       handleGeminiError(error);
    } catch(e: any) {
       console.warn("Gemini Compliance Scan Error:", e.message);
       throw e;
    }
  }
}

export async function generateSecurityAddendum(requirement: string, framework: string, note: string) {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Generate a concise formal security addendum drafting a response or exception to the following requirement that failed native compliance.
    
    Failed Requirement: ${requirement}
    Target Framework Control: ${framework}
    Reason for Failure: ${note}
    
    Draft formal language suitable for a compliance/legal team to include in the proposal taking a position on how we will mitigate this using alternative compensating controls, or requesting a waiver.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a Legal & Compliance writer. Output plain text formal drafting."
      }
    });

    return response.text;
  } catch (error: any) {
    try {
       handleGeminiError(error);
    } catch(e: any) {
       console.warn("Gemini Addendum Gen Error:", e.message);
       throw e;
    }
  }
}

export async function analyzePackage(assumptions: Assumption[], risks: Risk[]) {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Analyze the following RFx (Request for X) assumptions and risks.
    For each assumption, suggest a validation step or a potential risk it might hide.
    For each risk, assess its probability (0-100), impact (0-100), and suggest a professional mitigation strategy.
    
    Current Assumptions:
    ${JSON.stringify(assumptions, null, 2)}
    
    Current Risks:
    ${JSON.stringify(risks, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior RFx analyst and risk management expert. Provide highly professional, technical, and actionable insights.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analyzedAssumptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  statement: { type: Type.STRING },
                  aiInsight: { type: Type.STRING, description: "AI's validation step or insight for this assumption" }
                },
                required: ["id", "statement", "aiInsight"]
              }
            },
            analyzedRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  description: { type: Type.STRING },
                  probability: { type: Type.NUMBER, description: "Assessed probability (0-100)" },
                  impact: { type: Type.NUMBER, description: "Assessed impact (0-100)" },
                  mitigation: { type: Type.STRING, description: "Suggested mitigation strategy" }
                },
                required: ["id", "description", "probability", "impact", "mitigation"]
              }
            }
          },
          required: ["analyzedAssumptions", "analyzedRisks"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error: any) {
    try {
       handleGeminiError(error);
    } catch(e: any) {
       console.warn("Gemini Analysis Error:", e.message);
       throw e;
    }
  }
}

export async function extractEntityFromFile(fileName: string, fileContent: string, entityType: 'requirements' | 'risks' | 'assumptions') {
  const model = "gemini-3.1-pro-preview";
  
  const entityMap = {
    requirements: {
      type: "requirements",
      desc: "Requirements: categorize as overt (direct), implied (logical necessity), inferred (contextual), inter (cross-referenced), or hidden (buried in fine print)."
    },
    risks: {
      type: "risks",
      desc: "Risks: Potential threats to delivery or compliance."
    },
    assumptions: {
      type: "assumptions",
      desc: "Assumptions: Necessary conditions for the bid."
    }
  };

  const systemInstruction = `
    You are the "RFx Hunter" assigned to extract ${entityMap[entityType].type}.
    Your goal is to perform deep exhaustive extraction on RFx documentation.
    
    You must identify:
    1. ${entityMap[entityType].desc}
    
    ${entityType === 'requirements' ? 'Perform an atomic, 4-pass deep scan for ALL requirements.' : ''}
    Be extremely precise and thorough.
  `;

  const prompt = `
    Extract all critical details from the following document fragment:
    File Name: ${fileName}
    Content Preview: ${fileContent.startsWith('data:') ? '[Base64 Document Attached Below]' : fileContent}
  `;

  let parts: any[] = [{ text: prompt }];

  // If it's a data URL, construct the inline data object
  if (fileContent.startsWith('data:')) {
     const commaIndex = fileContent.indexOf(',');
     if (commaIndex !== -1) {
        const mimeType = fileContent.substring(5, commaIndex).split(';')[0];
        const data = fileContent.substring(commaIndex + 1);
        parts.push({
           inlineData: {
              data: data,
              mimeType: mimeType
           }
        });
     }
  }

  let responseSchema: any;
  if (entityType === 'requirements') {
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        results: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["overt", "implied", "inferred", "inter", "hidden"] },
              aiInsight: { type: Type.STRING },
              aiConfidenceScore: { type: Type.NUMBER },
              hallucinationFlag: { type: Type.BOOLEAN }
            },
            required: ["text", "type"]
          }
        }
      },
      required: ["results"]
    };
  } else if (entityType === 'risks') {
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        results: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
               title: { type: Type.STRING },
               mitigation: { type: Type.STRING },
               aiInsight: { type: Type.STRING },
               aiConfidenceScore: { type: Type.NUMBER },
               hallucinationFlag: { type: Type.BOOLEAN }
            },
            required: ["title"]
          }
        }
      },
      required: ["results"]
    };
  } else {
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        results: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                description: { type: Type.STRING },
                aiInsight: { type: Type.STRING },
                aiConfidenceScore: { type: Type.NUMBER },
                hallucinationFlag: { type: Type.BOOLEAN }
             },
             required: ["description"]
          }
        }
      },
      required: ["results"]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: parts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.results || [];
  } catch (error: any) {
    try {
      handleGeminiError(error);
    } catch(e: any) {
      console.warn("Hunter Error:", e.message);
      throw e;
    }
  }
}

export async function generateMockDocumentContent(filename: string) {
  try {
    const prompt = `You are a document extraction engine. Simulate the exact visual contents of a file named "${filename}" from an enterprise RFx (Request for Proposal / Quote) response project.
You must return your response as raw HTML. Do not use markdown backticks.
Use HTML tags like <h1>, <h2>, <ul>, <table>, <strong> to create a rich, realistic looking document.
Include realistic content related to the filename. Limit to 400-600 words.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Return ONLY raw HTML. No markdown formatting, no wrapping blocks.",
      }
    });
    return response.text || "<h1>Preview unavailable</h1>";
  } catch (error) {
    console.warn("Mock Doc Gen Error:", error);
    try {
      handleGeminiError(error);
    } catch(e: any) {
      if (e.message.includes('quota')) {
        return `<h1>Quota Exceeded</h1><p>${e.message}</p>`;
      }
      return "<h1>Error occurred while processing document content.</h1>";
    }
  }
}

export async function generateResponseDraft(data: { assumptions: Assumption[], risks: Risk[], requirements: any[] }) {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    You are the "Response Builder" (GEM 07). 
    Generate a high-level response summary for an RFx bid based on the following:
    
    Assumptions: ${JSON.stringify(data.assumptions)}
    Risks: ${JSON.stringify(data.risks)}
    Requirements identified: ${JSON.stringify(data.requirements)}
    
    Provide:
    1. Executive Summary Draft.
    2. Key Value Propositions.
    3. Suggested delivery approach adjustments based on risks.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert bid manager and technical writer. Draft responses that are winning, compliant, and professional.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            valuePropositions: { type: Type.ARRAY, items: { type: Type.STRING } },
            deliveryAdjustments: { type: Type.STRING }
          },
          required: ["executiveSummary", "valuePropositions", "deliveryAdjustments"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    try {
      handleGeminiError(error);
    } catch(e: any) {
      console.warn("Response Builder Error:", e.message);
      throw e;
    }
  }
}

export async function analyzeManifestRevision(fileName: string, fileContent: string) {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are an expert systems architect analyzing a new project manifest document.
    Your goal is to extract the intended capabilities and output them as a list of 'intents', 
    each containing specific technical 'tasks'. Additionally, identify any 'platformTasks' 
    which are consistency and integration updates required to safeguard overall coherence.
  `;

  const prompt = `
    Analyze the following manifest revision:
    File Name: ${fileName}
    Content: ${fileContent.slice(0, 10000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  intent: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["intent", "tasks"]
              }
            },
            platformTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["intents", "platformTasks"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    try {
      handleGeminiError(error);
    } catch(e: any) {
      console.warn("Manifest Analysis Error:", e.message);
      throw e;
    }
  }
}

export async function analyzeAddendum(addendumName: string, addendumContent: string, currentRequirements: any[]) {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are an expert RFx Addendum Analyzer.
    Your goal is to compare the new addendum document against the current list of requirements.
    Output which requirements are MODIFIED, which are DELETED, and extract any completely NEW requirements.
  `;

  const prompt = `
    Current Requirements:
    ${JSON.stringify(currentRequirements.map(req => ({ id: req.id, text: req.text })), null, 2)}
    
    Addendum File: ${addendumName}
    Addendum Content:
    ${addendumContent.slice(0, 15000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modifiedRequirements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  newText: { type: Type.STRING },
                  diffReason: { type: Type.STRING }
                },
                required: ["id", "newText", "diffReason"]
              }
            },
            newRequirements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['overt', 'implied', 'inferred', 'inter', 'hidden'] }
                },
                required: ["text", "type"]
              }
            },
            deletedRequirementIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["modifiedRequirements", "newRequirements", "deletedRequirementIds"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    try {
      handleGeminiError(error);
    } catch(e: any) {
      console.warn("Addendum Analysis Error:", e.message);
      throw e;
    }
  }
}
export async function optimizePackage(data: { assumptions: Assumption[], risks: Risk[] }) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are the "Remediation Rescore" gem (GEM 06).
    Perform a final optimization pass on the following registers.
    Identify any duplicate logic, contradictory assumptions, or insufficiently mitigated risks.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { text: prompt },
        { text: `DATA: ${JSON.stringify(data)}` }
      ],
      config: {
        systemInstruction: "You are the final quality gatekeeper. Be critical and focused on rescoring and remediation.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoreDelta: { type: Type.NUMBER, description: "Improvement score from 0-100" },
            remediationActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            isPackageReady: { type: Type.BOOLEAN }
          },
          required: ["scoreDelta", "remediationActions", "isPackageReady"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    try {
      handleGeminiError(error);
    } catch(e: any) {
      console.warn("Optimization Error:", e.message);
      throw e;
    }
  }
}

export async function executeCustomWorkflowStep(prompt: string, dataState: any, templates: any[] = [], personas: string[] = []) {
  const model = "gemini-3.1-pro-preview";
  try {
    const safeData = {
      files: dataState.files?.map((f: any) => ({ name: f.name, _type: 'file_ref_only' })),
      requirements: dataState.requirements?.slice(0, 50),
      assumptions: dataState.assumptions?.slice(0, 50),
      risks: dataState.risks?.slice(0, 50)
    };
    
    let templateInstructions = "";
    if (templates && templates.length > 0) {
      templateInstructions = `\nAssociated Templates for this Step:\n${templates.map(t => `- ${t.name} (${t.description})`).join('\n')}\nIf the prompt indicates you should generate an output document based on these templates, you may include "outputFiles" in your response.`;
    }

    let allAgentLogs = [];
    let combinedDataUpdate = {};
    let combinedOutputFiles = [];

    // Base workflow step
    const response = await ai.models.generateContent({
      model,
      contents: [
        { text: `System Context: You are executing a custom logic step inside the RFx TrueUp Engine workflow.\nInstruction:\n${prompt}\n\nCurrent State (Truncated):\n${JSON.stringify(safeData)}${templateInstructions}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN, description: "Whether the step was successful" },
            logMessage: { type: Type.STRING, description: "A message describing what the AI accomplished" },
            dataUpdate: { type: Type.OBJECT, description: "Any changes to apply to the RFx data state (e.g., updating risks, assumptions, lifecycle fields, etc.)" },
            outputFiles: { 
              type: Type.ARRAY, 
              description: "Files to generate and save in the outputs folder based on the templates",
              items: {
                type: Type.OBJECT,
                properties: {
                  filename: { type: Type.STRING, description: "Name of the file to create, e.g. filled_template.docx" },
                  content: { type: Type.STRING, description: "Markdown or text content of the generated file structure" }
                }
              }
            }
          },
          required: ["success", "logMessage"]
        }
      }
    });

    const parsedBaseResponse = JSON.parse(response.text || "{}");
    if (parsedBaseResponse.logMessage) allAgentLogs.push(`Main: ${parsedBaseResponse.logMessage}`);
    if (parsedBaseResponse.dataUpdate) combinedDataUpdate = { ...parsedBaseResponse.dataUpdate };
    if (parsedBaseResponse.outputFiles) combinedOutputFiles = [...parsedBaseResponse.outputFiles];

    if (personas && personas.length > 0) {
        const personaPromises = personas.map(async (persona) => {
            const agentPrompt = `You are a specialized expert agent focused on ${persona}. Scan the provided state with deep focus on issues related strictly to ${persona} and suggest specific insights or constraints. Align with the main workflow step instructions: ${prompt}.`;
            try {
                const agentResponse = await ai.models.generateContent({
                    model,
                    contents: [
                       { text: `System Context: Expert Agent ${persona} running in parallel inside RFx workflow.\nInstruction:\n${agentPrompt}\n\nCurrent State:\n${JSON.stringify(safeData)}` }
                    ],
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: { logMessage: { type: Type.STRING }, insights: { type: Type.ARRAY, items: { type: Type.STRING } } },
                            required: ["logMessage"]
                        }
                    }
                });
                const parsedAgent = JSON.parse(agentResponse.text || "{}");
                return { persona, log: parsedAgent.logMessage, insights: parsedAgent.insights || [] };
            } catch(e) {
                return { persona, log: "Failed to scan", insights: [] };
            }
        });

        const agentResults = await Promise.all(personaPromises);
        agentResults.forEach(res => {
            if (res.log) {
                allAgentLogs.push(`Agent[${res.persona}]: ${res.log}`);
            }
            if (res.insights.length > 0) {
                // merge insights into the payload somehow - let's add them to an aggregated insights field or just the log
                allAgentLogs.push(`Insights from ${res.persona}: ${res.insights.join('; ')}`);
            }
        });
    }

    return { 
        success: parsedBaseResponse.success !== false, 
        logMessage: allAgentLogs.join("\n"), 
        dataUpdate: Object.keys(combinedDataUpdate).length > 0 ? combinedDataUpdate : undefined,
        outputFiles: combinedOutputFiles.length > 0 ? combinedOutputFiles : undefined
    };

  } catch(error) {
    console.error("Execute Custom Step failed", error);
    return { success: false, logMessage: "Failed to execute AI step: " + String(error) };
  }
}

export async function generateExecutiveSummary(data: { requirements: any[], risks: any[], assumptions: any[] }): Promise<string> {
  const model = "gemini-3.1-pro-preview";
  const systemInstruction = `
    You are an expert Proposal Writer and Solutions Architect.
    Generate a 1-2 page Executive Summary / Cover Letter draft for a proposal based on the provided requirements, risks, and assumptions.
    The tone should be professional, persuasive, and confident. 
    Highlight how our understanding of the requirements makes us the best fit.
    Acknowledge but frame the risks as well-understood and mitigated.
    Use Markdown formatting.
  `;

  const payload = {
    totalRequirements: data.requirements?.length || 0,
    highPriorityRisks: data.risks?.filter((r: any) => r.impact === 'high' || r.impact === 'critical') || [],
    keyAssumptions: data.assumptions?.slice(0, 5) || [],
    sampleRequirements: data.requirements?.slice(0, 10) || []
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: JSON.stringify(payload),
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    return response.text || "Failed to generate executive summary.";
  } catch (error) {
    console.warn("Failed to generate executive summary:", error);
    throw error;
  }
}
