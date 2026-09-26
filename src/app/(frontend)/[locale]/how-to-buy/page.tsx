import '@/app/(frontend)/styles/pages.css'

import { BuyCalculator } from '@/components/site/BuyCalculator'
import { setRequestLocale } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { pageMeta, SITE_URL } from '@/lib/seo'

// Текст страницы — русский, перенесён из design/prototypes (перевод длинных текстов — отдельная задача, docs/CLAUDE-NOTES.md)
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, '/how-to-buy', { title: 'Как проходит покупка недвижимости в Алании: 6 шагов', description: 'Покупка квартиры в Турции по шагам: подбор, просмотр, проверка документов, договор и оплата, ТАПУ. Сроки, документы, расходы сверх цены и покупка удалённо.' })
}

export default async function HowToBuyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const FAQ: [string, string][] = [["Сколько времени занимает покупка?", "Готовое жильё — обычно 3–6 недель от первой заявки до ТАПУ. Новостройка — по графику застройщика: бронь и договор за 1–2 недели, ТАПУ после сдачи дома (демо-сроки)."], ["Можно ли купить, не приезжая в Турцию?", "Да. Показ по видео, доверенность у нотариуса, оплата через банк. Подробнее — в разделе «Покупка удалённо» на этой странице."], ["В какой валюте платить?", "Цену фиксируем в договоре в валюте, согласованной с продавцом (чаще евро или доллары). Оплата — банковским переводом; для гражданства перевод валюты через банк обязателен."], ["Когда оплачиваются услуги агентства?", "После подписания договора купли-продажи. Консультация, подборка и просмотры бесплатны. Условия фиксируем в договоре до первого показа."], ["Что будет, если проверка найдёт проблему?", "Если юрист нашёл долги, обременения или проблемы с разрешениями, залог возвращается по договору бронирования, а мы подбираем другой объект."], ["Нужен ли счёт в турецком банке?", "Да, для оплаты и коммунальных платежей. Открываем его вместе с налоговым номером — обычно за 1 день, можно по доверенности."]]
  const STEPS: [string, string, string][] = [["step-1", "Заявка и консультация", "Рассказываете о бюджете, цели и сроках — по телефону, в WhatsApp или через форму. Эксперт объясняет, как проходит покупка и сколько она стоит сверх цены."], ["step-2", "Подборка", "Присылаем 5–10 вариантов с ценой за м², датой проверки цены, плюсами и минусами каждого объекта и сметой расходов."], ["step-3", "Просмотры", "Показываем квартиру, комплекс, двор и дорогу до моря — вживую или по видеосвязи в реальном времени."], ["step-4", "Проверка и бронь", "Юрист проверяет документы до того, как вы внесёте залог. Бронь фиксирует цену и снимает объект с продажи."], ["step-5", "Договор и оплата", "Оформляем налоговый номер и счёт в турецком банке, заказываем отчёт об оценке, подписываем договор купли-продажи с переводом."], ["step-6", "ТАПУ и ключи", "Регистрируем право собственности в кадастре: подписание в присутствии переводчика, получение ТАПУ на ваше имя, передача ключей по акту."]]
  const url = `${SITE_URL}${getPathname({ href: '/how-to-buy', locale })}`
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Главная', '/'], ['Как проходит покупка', '/how-to-buy']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }
  const ld = [
    crumbs,
    { '@context': 'https://schema.org', '@type': 'HowTo', name: 'Как купить недвижимость в Алании', totalTime: 'P6W', step: STEPS.map(([id, name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text, url: `${url}#${id}` })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ]

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link>›<span aria-current="page">Как проходит покупка</span></nav>
          <span className="eyebrow">Процесс</span>
          <h1>Как купить недвижимость в Алании: 6 шагов</h1>
          <p className="lead-t">От первой заявки до ТАПУ и ключей — обычно 3–6 недель для готового жилья. Купить можно лично или полностью удалённо: показ по видео, доверенность, оплата через банк.</p>
          <div className="cta"><a href="#lead" className="btn btn-coral">Получить подборку</a><a href="#costs" className="btn btn-ghost">Посчитать расходы</a></div>
        </div>
      </section>

      <div className="wrap">
        <div className="kfacts k4" role="list" aria-label="Коротко о покупке">
          <div role="listitem"><span>Срок сделки</span><b>3–6 недель</b><small>готовое жильё, демо</small></div>
          <div role="listitem"><span>Расходы сверх цены</span><b>6–8%</b><small>с услугами агентства</small></div>
          <div role="listitem"><span>Без приезда</span><b>Можно</b><small>по доверенности</small></div>
          <div role="listitem"><span>Консультация</span><b>Бесплатно</b><small>и подборка тоже</small></div>
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Шаг за шагом</span><h2>Что происходит на каждом этапе</h2></div><p>Сроки ориентировочные (демо). Каждый шаг ведёт один эксперт, документы проверяет юрист.</p></div>
          <div className="psteps">
            <article className="pstep rv" id="step-1">
              <div><span className="n">01</span><h3>Заявка и консультация</h3><span className="t">1 день</span></div>
              <div><p>Рассказываете о бюджете, цели и сроках — по телефону, в WhatsApp или через форму. Эксперт объясняет, как проходит покупка и сколько она стоит сверх цены.</p>
                <div className="who"><div><b>От вас</b><ul><li>Бюджет и валюту оплаты</li><li>Цель: жить, отдыхать, сдавать, ВНЖ или гражданство</li><li>Желаемые районы и сроки</li></ul></div><div><b>Делаем мы</b><ul><li>Назначаем эксперта по вашим районам</li><li>Объясняем расходы и порядок сделки</li><li>Консультация бесплатная</li></ul></div></div>
                </div>
            </article>
            <article className="pstep rv" id="step-2">
              <div><span className="n">02</span><h3>Подборка</h3><span className="t">2–5 дней</span></div>
              <div><p>Присылаем 5–10 вариантов с ценой за м², датой проверки цены, плюсами и минусами каждого объекта и сметой расходов.</p>
                <div className="who"><div><b>От вас</b><ul><li>Выбираете 3–5 объектов для просмотра</li><li>Задаёте вопросы по каждому</li></ul></div><div><b>Делаем мы</b><ul><li>Подтверждаем цену и наличие у продавца</li><li>Честно говорим о минусах: шум, вид, соседи</li><li>Сравниваем районы под ваши задачи</li></ul></div></div>
                <p className="more"><Link href="/districts" className="link">Гид по районам →</Link></p></div>
            </article>
            <article className="pstep rv" id="step-3">
              <div><span className="n">03</span><h3>Просмотры</h3><span className="t">1–7 дней</span></div>
              <div><p>Показываем квартиру, комплекс, двор и дорогу до моря — вживую или по видеосвязи в реальном времени.</p>
                <div className="who"><div><b>От вас</b><ul><li>Приезжаете на 2–3 дня или смотрите по видео</li><li>Отмечаете, что понравилось</li></ul></div><div><b>Делаем мы</b><ul><li>Трансфер из аэропорта и между объектами</li><li>Показ по видео с ответами на вопросы</li><li>Записываем видео для вашей семьи</li></ul></div></div>
                </div>
            </article>
            <article className="pstep rv" id="step-4">
              <div><span className="n">04</span><h3>Проверка и бронь</h3><span className="t">3–7 дней</span></div>
              <div><p>Юрист проверяет документы до того, как вы внесёте залог. Бронь фиксирует цену и снимает объект с продажи.</p>
                <div className="who"><div><b>От вас</b><ul><li>Подписываете договор бронирования</li><li>Вносите залог (обычно 2 000–5 000 €, демо)</li></ul></div><div><b>Делаем мы</b><ul><li>Проверяем ТАПУ, долги и обременения</li><li>Проверяем разрешение на заселение (iskan)</li><li>Проверяем статус квартала для ВНЖ</li><li>Залог возвращается, если проверка нашла проблему</li></ul></div></div>
                <p className="more"><Link href="/team/murat-kaya" className="link">Юрист агентства →</Link></p></div>
            </article>
            <article className="pstep rv" id="step-5">
              <div><span className="n">05</span><h3>Договор и оплата</h3><span className="t">1–2 недели</span></div>
              <div><p>Оформляем налоговый номер и счёт в турецком банке, заказываем отчёт об оценке, подписываем договор купли-продажи с переводом.</p>
                <div className="who"><div><b>От вас</b><ul><li>Паспорт и его перевод</li><li>Оплата через банк — перевод из вашей страны или наличные на счёт</li></ul></div><div><b>Делаем мы</b><ul><li>Налоговый номер за 1 день</li><li>Открытие счёта в банке</li><li>Договор на двух языках</li><li>Смета без сюрпризов</li></ul></div></div>
                <p className="more"><Link href="/blog/skolko-stoit-pokupka-sverkh-tseny-kvartiry-nalogi-tapu-dask" className="link">Статья о расходах при покупке →</Link></p></div>
            </article>
            <article className="pstep rv" id="step-6">
              <div><span className="n">06</span><h3>ТАПУ и ключи</h3><span className="t">1–2 недели</span></div>
              <div><p>Регистрируем право собственности в кадастре: подписание в присутствии переводчика, получение ТАПУ на ваше имя, передача ключей по акту.</p>
                <div className="who"><div><b>От вас</b><ul><li>Подписываете документы в кадастре лично или по доверенности</li></ul></div><div><b>Делаем мы</b><ul><li>Запись в кадастр и переводчик</li><li>Страховка DASK</li><li>Переоформляем воду, свет и интернет</li><li>Передаём ключи и акт приёма</li></ul></div></div>
                <p className="more"><Link href="/residence-permit" className="link">ВНЖ после покупки →</Link></p></div>
            </article>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }} id="costs">
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">Калькулятор</span><h2>Сколько стоит покупка сверх цены</h2></div><p>Ориентировочный расчёт по демо-ставкам. Точную смету по объекту даём до брони.</p></div>
          <BuyCalculator articleHref={"/blog/skolko-stoit-pokupka-sverkh-tseny-kvartiry-nalogi-tapu-dask"} />
        </div>
      </section>

      <section className="sec" id="remote">
        <div className="wrap cols2">
          <div>
            <span className="eyebrow">Покупка удалённо</span>
            <h2 style={{ margin: "8px 0 14px" }}>Можно купить, не прилетая в Турцию</h2>
            <p style={{ color: "#2B323C" }}>Около половины наших клиентов покупают удалённо. Всё, что нужно сделать лично, — оформить доверенность у нотариуса. Остальное делаем мы, а вы видите каждый шаг в чате и на видео.</p>
            <div className="contacts" style={{ marginTop: "18px" }}><a href="#lead" className="btn btn-dark">Обсудить покупку удалённо</a><Link href="/team/anna-sokolova" className="btn btn-line">Эксперт по удалённым сделкам</Link></div>
          </div>
          <div className="box">
            <h3>Как это устроено</h3>
            <ul className="checklist">
              <li>Показ по видеосвязи: квартира, вид из окон, комплекс, дорога до моря</li>
              <li>Доверенность у нотариуса в Турции или с апостилем и переводом в вашей стране</li>
              <li>Налоговый номер и счёт в банке — по доверенности</li>
              <li>Оплата банковским переводом, без наличных</li>
              <li>ТАПУ и ключи получает представитель, документы отправляем вам</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--mist)" }}>
        <div className="wrap">
          <div className="sec-head"><div><span className="eyebrow">После покупки</span><h2>Не пропадаем после сделки</h2></div></div>
          <div className="values">
            <div className="rv"><b>ВНЖ</b><p>Документы, страховка и запись в миграционную службу. <Link href="/residence-permit" className="link">Подробнее</Link></p></div>
            <div className="rv"><b>Коммунальные</b><p>Вода, свет, интернет, оплата aidat комплекса.</p></div>
            <div className="rv"><b>Мебель и ремонт</b><p>Пакеты мебели и проверенные мастера.</p></div>
            <div className="rv"><b>Сдача в аренду</b><p>Находим арендаторов и управляем квартирой. <Link href="/blog/dokhodnost-arendy-v-alanii-skolko-realno-zarabotat" className="link">Доходность</Link></p></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap faq">
          <div><span className="eyebrow">Вопросы</span><h2 style={{ marginTop: "8px" }}>Частые вопросы о покупке</h2><p className="hint" style={{ marginTop: "10px" }}>Не нашли ответ? <a href="#lead" className="link">Спросите эксперта →</a></p></div>
          <div id="faq">{FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
    </main>
  )
}
