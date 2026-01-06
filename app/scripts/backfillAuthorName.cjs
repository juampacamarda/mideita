// scripts/backfillAuthorName.js
const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id || 'mideita'
})

const db = admin.firestore()

async function run() {
  const snapshot = await db.collection('ideas').get()
  for (const doc of snapshot.docs) {
    const data = doc.data()
    if (!data.authorName) {
      let authorName = data.userEmail || 'Anónimo'
      if (data.userId && data.userId !== 'guest') {
        try {
          const user = await admin.auth().getUser(data.userId)
          authorName = user.displayName || user.email || authorName
        } catch (e) {}
      }
      await doc.ref.update({ authorName })
      console.log(`Updated ${doc.id} -> ${authorName}`)
    }
  }
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })