import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
}

let db = null

function getDb() {
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

  return addDoc(collection(firestore, 'users', userId, 'analyses'), {
    ...analysisData,
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
