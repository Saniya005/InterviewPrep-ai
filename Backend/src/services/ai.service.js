const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]

async function generateWithFallback(prompt, config = {}) {
    for (const model of MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: { responseMimeType: "application/json", ...config }
            })
            return response
        } catch (err) {
            console.log(`Model ${model} failed, trying next...`)
            if (model === MODELS[MODELS.length - 1]) throw err
        }
    }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert interview coach. Generate a detailed interview preparation report.

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

IMPORTANT: You MUST return exactly 10 technical questions and exactly 10 behavioral questions. No more, no less.

Return a JSON object with these exact keys:
- matchScore (number 0-100)
- technicalQuestions (array of EXACTLY 10 objects, each with: question, intention, answer)
- behavioralQuestions (array of EXACTLY 10 objects, each with: question, intention, answer)
- skillGaps (array of objects, each with: skill, severity where severity is low/medium/high)
- preparationPlan (array of exactly 7 objects, each with: day number, focus string, tasks array of strings)

Do not return fewer than 10 questions for either category. Count to make sure you have exactly 10 before responding.`

    const response = await generateWithFallback(prompt)
    const raw = JSON.parse(response.text)

    return {
        title: jobDescription.split('\n')[0].slice(0, 100) || "Interview Report",
        matchScore: raw.matchScore ?? raw.match_score ?? raw.score ?? 70,
        technicalQuestions: raw.technicalQuestions ?? raw.technical_questions ?? raw.technicalSkillsEvaluation ?? [],
        behavioralQuestions: raw.behavioralQuestions ?? raw.behavioral_questions ?? raw.behavioralSkillsEvaluation ?? [],
        skillGaps: (raw.skillGaps ?? raw.skill_gaps ?? []).map(s => ({
            skill: s.skill,
            severity: s.severity?.toLowerCase() ?? "medium"
        })),
       preparationPlan: (raw.preparationPlan ?? raw.preparation_plan ?? []).map((p, i) => ({
    day: p.day ?? p["day number"] ?? i + 1,
    focus: p.focus ?? p.topic ?? p.theme ?? p.title ?? "Day " + (i + 1),
    tasks: p.tasks ?? p.activities ?? p.items ?? []
})),
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })
    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm", bottom: "20mm",
            left: "15mm", right: "15mm"
        }
    })
    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume")
    })

    const prompt = `Generate resume for a candidate with the following details:
        Resume: ${resume}
        Self Description: ${selfDescription}
        Job Description: ${jobDescription}

        Return a JSON object with a single field "html" containing the HTML resume content.
        The resume should be tailored, ATS friendly, professional, and 1-2 pages long.`

    const response = await generateWithFallback(prompt, {
        responseSchema: zodToJsonSchema(resumePdfSchema)
    })

    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

async function generateRoadmap({ resume, jobDescription, selfDescription, days }) {
    const prompt = `Generate a ${days}-day interview preparation plan for this candidate.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return a JSON object with a single key "preparationPlan" which is an array of exactly ${days} objects, each with:
- day (number)
- focus (string)
- tasks (array of strings)

Return ONLY the JSON object, no markdown, no extra text.`

    const response = await generateWithFallback(prompt)
    const raw = JSON.parse(response.text)
    return raw.preparationPlan ?? raw.preparation_plan ?? []
}

module.exports = { generateInterviewReport, generateResumePdf, generateRoadmap }