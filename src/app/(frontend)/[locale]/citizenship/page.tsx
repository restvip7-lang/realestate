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
  return pageMeta(locale, '/citizenship', { title: 'Гражданство Турции за покупку недвижимости в Алании', description: 'Условия программы гражданства за инвестиции в недвижимость: сумма от 400 000 $, запрет продажи 3 года, документы, сроки, расходы и подходящие объекты в Алании.' })
}

export default async function CitizenshipPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [company, team, rates, published] = await Promise.all([getCompany(locale), listTeam(locale), getRates(), allPublished(locale)])
  const minEur = 400000 / (rates.USD || 1)
  const objs = published.filter((o) => o.deal === 'sale' && ((o.price ?? 0) >= minEur || o.citizenship)).sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
  const lawyer = team.find((t) => t.kind === 'lawyer') || team[0]
  const lawyerImg = mediaUrl(lawyer?.photo, 'thumb')
  const FAQ: [string, React.ReactNode, string][] = [["Можно ли купить несколько квартир вместо одной?", <>Да. Можно купить несколько объектов, если их общая стоимость по отчётам об оценке — от 400 000 $ (демо-условие). Все объекты получают отметку о запрете продажи на 3 года.</>, "Да. Можно купить несколько объектов, если их общая стоимость по отчётам об оценке — от 400 000 $ (демо-условие). Все объекты получают отметку о запрете продажи на 3 года."], ["Можно ли сдавать объект в аренду?", <>Да, сдавать можно все 3 года — это частый вариант: объект приносит доход, пока идёт оформление. Посчитаем доходность, <Link href="/blog/dokhodnost-arendy-v-alanii-skolko-realno-zarabotat" className="link">как в статье об аренде</Link>.</>, "Да, сдавать можно все 3 года — это частый вариант: объект приносит доход, пока идёт оформление. Посчитаем доходность, как в статье об аренде."], ["Нужно ли жить в Турции?", <>Нет. Требований к проживанию и знанию языка нет. Приехать нужно для подачи биометрии; остальное можно сделать по доверенности.</>, "Нет. Требований к проживанию и знанию языка нет. Приехать нужно для подачи биометрии; остальное можно сделать по доверенности."], ["Получат ли паспорт дети старше 18 лет?", <>Нет, по программе паспорт получают супруг(а) и дети до 18 лет. Взрослым детям нужна отдельная покупка или другое основание.</>, "Нет, по программе паспорт получают супруг(а) и дети до 18 лет. Взрослым детям нужна отдельная покупка или другое основание."], ["Что будет, если продать объект раньше 3 лет?", <>Продать нельзя: отметка в ТАПУ не даст зарегистрировать сделку. По истечении 3 лет объект можно продать, паспорт остаётся.</>, "Продать нельзя: отметка в ТАПУ не даст зарегистрировать сделку. По истечении 3 лет объект можно продать, паспорт остаётся."], ["Подходит ли новостройка?", <>Да, если объект оценён на нужную сумму и оплата прошла через банк. Для строящихся объектов есть особые правила оформления — юрист расскажет на консультации.</>, "Да, если объект оценён на нужную сумму и оплата прошла через банк. Для строящихся объектов есть особые правила оформления — юрист расскажет на консультации."]]
  const objsBlock = objs.length ? (
    <div className="grid3 limit4">{objs.slice(0, 6).map((p) => <PropertyCard key={p.id} p={p} />)}</div>
  ) : (
    <div className="empty"><b>Сейчас в каталоге нет объектов от 400,000 $</b>Подберём у застройщиков-партнёров или предложим несколько объектов на нужную сумму.<a href="#lead" className="btn btn-line btn-sm" style={{ marginTop: 14 }}>Оставить заявку</a></div>
  )
  const lawyerBox = lawyer ? (
    <div className="author-box" style={{ maxWidth: 'none' }}>
      {lawyerImg && <Image src={lawyerImg} alt={lawyer.name} width={160} height={160} />}
      <div>
        <span className="hint">Консультирует</span><br />
        <b>{lawyer.name}</b> · <span className="hint">{lawyer.role}, {lawyer.exp} лет опыта</span>
        {lawyer.bio && <p>{lawyer.bio}</p>}
        <div className="contacts">
          <a href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Здравствуйте! Вопрос юристу о гражданстве Турции за покупку недвижимости.")}`} className="btn btn-wa btn-sm">Спросить юриста в WhatsApp</a>
          <Link href={`/team/${lawyer.slug}`} className="btn btn-line btn-sm">Профиль</Link>
        </div>
      </div>
    </div>
  ) : null
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Главная', '/'], ['Гражданство Турции', '/citizenship']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const ld = [crumbs, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, , a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link>›<span aria-current="page">Гражданство Турции</span></nav>
          <span className="eyebrow">Программа гражданства</span>
          <h1>Гражданство Турции за покупку недвижимости</h1>
          <p className="lead-t">Купите жильё от 400 000 $ и получите паспорт Турции для себя, супруга и детей. Подберём объекты в Алании, проверим документы и проведём оформление под ключ.</p>
          <div className="cta"><a href="#objects" className="btn btn-coral">Объекты под гражданство</a><a href="#lead" className="btn btn-ghost">Бесплатная консультация</a></div>
        </div>
      </section>

      <div className="wrap">
        <div className="kfacts k4" role="list" aria-label="Главное о программе">
          <div role="listitem"><span>Сумма покупки</span><b>от 400 000 $</b><small>≈ <Price eur={minEur} /></small></div>
          <div role="listitem"><span>Нельзя продавать</span><b>3 года</b><small>отметка в ТАПУ</small></div>
          <div role="listitem"><span>Оформление</span><b>6–12 мес.</b><small>от брони до паспорта</small></div>
          <div role="listitem"><span>Кто получает</span><b>Вся семья</b><small>супруг(а) и дети до 18 лет</small></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box">
            <h3>Условия программы</h3>
            <ul className="checklist">
              <li>Один или несколько объектов на общую сумму от 400 000 $ по отчёту об оценке</li>
              <li>Оплата через турецкий банк с документом о переводе валюты</li>
              <li>Отметка в ТАПУ: объект нельзя продавать 3 года</li>
              <li>Объект раньше не использовался для получения гражданства</li>
              <li>Не нужно знать язык и жить в Турции</li>
            </ul>
          </div>
          <div className="box">
            <h3>Что даёт паспорт Турции</h3>
            <ul className="checklist">
              <li>Право жить, работать и учиться в Турции без ВНЖ и разрешений</li>
              <li>Безвизовые поездки в страны, открытые для граждан Турции</li>
              <li>Паспорт получают супруг(а) и дети до 18 лет</li>
              <li>Турция разрешает двойное гражданство — проверьте законы своей страны</li>
              <li>Объект можно сдавать в аренду все 3 года</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Процесс</span><h2>Как проходит оформление</h2></div><p>Сроки ориентировочные (демо). Каждый шаг ведёт юрист агентства.</p></div>
          <ol className="timeline">
            <li><b>Консультация и подбор</b><p>Бюджет, состав семьи, цель: жить, сдавать или только паспорт.</p><span className="t">1–2 недели</span></li>
            <li><b>Проверка и бронь</b><p>Юрист проверяет ТАПУ, долги и историю объекта.</p><span className="t">3–7 дней</span></li>
            <li><b>Отчёт об оценке</b><p>Лицензированный оценщик подтверждает стоимость.</p><span className="t">1 неделя</span></li>
            <li><b>Оплата через банк</b><p>Счёт в турецком банке, перевод и документ о конвертации.</p><span className="t">1–2 недели</span></li>
            <li><b>ТАПУ с отметкой</b><p>Регистрация права собственности и запрета продажи на 3 года.</p><span className="t">1–2 недели</span></li>
            <li><b>Сертификат соответствия</b><p>Подтверждение, что покупка подходит под программу.</p><span className="t">2–4 недели</span></li>
            <li><b>ВНЖ по инвестициям</b><p>Вид на жительство для всей семьи на время рассмотрения.</p><span className="t">2–4 недели</span></li>
            <li><b>Паспорт</b><p>Подача на гражданство, проверка и получение паспортов.</p><span className="t">3–6 месяцев</span></li>
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap cols2">
          <div className="box">
            <h3>Документы</h3>
            <ul className="checklist">
              <li>Загранпаспорта всех членов семьи</li>
              <li>Свидетельства о браке и рождении детей — с апостилем и переводом</li>
              <li>Фотографии по требованиям миграционной службы</li>
              <li>Налоговый номер и счёт в турецком банке (оформляем за 1 день)</li>
              <li>ТАПУ, отчёт об оценке, банковские документы об оплате</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "19px", marginBottom: "12px" }}>Расходы на оформление</h3>
            <table className="ptable"><caption className="vh">Расходы на оформление гражданства (демо)</caption><thead><tr><th scope="col">Что оплачивается</th><th scope="col" className="num">Сумма (демо)</th></tr></thead><tbody>
              <tr><td>Налог на регистрацию ТАПУ</td><td className="num">4% от стоимости</td></tr>
              <tr><td>Отчёт об оценке</td><td className="num">400–700 €</td></tr>
              <tr><td>Переводы, нотариус, апостили</td><td className="num">300–800 €</td></tr>
              <tr><td>Пошлины и госсборы на семью</td><td className="num">500–1 000 €</td></tr>
              <tr><td>Сопровождение юриста</td><td className="num">по договору</td></tr>
            </tbody></table>
            <p className="hint" style={{ marginTop: "10px" }}>Точную смету по вашей семье и объекту даём до брони. Разбор расходов при покупке — <Link href="/blog/skolko-stoit-pokupka-sverkh-tseny-kvartiry-nalogi-tapu-dask" className="link">в статье</Link>.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }} id="objects">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Каталог {objs.length ? <span className="hint">{objs.length} в каталоге</span> : null}</span><h2>Объекты под гражданство</h2></div><p>От 400 000 $ (<span>≈ <Price eur={minEur} /></span>) или несколько объектов на эту сумму. Окончательно подходящий объект подтверждает юрист.</p></div>
          {objsBlock}
          <div className="res-actions"><Link href={`/sale?min=${Math.round(minEur)}`} className="btn btn-dark">Все объекты от 400 000 $</Link><a href="#lead" className="btn btn-line">Подобрать несколько объектов</a></div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="warn"><b>Условия меняются.</b> Сумма и правила программы устанавливаются решениями правительства Турции. На этой странице — демо-условия; перед бронью юрист проверяет актуальные требования на дату сделки. Подробный разбор — <Link href="/blog/grazhdanstvo-turtsii-za-pokupku-nedvizhimosti-kak-eto-rabotaet" className="link">в статье о гражданстве</Link>.</div>
          {lawyerBox}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap faq">
          <div><span className="eyebrow">Вопросы</span><h2 style={{ marginTop: "8px" }}>Частые вопросы о гражданстве</h2><p className="hint" style={{ marginTop: "10px" }}>Не нашли ответ? <a href="#lead" className="link">Спросите юриста →</a></p></div>
          <div id="faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
