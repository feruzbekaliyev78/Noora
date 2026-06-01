import { doc, setDoc } from 'firebase/firestore'
import { getFaceDescriptor, isSameFace } from '../utils/faceRecognition'
import { getDb } from './firebase'

export const saveAnalysisCache = async (userId, imageElement, analysisData, profile = {}) => {
  try {
    let descriptor = null
    if (imageElement) {
      descriptor = await getFaceDescriptor(imageElement)
    }

    const data = {
      ...analysisData,
      userName: profile.name || analysisData.userName,
      userAge: profile.age ?? analysisData.userAge,
      faceDescriptor: descriptor,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    localStorage.setItem('lastAnalysis', JSON.stringify(data))

    const firestore = getDb()
    if (firestore) {
      await setDoc(doc(firestore, 'analyses', userId), data)
    }

    return data
  } catch (err) {
    console.warn('Analysis cache save failed:', err)
    return null
  }
}

export const checkCache = async (imageElement) => {
  try {
    const cached = localStorage.getItem('lastAnalysis')
    if (!cached) return null

    let data
    try {
      data = JSON.parse(cached)
    } catch {
      localStorage.removeItem('lastAnalysis')
      return null
    }

    if (new Date() > new Date(data.expiresAt)) {
      localStorage.removeItem('lastAnalysis')
      return null
    }

    if (!imageElement) return null

    const newDescriptor = await getFaceDescriptor(imageElement)
    if (!newDescriptor || !data.faceDescriptor) return null

    const same = isSameFace(data.faceDescriptor, newDescriptor)
    if (same) return data

    return null
  } catch (err) {
    console.warn('Analysis cache check failed:', err)
    return null
  }
}
