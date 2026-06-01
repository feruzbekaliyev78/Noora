const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash']

const PROMPT = `
Ты — профессиональный AI-косметолог. Анализируй кожу на фото.
Это НЕ медицинский диагноз — косметический бьюти-анализ.
Все советы основаны на научных исследованиях дерматологов.
Будь ЧЕСТНЫМ и СТРОГИМ — не завышай оценки.

Верни ТОЛЬКО JSON без markdown:
{
  "skinAge": <число — визуальный возраст кожи>,
  "skinType": <"сухая"|"жирная"|"комбинированная"|"нормальная">,

  "hydration": <0-100>,
  "tone": <0-100>,
  "pores": <"отл"|"хор"|"норм"|"увелич">,
  "texture": <"гладкая"|"хорошая"|"норм"|"неровная">,

  "redness": <0-100, уровень покраснений>,
  "darkCircles": <"нет"|"слабые"|"заметные"|"выраженные">,
  "pigmentation": <0-100>,
  "dehydration": <0-100>,
  "oiliness": <0-100, жирность Т-зоны>,
  "acne": <"нет"|"единичные"|"умеренное"|"выраженное">,
  "wrinkles": <"нет"|"первые"|"заметные">,
  "evenness": <0-100, ровность тона>,

  "zones": {
    "forehead": <0-100>,
    "nose": <0-100>,
    "cheeks": <0-100>,
    "chin": <0-100>
  },

  "highlights": [<3 коротких вывода на русском>],
  "tips": [<3 научно обоснованных совета>],

  "aiQuestions": [
    <3 вопроса пользователю основанных на результате анализа>
  ]
}

ВАЖНО:
- Оценивай СТРОГО и ЧЕСТНО
- Большинство людей 50-75 баллов
- Только идеальная кожа 85+
- Никогда не давай выше 95
- Минимум 20
`

const FACE_CHECK_PROMPT = 'Is there a human face in this photo? Answer only YES or NO'

const GENERATION_CONFIG = {
  temperature: 0.1,
  topP: 0.8,
  topK: 10
}

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

function parseModelJson(text) {
  const clean = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Invalid JSON from Gemini')
  }
}

function parseYesNo(text) {
  const clean = text.trim().toUpperCase()
  if (clean.includes('YES')) return true
  if (clean.includes('NO')) return false
  return false
}

async function checkFaceWithModel(modelName, imageData, retries = 2) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { ...GENERATION_CONFIG, temperature: 0 }
  })

  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent([FACE_CHECK_PROMPT, imageData])
      const text = result.response.text()
      return parseYesNo(text)
    } catch (err) {
      lastError = err
      const retryable = /503|429|high demand|unavailable/i.test(err.message || '')
      if (attempt < retries && retryable) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }
      throw err
    }
  }

  throw lastError
}

async function detectFace(imageBase64) {
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
      return await checkFaceWithModel(modelName, imageData)
    } catch (err) {
      lastError = err
      console.warn(`Face check model ${modelName} failed:`, err.message)
    }
  }

  throw lastError || new Error('Face detection failed')
}

async function generateWithModel(modelName, imageData, retries = 2) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: GENERATION_CONFIG
  })

  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent([PROMPT, imageData])
      const text = result.response.text()
      return parseModelJson(text)
    } catch (err) {
      lastError = err
      const retryable = /503|429|high demand|unavailable/i.test(err.message || '')
      if (attempt < retries && retryable) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }
      throw err
    }
  }

  throw lastError
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

module.exports = { analyzeSkin, detectFace }
