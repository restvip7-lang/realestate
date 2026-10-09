import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    // фото из админки: локально через /api/media, на Vercel — из Blob
    localPatterns: [{ pathname: '/api/media/file/**' }],
    // фото объектов из Stay Portfolio показываем по ссылке, без оптимизатора Vercel (unoptimized), см. docs/stay-import.md
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'portfolio.stayrepo.com', pathname: '/lbi-content/**' },
      // обложки новостей и услуг Stay Property (показываются без оптимизатора, unoptimized)
      { protocol: 'https', hostname: 'eu2.contabostorage.com', pathname: '/eeb8c723fe9e48fb9591639419bc7af9:stay-media/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
