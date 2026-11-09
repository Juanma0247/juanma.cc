export const ALLOWED_EMAILS = [
  'juanmanueldiazgomez247@gmail.com',
  'judiazgom@unal.edu.co',
]

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBCMl-YozLCGBm3q3R0RYuXw3bt1T1qb64',
  authDomain: 'juamdg.firebaseapp.com',
  databaseURL: 'https://juamdg-default-rtdb.firebaseio.com',
  projectId: 'juamdg',
  storageBucket: 'juamdg.firebasestorage.app',
  messagingSenderId: '859606265564',
  appId: '1:859606265564:web:d24a76bad1823b08794e19',
}

export const ROOT_ID = 'root'

export const PATHS = {
  tree: 'notes/tree',
  text: 'notes/text',
  ydoc: 'notes/ydoc',
  usage: 'notes/usage',
  tools: 'notes/prefs/toolbar',
}

export function isAllowed(user) {
  if (!user || !user.email) return false
  return ALLOWED_EMAILS.includes(user.email.toLowerCase())
}
