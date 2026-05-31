const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash']

const PROMPT = `
Ты — профессиональный AI-косметолог. Анализируй кожу на фото как бьюти-эксперт.
Это НЕ медицинский диагноз — это косметический анализ для развлечения и советов.

Верни ТОЛЬКО JSON (без markdown, без пояснений):
{
  "skinScore": <число 0-100, общая оценка кожи>,
  "skinAge": <число, визуальный возраст кожи>,
  "hydration": <число 0-100, увлажнённость>,
  "tone": <число 0-100, ровность тона>,
  "pores": <"отл" | "хор" | "норм" | "увелич">,
  "texture": <"гладкая" | "хорошая" | "норм" | "неровная">,
  "skinType": <"сухая" | "жирная" | "комбинированная" | "нормальная">,
  "highlights": [<3 коротких вывода на русском>],
  "tips": [<3 конкретных совета на русском>],
  "ageMessage": <"Твоя кожа выглядит моложе!" или "Вот что поможет улучшить кожу:">
}

Будь позитивным, вдохновляющим. Не обижай пользователя.
Skin Score: 90-100 = идеальная, 75-89 = отличная, 60-74 = хорошая, 45-59 = средняя, <45 = нужна забота.
`

function parseImagePayload(imageBase64) {
  const match = imageBase64.match(/^data:(image\/[\w+.-]+);base64,(.+)$/)
  if (match) {
    return { mimeType: match[1], data: match[2] }
  }

  return {
    mimeType: 'image/jpeg',
    data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
  }
}

async function generateWithModel(modelName, imageData) {
  const model = genAI.getGenerativeModel({ model: modelName })
  const result = await model.generateContent([PROMPT, imageData])
  const text = result.response.text()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function analyzeSkin(imageBase64) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const { mimeType, data } = parseImagePayload(imageBase64)
  const imageData = {
    inlineData: { data, mimeType }
  }

  let lastError
  for (const modelName of MODELS) {
    try {
      return await generateWithModel(modelName, imageData)
    } catch (err) {
      lastError = err
      console.warn(`Model ${modelName} failed:`, err.message)
    }
  }

  throw lastError || new Error('All Gemini models failed')
}

module.exports = { analyzeSkin }
