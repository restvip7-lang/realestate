import '@/app/(frontend)/styles/pages.css'

import Image from 'next/image'

import { Price } from '@/components/site/Currency'
import { PropertyCard } from '@/components/site/PropertyCard'
import { allPublished, getCompany, getRates, listTeam, mediaUrl } from '@/lib/data'
import { setRequestLocale } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { pageMeta, SITE_URL } from '@/lib/seo'

// Текст страницы — русский, перенесён из design/prototypes (перевод длинных текстов — отдельная задача, docs/CLAUDE-NOTES.md)
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, '/residence-permit', { title: 'ВНЖ в Турции при покупке жилья в Алании', description: 'ВНЖ по праву собственности: условия, открытые кварталы, документы, сроки и расходы. Объекты в Алании, подходящие для ВНЖ.' })
}

export default async function ResidencePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [company, team, rates, published] = await Promise.all([getCompany(locale), listTeam(locale), getRates(), allPublished(locale)])
  const minEur = 200000 / (rates.USD || 1)
  const objs = published.filter((o) => o.deal === 'sale' && ((o.price ?? 0) >= minEur || o.residence)).sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
  const lawyer = team.find((t) => t.kind === 'lawyer') || team[0]
  const lawyerImg = mediaUrl(lawyer?.photo, 'thumb')
  const FAQ: [string, React.ReactNode, string][] = [["Можно ли получить ВНЖ, если жильё дешевле 200 000 $?", <>По основанию собственности — нет (демо-условие для Анталии). Можно оформить туристический ВНЖ по договору аренды или купить объект дороже. Поможем выбрать вариант.</>, "По основанию собственности — нет (демо-условие для Анталии). Можно оформить туристический ВНЖ по договору аренды или купить объект дороже. Поможем выбрать вариант."], ["Как продлить ВНЖ?", <>Пока объект в вашей собственности, ВНЖ продлевается: подаёте заявку до окончания срока карты. Напомним и подготовим документы.</>, "Пока объект в вашей собственности, ВНЖ продлевается: подаёте заявку до окончания срока карты. Напомним и подготовим документы."], ["Получит ли ВНЖ семья?", <>Да, супруг(а) и дети до 18 лет получают ВНЖ как члены семьи собственника. Нужны свидетельства о браке и рождении с апостилем и переводом.</>, "Да, супруг(а) и дети до 18 лет получают ВНЖ как члены семьи собственника. Нужны свидетельства о браке и рождении с апостилем и переводом."], ["Можно ли работать с ВНЖ собственника?", <>Нет. Для работы в Турции нужно отдельное разрешение на работу. ВНЖ даёт право жить, открыть счёт, подключить коммунальные услуги и оформить страховку.</>, "Нет. Для работы в Турции нужно отдельное разрешение на работу. ВНЖ даёт право жить, открыть счёт, подключить коммунальные услуги и оформить страховку."], ["Как узнать, открыт ли квартал для ВНЖ?", <>Список закрытых кварталов публикует миграционная служба и регулярно обновляет. Мы проверяем адрес каждого объекта до брони и пишем об изменениях в <Link href="/news" className="link">новостях</Link>.</>, "Список закрытых кварталов публикует миграционная служба и регулярно обновляет. Мы проверяем адрес каждого объекта до брони и пишем об изменениях в новостях."], ["Можно ли потом получить гражданство?", <>После нескольких лет непрерывного проживания можно подать на гражданство на общих основаниях, а при покупке от 400 000 $ — по <Link href="/citizenship" className="link">программе инвестиций</Link>.</>, "После нескольких лет непрерывного проживания можно подать на гражданство на общих основаниях, а при покупке от 400 000 $ — по программе инвестиций."]]
  const objsBlock = objs.length ? (
    <div className="grid3 limit4">{objs.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}</div>
  ) : (
    <div className="empty"><b>Сейчас в каталоге нет объектов от 200,000 $</b>Подберём у застройщиков-партнёров или предложим несколько объектов на нужную сумму.<a href="#lead" className="btn btn-line btn-sm" style={{ marginTop: 14 }}>Оставить заявку</a></div>
  )
  const lawyerBox = lawyer ? (
    <div className="author-box" style={{ maxWidth: 'none' }}>
      {lawyerImg && <Image src={lawyerImg} alt={lawyer.name} width={160} height={160} />}
      <div>
        <span className="hint">Консультирует</span><br />
        <b>{lawyer.name}</b> · <span className="hint">{lawyer.role}, {lawyer.exp} лет опыта</span>
        {lawyer.bio && <p>{lawyer.bio}</p>}
        <div className="contacts">
          <a href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Здравствуйте! Вопрос юристу о ВНЖ при покупке жилья.")}`} className="btn btn-wa btn-sm">Спросить юриста в WhatsApp</a>
          <Link href={`/team/${lawyer.slug}`} className="btn btn-line btn-sm">Профиль</Link>
        </div>
      </div>
    </div>
  ) : null
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Главная', '/'], ['ВНЖ при покупке жилья', '/residence-permit']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const ld = [crumbs, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, , a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link>›<span aria-current="page">ВНЖ при покупке жилья</span></nav>
          <span className="eyebrow">Вид на жительство</span>
          <h1>ВНЖ Турции при покупке жилья в Алании</h1>
          <p className="lead-t">Собственник жилья может получить вид на жительство для себя и семьи. Проверим, подходит ли объект и открыт ли квартал для ВНЖ, и поможем с документами до получения карты.</p>
          <div className="cta"><a href="#objects" className="btn btn-coral">Объекты под ВНЖ</a><a href="#lead" className="btn btn-ghost">Проверить объект</a></div>
        </div>
      </section>

      <div className="wrap">
        <div className="kfacts k4" role="list" aria-label="Главное о ВНЖ">
          <div role="listitem"><span>Стоимость объекта</span><b>от 200 000 $</b><small>≈ <Price eur={minEur} /></small></div>
          <div role="listitem"><span>Срок карты</span><b>1–2 года</b><small>продлевается, пока объект ваш</small></div>
          <div role="listitem"><span>Оформление</span><b>1–2 мес.</b><small>от подачи до карты</small></div>
          <div role="listitem"><span>Кто получает</span><b>Вся семья</b><small>супруг(а) и дети до 18 лет</small></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box">
            <h3>Условия</h3>
            <ul className="checklist">
              <li>Жильё в собственности, ТАПУ на ваше имя</li>
              <li>Стоимость по отчёту об оценке — от 200 000 $ для Анталии и Аланьи (демо-условие)</li>
              <li>Квартал открыт для первичного оформления ВНЖ иностранцами</li>
              <li>Медицинская страховка на весь срок карты</li>
              <li>Адрес проживания зарегистрирован по этому объекту</li>
            </ul>
          </div>
          <div className="box">
            <h3>Что важно знать</h3>
            <ul className="checklist no">
              <li>Часть кварталов закрыта для новых ВНЖ, и список меняется несколько раз в год. Проверяем статус каждого адреса до брони.</li>
              <li>ВНЖ не даёт права работать — для работы нужно отдельное разрешение.</li>
              <li>Не купили жильё? Можно оформить ВНЖ по договору аренды — подберём <Link href="/rent" className="link">квартиру в аренду</Link>.</li>
            </ul>
            <p className="hint" style={{ marginTop: "12px" }}>Новости об изменении правил — в разделе <Link href="/news?cat=%D0%92%D0%9D%D0%96%20%D0%B8%20%D0%B3%D1%80%D0%B0%D0%B6%D0%B4%D0%B0%D0%BD%D1%81%D1%82%D0%B2%D0%BE" className="link">«Новости»</Link>.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Процесс</span><h2>Как получить ВНЖ</h2></div><p>Сроки ориентировочные (демо). Документы готовит и проверяет юрист агентства.</p></div>
          <ol className="timeline">
            <li><b>Подбор с проверкой квартала</b><p>Показываем только объекты в открытых для ВНЖ кварталах.</p><span className="t">1–2 недели</span></li>
            <li><b>Покупка и ТАПУ</b><p>Проверка документов, оценка, регистрация права собственности.</p><span className="t">2–4 недели</span></li>
            <li><b>Страховка и регистрация</b><p>Медицинская страховка и регистрация адреса проживания.</p><span className="t">2–3 дня</span></li>
            <li><b>Заявка и собеседование</b><p>Онлайн-заявка, затем визит в миграционную службу. Карта приходит по почте.</p><span className="t">1–2 месяца</span></li>
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box">
            <h3>Документы</h3>
            <ul className="checklist">
              <li>Загранпаспорт и нотариальный перевод</li>
              <li>ТАПУ и отчёт об оценке</li>
              <li>Медицинская страховка на срок ВНЖ</li>
              <li>Фотографии и справка о регистрации адреса</li>
              <li>Для детей — свидетельства о рождении с апостилем и переводом</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "19px", marginBottom: "12px" }}>Расходы на оформление</h3>
            <table className="ptable"><caption className="vh">Расходы на оформление ВНЖ (демо)</caption><thead><tr><th scope="col">Что оплачивается</th><th scope="col" className="num">Сумма (демо)</th></tr></thead><tbody>
              <tr><td>Госпошлина за ВНЖ</td><td className="num">зависит от гражданства и срока</td></tr>
              <tr><td>Бланк карты</td><td className="num">около 30–50 €</td></tr>
              <tr><td>Медицинская страховка</td><td className="num">100–400 € в год</td></tr>
              <tr><td>Перевод паспорта, нотариус</td><td className="num">50–100 €</td></tr>
              <tr><td>Сопровождение юриста</td><td className="num">бесплатно для покупателей</td></tr>
            </tbody></table>
            <p className="hint" style={{ marginTop: "10px" }}>Полный список документов и сроков — <Link href="/blog/vnzh-pri-pokupke-nedvizhimosti-v-alanii-usloviya-i-dokumenty" className="link">в статье о ВНЖ</Link>.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }} id="objects">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Каталог {objs.length ? <span className="hint">{objs.length} в каталоге</span> : null}</span><h2>Объекты под ВНЖ</h2></div><p>От 200 000 $ (<span>≈ <Price eur={minEur} /></span>). Статус квартала проверяем на дату сделки. Районы для жизни круглый год — <Link href="/districts?f=life" className="link">в гиде по районам</Link>.</p></div>
          {objsBlock}
          <div className="res-actions"><Link href={`/sale?min=${Math.round(minEur)}`} className="btn btn-dark">Все объекты от 200 000 $</Link><a href="#lead" className="btn btn-line">Проверить мой объект</a></div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="warn"><b>Условия меняются.</b> Минимальная стоимость и список закрытых кварталов устанавливают власти Турции. На этой странице — демо-условия; перед бронью юрист проверяет требования на дату сделки.</div>
          {lawyerBox}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap faq">
          <div><span className="eyebrow">Вопросы</span><h2 style={{ marginTop: "8px" }}>Частые вопросы о ВНЖ</h2><p className="hint" style={{ marginTop: "10px" }}>Не нашли ответ? <a href="#lead" className="link">Спросите юриста →</a></p></div>
          <div id="faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
