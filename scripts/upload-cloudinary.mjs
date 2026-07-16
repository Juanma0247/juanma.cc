// Uploads local RASTER images (png/jpg/…) to Cloudinary so they are served from
// its CDN instead of the app host. SVGs are skipped on purpose — they are tiny
// and some are referenced from shipped JS. Idempotent: re-running overwrites the
// same public_id.
//
// Usage:
//   node scripts/upload-cloudinary.mjs                 # uploads all of public/img
//   node scripts/upload-cloudinary.mjs img/juanma      # uploads a subtree
//   node scripts/upload-cloudinary.mjs img/built       # uploads a subtree
//
// Requires (local only, never deployed):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// Optional: CLOUDINARY_FOLDER (default "mypage") — must match src/lib/core/cld.ts

import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'

const root = path.resolve(fileURLToPath(import.meta.url), '../..')

// Load .env manually (no dependency on dotenv).
try {
  const { readFileSync } = await import('node:fs')
  const env = readFileSync(path.join(root, '.env'), 'utf8')
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {}

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME
const KEY = process.env.CLOUDINARY_API_KEY
const SECRET = process.env.CLOUDINARY_API_SECRET
const FOLDER = process.env.CLOUDINARY_FOLDER ?? 'mypage'

if (!CLOUD || !KEY || !SECRET) {
  console.error('Faltan credenciales: define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env')
  process.exit(1)
}

cloudinary.config({ cloud_name: CLOUD, api_key: KEY, api_secret: SECRET, secure: true })

const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.avif'])
const target = path.join(root, 'public', process.argv[2] ?? 'img')
const imgRoot = path.join(root, 'public', 'img')

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (IMG_EXT.has(path.extname(entry.name).toLowerCase())) yield full
  }
}

let ok = 0
let fail = 0
for await (const file of walk(target)) {
  // public_id mirrors the path under public/img, without extension, e.g.
  // public/img/built/shots/el-condor.png -> mypage/built/shots/el-condor
  const rel = path.relative(imgRoot, file).replace(/\\/g, '/')
  const publicId = `${FOLDER}/${rel.replace(/\.[^./]+$/, '')}`
  try {
    const res = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      invalidate: true,
    })
    ok++
    console.log(`✓ ${rel}  ->  ${res.secure_url}`)
  } catch (err) {
    fail++
    console.error(`✗ ${rel}: ${err?.message ?? err}`)
  }
}

console.log(`\nHecho. Subidas: ${ok}${fail ? ` · Fallidas: ${fail}` : ''}`)
process.exit(fail ? 1 : 0)
