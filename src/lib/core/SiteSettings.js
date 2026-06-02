import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

export const LANDING_CACHE_KEY = 'site-default-landing'

const firebaseConfig = {
  apiKey:            import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain:        import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)
const settingsRef = doc(db, 'settings', 'page')

export async function getSettings() {
  const snap = await getDoc(settingsRef)
  return snap.exists() ? snap.data() : null
}

export async function saveSettings(data) {
  await setDoc(settingsRef, data, { merge: true })
  if (data.defaultLanding !== undefined) {
    localStorage.setItem(LANDING_CACHE_KEY, data.defaultLanding)
  }
  if (data.theme !== undefined) {
    if (data.theme) localStorage.setItem('site-theme', data.theme)
    else localStorage.removeItem('site-theme')
  }
  if (data.customColors !== undefined) {
    if (data.customColors) localStorage.setItem('site-theme-custom', JSON.stringify(data.customColors))
    else localStorage.removeItem('site-theme-custom')
  }
  if (data.font !== undefined) {
    if (data.font) localStorage.setItem('site-font', data.font)
    else localStorage.removeItem('site-font')
  }
  if (data.lang !== undefined) {
    if (data.lang) localStorage.setItem('site-lang', data.lang)
    else localStorage.removeItem('site-lang')
  }
}
