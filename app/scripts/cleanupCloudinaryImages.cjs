const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const cloudinary = require('cloudinary').v2

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json')
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Falta serviceAccountKey.json en app/')
  process.exit(1)
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf-8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
})

const db = admin.firestore()

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dvfrbmxor',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function cleanupDeletedImages() {
  try {
    console.log('🔄 Iniciando limpieza de imágenes...\n')

    // 1. Obtener todos los IDs de ideas ACTIVAS
    console.log('📋 Obteniendo ideas activas de Firestore...')
    const ideasSnapshot = await db.collection('ideas').get()
    const activeIdeaIds = new Set(ideasSnapshot.docs.map(doc => doc.id))
    console.log(`✅ Ideas activas encontradas: ${activeIdeaIds.size}\n`)

    // 2. Obtener TODAS las imágenes de Cloudinary
    console.log('📸 Obteniendo imágenes de Cloudinary...')
    const resources = await cloudinary.api.resources_by_tag('mideita_upload', {
      max_results: 500
    })
    console.log(`✅ Imágenes en Cloudinary: ${resources.resources.length}\n`)

    // 3. Identificar imágenes huérfanas
    console.log('🔍 Analizando imágenes huérfanas...')
    const orphanedImages = []

    for (const resource of resources.resources) {
      const ideaTag = resource.tags?.find((tag) =>
        tag.startsWith('idea_')
      )

      if (ideaTag) {
        const ideaId = ideaTag.replace('idea_', '')
        
        // Si la idea NO existe en Firestore, es huérfana
        if (!activeIdeaIds.has(ideaId)) {
          orphanedImages.push({
            public_id: resource.public_id,
            ideaId: ideaId
          })
        }
      }
    }

    console.log(`🗑️  Imágenes huérfanas encontradas: ${orphanedImages.length}\n`)

    if (orphanedImages.length === 0) {
      console.log('✅ No hay imágenes huérfanas. Base limpia.\n')
      process.exit(0)
    }

    // 4. Mostrar lista
    console.log('📋 Imágenes a eliminar:')
    orphanedImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.public_id} (idea: ${img.ideaId})`)
    })
    console.log('')

    // 5. Eliminar
    console.log('⏳ Eliminando imágenes...\n')
    let deletedCount = 0
    let errorCount = 0

    for (const img of orphanedImages) {
      try {
        await cloudinary.uploader.destroy(img.public_id)
        console.log(`✅ Eliminada: ${img.public_id}`)
        deletedCount++
      } catch (error) {
        console.error(`❌ Error eliminando ${img.public_id}:`, error)
        errorCount++
      }
    }

    console.log(`\n📊 Resumen:`)
    console.log(`  ✅ Eliminadas: ${deletedCount}`)
    console.log(`  ❌ Errores: ${errorCount}`)
    console.log(`  💾 Total en Firestore: ${activeIdeaIds.size}`)
    console.log('\n✨ Limpieza completada')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error en limpieza:', error)
    process.exit(1)
  }
}

// Ejecutar
cleanupDeletedImages()