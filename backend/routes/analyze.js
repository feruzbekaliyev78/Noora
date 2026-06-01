const express = require('express')
const router = express.Router()
const { analyzeSkin, detectFace } = require('../services/gemini')

function calculateSkinScore(data) {
  const poresMap = { отл: 100, хор: 80, норм: 60, увелич: 30 }
  const textureMap = { гладкая: 100, хорошая: 80, норм: 60, неровная: 30 }
  const acneMap = { нет: 100, единичные: 70, умеренное: 40, выраженное: 10 }
  const wrinklesMap = { нет: 100, первые: 70, заметные: 40 }

  const score = Math.round(
    data.hydration * 0.20 +
    data.tone * 0.15 +
    data.evenness * 0.15 +
    (poresMap[data.pores] ?? 60) * 0.12 +
    (textureMap[data.texture] ?? 60) * 0.12 +
    (100 - data.redness) * 0.10 +
    (acneMap[data.acne] ?? 70) * 0.08 +
    (100 - data.pigmentation) * 0.05 +
    (wrinklesMap[data.wrinkles] ?? 70) * 0.03
  )

  return Math.min(97, Math.max(20, score))
}

router.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image is required' })
    }

    const hasFace = await detectFace(image)
    if (!hasFace) {
      return res.status(400).json({
        error: 'NO_FACE',
        message: 'Лицо не найдено. Сделайте селфи!'
      })
    }

    const result = await analyzeSkin(image)

    const poresMap = { отл: 100, хор: 80, норм: 60, увелич: 30 }
    const textureMap = { гладкая: 100, хорошая: 80, норм: 60, неровная: 30 }

    const normalized = {
      skinAge: result.skinAge ?? 25,
      skinType: result.skinType ?? 'комбинированная',
      hydration: result.hydration ?? 70,
      tone: result.tone ?? 70,
      pores: result.pores ?? 'норм',
      texture: result.texture ?? 'норм',
      redness: result.redness ?? 30,
      darkCircles: result.darkCircles ?? 'слабые',
      pigmentation: result.pigmentation ?? 25,
      dehydration: result.dehydration ?? 30,
      oiliness: result.oiliness ?? 40,
      acne: result.acne ?? 'нет',
      wrinkles: result.wrinkles ?? 'нет',
      evenness: result.evenness ?? 65,
      zones: {
        forehead: result.zones?.forehead ?? 65,
        nose: result.zones?.nose ?? 65,
        cheeks: result.zones?.cheeks ?? 65,
        chin: result.zones?.chin ?? 65
      },
      highlights: result.highlights ?? [],
      tips: result.tips ?? [],
      aiQuestions: result.aiQuestions ?? []
    }

    const skinScore = calculateSkinScore(normalized)

    res.json({
      skinScore,
      ...normalized,
      realAge: null,
      ageDiff: null,
      poresValue: poresMap[normalized.pores] ?? 60,
      textureValue: textureMap[normalized.texture] ?? 60,
      ageMessage: normalized.skinAge <= 25
        ? 'Твоя кожа выглядит моложе!'
        : 'Вот что поможет улучшить кожу:'
    })
  } catch (err) {
    console.error('Analyze error:', err)
    res.status(500).json({ error: 'Analysis failed', message: err.message })
  }
})

module.exports = router
