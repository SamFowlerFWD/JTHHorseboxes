export default function cloudflareImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (src.startsWith('http')) {
    return src
  }

  return `/cdn-cgi/image/width=${width},quality=${quality || 80},format=auto${src}`
}
