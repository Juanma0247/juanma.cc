import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

class Database {
  constructor() {
    const config = {
      apiKey:            import.meta.env.PUBLIC_FIREBASE_API_KEY,
      authDomain:        import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId:         import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket:     import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.PUBLIC_FIREBASE_APP_ID,
      measurementId:     import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
    }
    this.app = getApps().length ? getApps()[0] : initializeApp(config)
    this.firestore = getFirestore(this.app)
  }

  async setDocument(col, id, fields, callback = () => {}) {
    try {
      await setDoc(doc(collection(this.firestore, col), id), fields)
      callback()
      return true
    } catch (e) {
      alert(`Error: ${e}`)
      return false
    }
  }

  async getCollection(col, callback) {
    try {
      const res = {}
      const snapshot = await getDocs(collection(this.firestore, col))
      snapshot.forEach(d => { res[d.id] = d.data() })
      callback(res)
    } catch (e) {
      alert(`Error: ${e}`)
    }
  }

  async listenCollection(col, callback) {
    const colRef = collection(this.firestore, col)
    return onSnapshot(colRef, snapshot => {
      const res = {}
      snapshot.forEach(d => { res[d.id] = d.data() })
      callback(res)
    })
  }

  async updateDocument(col, id, fields, callback = () => {}) {
    try {
      await updateDoc(doc(this.firestore, col, id), fields)
      callback()
      return true
    } catch (e) {
      alert(`Error: ${e}`)
      return false
    }
  }

  async onChangeDocs(col, callback = () => {}) {
    const colRef = collection(this.firestore, col)
    onSnapshot(colRef, snapshot => {
      const changed = []
      snapshot.docChanges().forEach(change => {
        changed.push({ id: change.doc.id, type: change.type })
      })
      callback(changed)
    })
  }

  async delDocument(id, col, message) {
    try {
      const docRef = doc(collection(this.firestore, col), id)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        await deleteDoc(docRef)
        return true
      }
      alert('Element not found')
      return false
    } catch (e) {
      alert(`Error: ${e}`)
      return false
    }
  }

  async deleteAllDocuments(col, callback = () => {}) {
    const snapshot = await getDocs(collection(this.firestore, col))
    const promises = []
    snapshot.forEach(d => { promises.push(deleteDoc(doc(this.firestore, col, d.id))) })
    await Promise.all(promises)
    callback()
  }

  async deleteCollection(col, callback) {
    try {
      const snapshot = await getDocs(collection(this.firestore, col))
      await Promise.all(snapshot.docs.map(d => deleteDoc(doc(this.firestore, col, d.id))))
      callback()
    } catch (e) {
      alert(`Error deleting collection: ${e}`)
      return false
    }
  }
}

export default Database