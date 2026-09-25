import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Districts } from './collections/Districts'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Properties } from './collections/Properties'
import { Reviews } from './collections/Reviews'
import { Team } from './collections/Team'
import { Users } from './collections/Users'
import { Company } from './globals/Company'
import { Rates } from './globals/Rates'
import { TeamPage } from './globals/TeamPage'
import { LOCALES, DEFAULT_LOCALE } from './i18n/locales'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const smtp = process.env.SMTP_HOST
const from = /^(.*?)\s*<(.+)>$/.exec(process.env.SMTP_FROM || '') ?? [null, 'Kleo Homes', 'no-reply@kleohomes.com']

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — Kleo Homes', robots: 'noindex, nofollow' },
    importMap: { baseDir: path.resolve(dirname) },
    dateFormat: 'dd.MM.yyyy HH:mm',
    components: {
      // кнопка «Загрузить демо-данные» видна только администратору (проверка в компоненте-обёртке)
      beforeDashboard: ['@/components/admin/SeedBlock#SeedBlock'],
    },
  },
  i18n: { supportedLanguages: { ru, en }, fallbackLanguage: 'ru' },
  localization: {
    locales: LOCALES.map((code) => ({ code, label: { ru: 'Русский', en: 'English', tr: 'Türkçe' }[code] })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  collections: [Properties, Districts, Posts, Team, Reviews, Leads, Media, Users],
  globals: [Company, Rates, TeamPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // ID объектов сохраняются при импорте из прототипа (№1031, №2012…)
    allowIDOnCreate: true,
    // схема меняется только миграциями (src/migrations), в том числе локально
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  // без SMTP письма пишутся в лог сервера
  email: smtp
    ? nodemailerAdapter({
        defaultFromName: from[1] || 'Kleo Homes',
        defaultFromAddress: from[2] || 'no-reply@kleohomes.com',
        transportOptions: {
          host: smtp,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  sharp,
  plugins: [
    // фото на Vercel хранятся в Blob; локально без токена — в папке /media
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      alwaysInsertFields: true,
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  ],
})
