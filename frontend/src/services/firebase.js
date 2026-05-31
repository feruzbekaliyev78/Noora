import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
}

let db = null

export function getDb() {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) return null
  if (!db) {
    const app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  }
  return db
}

export async function saveAnalysis(userId, analysisData) {
  const firestore = getDb()
  if (!firestore) return null

  const {
    image,
    faceDescriptor,
    expiresAt,
    ...trackingFields
  } = analysisData

  return addDoc(collection(firestore, 'users', userId, 'analyses'), {
    skinScore: trackingFields.skinScore,
    skinAge: trackingFields.skinAge,
    hydration: trackingFields.hydration,
    tone: trackingFields.tone,
    pores: trackingFields.pores,
    texture: trackingFields.texture,
    redness: trackingFields.redness,
    darkCircles: trackingFields.darkCircles,
    pigmentation: trackingFields.pigmentation,
    dehydration: trackingFields.dehydration,
    oiliness: trackingFields.oiliness,
    acne: trackingFields.acne,
    wrinkles: trackingFields.wrinkles,
    evenness: trackingFields.evenness,
    zones: trackingFields.zones,
    skinType: trackingFields.skinType,
    userName: trackingFields.userName,
    userAge: trackingFields.userAge,
    createdAt: new Date()
  })
}

export async function getHistory(userId) {
  const firestore = getDb()
  if (!firestore) return []

  const q = query(
    collection(firestore, 'users', userId, 'analyses'),
    orderBy('createdAt', 'desc'),
    limit(10)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}
