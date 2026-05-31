const express = require('express')
const router = express.Router()
const { analyzeSkin } = require('../services/gemini')

router.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image is required' })
    }

    const result = await analyzeSkin(image)

    const poresMap = { отл: 90, хор: 75, норм: 60, увелич: 40, плохо: 30 }
    const textureMap = { гладкая: 95, хорошая: 80, хорошо: 80, норм: 65, неровная: 45 }

    res.json({
      skinScore: result.skinScore ?? 70,
      skinAge: result.skinAge ?? 25,
      realAge: null,
      ageDiff: null,
      hydration: result.hydration ?? 70,
      tone: result.tone ?? 70,
      pores: result.pores ?? 'норм',
      poresValue: poresMap[result.pores] ?? 60,
      texture: result.texture ?? 'норм',
      textureValue: textureMap[result.texture] ?? 65,
      skinType: result.skinType ?? 'комбинированная',
      highlights: result.highlights ?? [],
      tips: result.tips ?? [],
      ageMessage: result.ageMessage ?? 'Твоя кожа выглядит отлично!'
    })
  } catch (err) {
    console.error('Analyze error:', err)
    res.status(500).json({ error: 'Analysis failed', message: err.message })
  }
})

module.exports = router
