// Resolves a RASTER image path (png/jpg/…) to Cloudinary's CDN when configured,
// or keeps the local /public path as a fallback. SVGs and any non-raster asset
// are always kept local (they are tiny and some are referenced from shipped JS).
//
// Only the (public) cloud name is needed to deliver images — the API key/secret
// live only in the upload script. Keep FOLDER in sync with
// scripts/upload-cloudinary.mjs (CLOUDINARY_FOLDER).

const CLOUD = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME
const FOLDER = 'mypage'
const TRANSFORM = 'f_auto,q_auto'
const RASTER = /\.(png|jpe?g|gif|webp|avif|ico)$/i

export function cld(path: string): string {
  if (!CLOUD || !path.startsWith('/img/') || !RASTER.test(path)) return path

  const noExt = path.replace(/^\/img\//, '').replace(/\.[^./]+$/, '')
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${TRANSFORM}/${FOLDER}/${noExt}`
}
