import '@/app/(frontend)/styles/pages.css'

import { listTeam } from '@/lib/data'
import { setRequestLocale } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { pageMeta, SITE_URL } from '@/lib/seo'

// Текст страницы — русский, перенесён из design/prototypes (перевод длинных текстов — отдельная задача, docs/CLAUDE-NOTES.md)
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, '/services', { title: 'Услуги агентства недвижимости в Алании', description: 'Подбор и показы, проверка документов, сопровождение сделки, ВНЖ и гражданство, управление арендой и продажа недвижимости в Алании. Цены на услуги.' })
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const team = await listTeam(locale)
  const by = (slug: string, kind: 'founder' | 'expert' | 'lawyer') => {
    const m = team.find((t) => t.slug === slug) || (kind !== 'expert' ? team.find((t) => t.kind === kind) : undefined)
    return m ? <p className="hint">Отвечает: <Link href={`/team/${m.slug}`} className="link">{m.name}</Link>, {m.role.toLowerCase()}</p> : null
  }
  const FAQ: [string, string][] = [["Нужно ли платить за подборку и показы?", "Нет. Консультация, подборка и показы бесплатны. Услуги агентства оплачиваются только после подписания договора купли-продажи."], ["Кто платит комиссию при покупке новостройки?", "Если объект от застройщика-партнёра, комиссию платит застройщик, а для вас цена такая же, как в отделе продаж."], ["Можно ли заказать только проверку документов?", "Да. Если вы нашли объект сами, юрист проверит ТАПУ, долги, разрешения и статус квартала для ВНЖ — от 300 € (демо), срок 3–5 дней."], ["Работаете ли вы с продавцами?", "Да. Оцениваем квартиру, делаем фото и видео, размещаем на русском, английском и турецком, проводим показы и сделку. Условия — 2% + KDV (демо)."], ["Что входит в управление арендой?", "Поиск и проверка арендаторов, договор, сбор оплаты, контроль состояния квартиры, мелкий ремонт и ежемесячный отчёт."]]
  const SERVICES: [string, string][] = [["Подбор и просмотр", "Подбираем объекты под бюджет и цель, показываем вживую или по видео и честно говорим о минусах."], ["Проверка документов", "Юрист проверяет объект до брони. Если вы нашли квартиру сами, проверим её отдельно."], ["Сопровождение сделки", "Ведём сделку от брони до ТАПУ и ключей: налоговый номер, счёт в банке, договор, оценка, кадастр, переводчик."], ["ВНЖ и гражданство", "Оформляем вид на жительство для всей семьи после покупки и ведём программу гражданства за инвестиции."], ["Управление арендой", "Сдаём квартиру, пока вас нет в Турции: находим арендаторов, проверяем их, собираем оплату и следим за квартирой."], ["Помощь после покупки", "Не пропадаем после сделки: помогаем обустроиться и решаем бытовые вопросы."], ["Продажа вашей недвижимости", "Собственникам в Алании: оценим квартиру, сделаем фото и видео, разместим в каталоге и на площадках, проведём сделку."]]
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Главная', '/'], ['Услуги', '/services']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const ld = [
    crumbs,
    { '@context': 'https://schema.org', '@type': 'RealEstateAgent', name: 'Kleo Homes', hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Услуги Kleo Homes', itemListElement: SERVICES.map(([name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description, areaServed: 'Alanya' } })) } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link>›<span aria-current="page">Услуги</span></nav>
          <span className="eyebrow">Услуги</span>
          <h1>Услуги Kleo Homes</h1>
          <p className="lead-t">Полный цикл: от подбора до ключей и сервис после покупки. Консультация и подборка бесплатны, за сделку платите только после подписания договора.</p>
          <div className="cta"><a href="#lead" className="btn btn-coral">Бесплатная консультация</a><a href="#prices" className="btn btn-ghost">Цены на услуги</a></div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sgrid">
            <article className="scard rv" id="selection">
              <div className="top"><span className="ic" aria-hidden="true">⌕</span><span className="price-tag free">Бесплатно</span></div>
              <h3>Подбор и просмотр</h3><p>Подбираем объекты под бюджет и цель, показываем вживую или по видео и честно говорим о минусах.</p>
              <ul className="checklist"><li>Подборка 5–10 объектов за 2–5 дней</li><li>Цена за м², дата проверки цены и смета расходов</li><li>Показы вживую с трансфером или по видеосвязи</li><li>Сравнение районов под ваш образ жизни</li></ul>
              <div className="acts"><Link href="/how-to-buy#step-2" className="btn btn-line btn-sm">Как проходит подбор</Link><Link href="/sale" className="btn btn-line btn-sm">Каталог</Link><a href="#lead" className="btn btn-dark btn-sm">Заказать</a></div>
              {by("anna-sokolova", "expert")}
            </article>
            <article className="scard rv" id="legal">
              <div className="top"><span className="ic" aria-hidden="true">§</span><span className="price-tag free">Входит в сделку</span></div>
              <h3>Проверка документов</h3><p>Юрист проверяет объект до брони. Если вы нашли квартиру сами, проверим её отдельно.</p>
              <ul className="checklist"><li>ТАПУ, долги и обременения</li><li>Разрешение на заселение (iskan) и перепланировки</li><li>Статус квартала для ВНЖ</li><li>Репутация и разрешения застройщика</li><li>Отдельная проверка объекта — от 300 € (демо)</li></ul>
              <div className="acts"><Link href="/how-to-buy#step-4" className="btn btn-line btn-sm">Когда проверяем</Link><Link href="/team/murat-kaya" className="btn btn-line btn-sm">Юрист агентства</Link><a href="#lead" className="btn btn-dark btn-sm">Заказать</a></div>
              {by("murat-kaya", "lawyer")}
            </article>
            <article className="scard rv" id="deal">
              <div className="top"><span className="ic" aria-hidden="true">✎</span><span className="price-tag">2% + KDV</span></div>
              <h3>Сопровождение сделки</h3><p>Ведём сделку от брони до ТАПУ и ключей: налоговый номер, счёт в банке, договор, оценка, кадастр, переводчик.</p>
              <ul className="checklist"><li>Налоговый номер и счёт в банке за 1 день</li><li>Договор на двух языках</li><li>Отчёт об оценке и запись в кадастр</li><li>Сделка удалённо по доверенности</li><li>Новостройки партнёров — комиссию платит застройщик</li></ul>
              <div className="acts"><Link href="/how-to-buy" className="btn btn-line btn-sm">Все 6 шагов покупки</Link><Link href="/how-to-buy#costs" className="btn btn-line btn-sm">Калькулятор расходов</Link><a href="#lead" className="btn btn-dark btn-sm">Заказать</a></div>
              {by("emre-yyldyz", "founder")}
            </article>
            <article className="scard rv" id="permits">
              <div className="top"><span className="ic" aria-hidden="true">✈</span><span className="price-tag free">ВНЖ — бесплатно</span></div>
              <h3>ВНЖ и гражданство</h3><p>Оформляем вид на жительство для всей семьи после покупки и ведём программу гражданства за инвестиции.</p>
              <ul className="checklist"><li>Проверка, подходит ли объект, до брони</li><li>Страховка, документы, запись в миграционную службу</li><li>Продление ВНЖ, пока объект ваш</li><li>Гражданство за покупку от 400 000 $ — по договору</li></ul>
              <div className="acts"><Link href="/residence-permit" className="btn btn-line btn-sm">ВНЖ при покупке</Link><Link href="/citizenship" className="btn btn-line btn-sm">Гражданство</Link><a href="#lead" className="btn btn-dark btn-sm">Заказать</a></div>
              {by("murat-kaya", "lawyer")}
            </article>
            <article className="scard rv" id="rental">
              <div className="top"><span className="ic" aria-hidden="true">⌂</span><span className="price-tag">от 15% аренды</span></div>
              <h3>Управление арендой</h3><p>Сдаём квартиру, пока вас нет в Турции: находим арендаторов, проверяем их, собираем оплату и следим за квартирой.</p>
              <ul className="checklist"><li>Долгосрочная аренда — 15% от платы (демо)</li><li>Сезонная аренда — 25% от дохода (демо)</li><li>Фото, объявления, показы, договор</li><li>Ежемесячный отчёт и мелкий ремонт</li><li>Расчёт доходности до покупки — бесплатно</li></ul>
              <div className="acts"><Link href="/blog/dokhodnost-arendy-v-alanii-skolko-realno-zarabotat" className="btn btn-line btn-sm">Доходность аренды</Link><Link href="/rent" className="btn btn-line btn-sm">Квартиры в аренду</Link><a href="#lead" className="btn btn-dark btn-sm">Заказать</a></div>
              {by("daniel-marten", "expert")}
            </article>
            <article className="scard rv" id="after">
              <div className="top"><span className="ic" aria-hidden="true">✓</span><span className="price-tag">По прайсу партнёров</span></div>
              <h3>Помощь после покупки</h3><p>Не пропадаем после сделки: помогаем обустроиться и решаем бытовые вопросы.</p>
              <ul className="checklist"><li>Переоформление воды, света, интернета</li><li>Страховка DASK и страховка квартиры</li><li>Пакеты мебели и ремонт от проверенных мастеров</li><li>Оплата aidat и коммунальных, пока вы не в Турции</li></ul>
              <div className="acts"><Link href="/how-to-buy#step-6" className="btn btn-line btn-sm">Что происходит после ТАПУ</Link><a href="#lead" className="btn btn-dark btn-sm">Заказать</a></div>
              {by("elena-demir", "expert")}
            </article>
            <article className="scard rv wide" id="sell">
              <div className="top"><span className="ic" aria-hidden="true">€</span><span className="price-tag">2% + KDV</span></div>
              <h3>Продажа вашей недвижимости</h3><p>Собственникам в Алании: оценим квартиру, сделаем фото и видео, разместим в каталоге и на площадках, проведём сделку.</p>
              <ul className="checklist"><li>Бесплатная оценка рыночной цены</li><li>Профессиональные фото и видео</li><li>Реклама на русском, английском и турецком</li><li>Показы и переговоры без вашего участия</li></ul>
              <div className="acts"><a href="#lead" className="btn btn-line btn-sm">Оценить мою квартиру</a><a href="#lead" className="btn btn-dark btn-sm">Заказать</a></div>
              {by("emre-yyldyz", "founder")}
            </article>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }} id="prices">
        <div className="wrap cols2">
          <div>
            <span className="eyebrow">Цены</span>
            <h2 style={{ margin: "8px 0 14px" }}>Сколько стоят услуги</h2>
            <p style={{ color: "#2B323C" }}>Все условия фиксируем в договоре до первого показа. Никаких скрытых платежей: госпошлины, налоги и услуги нотариуса оплачиваются по чекам и есть в смете.</p>
            <div className="contacts" style={{ marginTop: "18px" }}><Link href="/how-to-buy#costs" className="btn btn-dark">Калькулятор расходов на покупку</Link></div>
          </div>
          <table className="ptable"><caption className="vh">Цены на услуги (демо)</caption><thead><tr><th scope="col">Услуга</th><th scope="col" className="num">Стоимость (демо)</th></tr></thead><tbody>
            <tr><td>Подбор и просмотр</td><td className="num">бесплатно</td></tr><tr><td>Проверка документов при покупке через нас</td><td className="num">входит в сделку</td></tr><tr><td>Отдельная проверка объекта</td><td className="num">от 300 €</td></tr><tr><td>Сопровождение покупки (вторичка)</td><td className="num">2% + KDV 20%</td></tr><tr><td>Сопровождение покупки (новостройка партнёра)</td><td className="num">платит застройщик</td></tr><tr><td>ВНЖ для покупателей</td><td className="num">бесплатно (госпошлины отдельно)</td></tr><tr><td>Гражданство за инвестиции</td><td className="num">по договору</td></tr><tr><td>Долгосрочная аренда: поиск арендатора</td><td className="num">одна месячная плата</td></tr><tr><td>Управление арендой</td><td className="num">15–25% дохода</td></tr><tr><td>Продажа вашей недвижимости</td><td className="num">2% + KDV 20%</td></tr>
          </tbody></table>
        </div>
      </section>

      <section className="sec">
        <div className="wrap faq">
          <div><span className="eyebrow">Вопросы</span><h2 style={{ marginTop: "8px" }}>Частые вопросы об услугах</h2><p className="hint" style={{ marginTop: "10px" }}>Не нашли ответ? <a href="#lead" className="link">Спросите нас →</a></p></div>
          <div id="faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
