// Выгружает демо-данные HTML-прототипа (design/prototypes/assets/data.js + posts.js) в src/seed/prototype-data.json.
// Запуск: node scripts/export-prototype-data.mjs — после правок демо-данных в прототипе.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const assets = path.join(root, 'design/prototypes/assets')
const store = new Map()
const ctx = {
  localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) },
  console,
}
ctx.window = ctx
vm.createContext(ctx)
for (const f of ['data.js', 'posts.js']) vm.runInContext(fs.readFileSync(path.join(assets, f), 'utf8'), ctx, { filename: f })
const KH = ctx.KH

// курсы валют из site.js: const RATES = { EUR: [1, '€'], USD: [1.09, '$'], ... }
const ratesSrc = /const RATES = (\{[^;]+\});/.exec(fs.readFileSync(path.join(assets, 'site.js'), 'utf8'))[1]
const rates = Object.fromEntries(Object.entries(vm.runInNewContext(`(${ratesSrc})`)).map(([k, [v]]) => [k, v]))

const districts = KH.DISTRICTS.map((d, i) => ({
  slug: d.slug, order: i * 10, name: d.name, nameIn: d.in, inland: !!d.inland, about: d.about, lead: d.lead,
  pros: d.pros || [], cons: d.cons || [], infra: d.infra || [], pricePerM2: d.pm, coastKm: d.pos,
  scores: d.sc || {}, lat: d.lat, lng: d.lng, x: d.x, y: d.y, img: d.img,
}))

const team = KH.teamAll().map((t) => ({
  key: t.id, name: t.name, role: t.role, kind: t.kind, langs: t.langs, exp: t.exp, img: t.img, areas: t.areas || [],
  spec: t.spec, bio: t.bio, help: t.help || [], order: t.order,
}))

// отзывы о сотрудниках + об агентстве, без повторов (как на странице reviews.html)
const reviews = KH.reviews().map((r) => ({ who: r.who, country: r.country || '', date: r.date, rating: r.rating, service: r.service, expert: r.expert || null, text: r.text }))

const properties = KH.SEED.map((o) => {
  const [lat, lng] = KH.coords(o)
  const d = KH.district(o.district)
  const typeName = KH.TYPES[o.type]
  return {
    id: o.id, deal: o.deal, status: o.status, title: o.title, type: o.type, district: o.district, rooms: o.rooms, area: o.area,
    floor: o.floor, floors: o.floors, sea: o.sea, price: o.price, img: o.img, view: o.seaView ? 'sea' : 'city',
    furnished: o.furnished ? 'yes' : 'no', condition: o.newBuild ? 'new' : 'resale', source: o.source, checked: o.checked,
    rent: o.rent || null, lat: +lat.toFixed(5), lng: +lng.toFixed(5),
    // то же демо-описание, что показывал property.html
    description: `Демо-описание. ${typeName} ${o.rooms} площадью ${o.area} м² в районе ${d.name}. Гостиная с кухней, ${o.rooms.split('+')[0]} спальни, балкон. Комплекс с бассейном и охраной, до моря около ${o.sea} м.\n\n${d.about}`,
  }
})

const posts = KH.POSTS.map((p) => ({
  id: p.id, kind: p.kind, category: p.cat, title: p.title, date: p.date, img: p.img, author: p.author, lead: p.lead || '',
  body: p.body || '', source: p.source || '', reviewed: p.reviewed || '', tags: p.tags || [],
  relatedDistricts: p.relatedDistricts || [], relatedProperties: p.relatedProperties || [], pinned: !!p.pinned,
}))

const out = {
  note: 'Снимок демо-данных прототипа. Не редактировать вручную: node scripts/export-prototype-data.mjs',
  galleryExtra: ['1502672260266-1c1ef2d93688', '1522708323590-d24dbb6b0267', '1560185007-cde436f6a4d0', '1484154218962-a197022b5858', '1586023492125-27b2c045efd7', '1600210492486-724fe5c67fb0'],
  company: KH.COMPANY, rates, teamPage: KH.TEAM_PAGE, districts, team, reviews, properties, posts,
}
const file = path.join(root, 'src/seed/prototype-data.json')
fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n')
console.log(`${file}: ${districts.length} районов, ${team.length} сотрудников, ${reviews.length} отзывов, ${properties.length} объектов, ${posts.length} публикаций`)
