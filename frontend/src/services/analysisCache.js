import { doc, setDoc } from 'firebase/firestore'
import { getFaceDescriptor, isSameFace } from '../utils/faceRecognition'
import { getDb } from './firebase'

export const saveAnalysisCache = async (userId, imageElement, analysisData, profile = {}) => {
  const descriptor = await getFaceDescriptor(imageElement)

  const data = {
    ...analysisData,
    userName: profile.name || analysisData.userName,
    userAge: profile.age ?? analysisData.userAge,
    faceDescriptor: descriptor,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }

  const firestore = getDb()
  if (firestore) {
    await setDoc(doc(firestore, 'analyses', userId), data)
  }

  localStorage.setItem('lastAnalysis', JSON.stringify(data))
  return data
}

export const checkCache = async (imageElement) => {
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

  const newDescriptor = await getFaceDescriptor(imageElement)
  if (!newDescriptor) return null

  const same = isSameFace(data.faceDescriptor, newDescriptor)
  if (same) return data

  return null
}
