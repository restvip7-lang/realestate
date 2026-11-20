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
    // фото из CRM показываем без оптимизатора Vercel (unoptimized) по адресам /img/… (rewrites ниже)
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  // Фото объектов и обложки из CRM — по адресу нашего сайта, без чужих доменов в коде страниц.
  // Префиксы совпадают с IMAGE_PROXIES в src/lib/data.ts. «%3A» — двоеточие в имени корзины (просто «:» Next читает как параметр).
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/img/p/:path*', destination: 'https://portfolio.stayrepo.com/lbi-content/:path*' },
        { source: '/img/m/:path*', destination: 'https://eu2.contabostorage.com/eeb8c723fe9e48fb9591639419bc7af9%3Astay-media/:path*' },
        { source: '/img/n/:path*', destination: 'https://stay-property.fra1.cdn.digitaloceanspaces.com/:path*' },
      ],
    }
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
  // фото команды для кнопки «Загрузить демо-данные» (src/seed/team-photos.ts читает их с диска)
  outputFileTracingIncludes: { '/next/seed': ['./src/seed/team/*.jpg'] },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
