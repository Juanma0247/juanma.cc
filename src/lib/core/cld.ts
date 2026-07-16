// Resolves an image path to Cloudinary's CDN when configured, or keeps the
// local /public path as a fallback. Only the (public) cloud name is needed to
// deliver images — the API key/secret live only in the upload script.
//
// Keep FOLDER in sync with scripts/upload-cloudinary.mjs (CLOUDINARY_FOLDER).

const CLOUD = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME
const FOLDER = 'mypage'
const TRANSFORM = 'f_auto,q_auto'

export function cld(path: string): string {
  if (!CLOUD || !path.startsWith('/img/')) return path

  const rel = path.replace(/^\/img\//, '')
  const noExt = rel.replace(/\.[^./]+$/, '')

  // SVGs are delivered as-is (no raster transform), everything else is
  // auto-format + auto-quality optimized by Cloudinary.
  if (rel.toLowerCase().endsWith('.svg')) {
    return `https://res.cloudinary.com/${CLOUD}/image/upload/${FOLDER}/${noExt}.svg`
  }
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${TRANSFORM}/${FOLDER}/${noExt}`
}
