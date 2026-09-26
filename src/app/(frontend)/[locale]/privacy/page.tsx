import '@/app/(frontend)/styles/pages.css'

import { CookieSettings } from '@/components/site/CookieSettings'
import { getCompany } from '@/lib/data'
import { setRequestLocale } from 'next-intl/server'

import { getPathname, Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/locales'
import { pageMeta, SITE_URL } from '@/lib/seo'

// Текст страницы — русский, перенесён из design/prototypes (перевод длинных текстов — отдельная задача, docs/CLAUDE-NOTES.md)
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return pageMeta(locale, '/privacy', { title: 'Политика конфиденциальности и cookies', description: 'Как Kleo Homes собирает, использует и защищает персональные данные: KVKK и GDPR, cookies, права и сроки хранения.' })
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const company = await getCompany(locale)
  const mail = `mailto:${company.email}?subject=${encodeURIComponent('Персональные данные')}`
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Главная', '/'], ['Политика конфиденциальности и cookies', '/privacy']].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${getPathname({ href: p, locale })}` })) }

  return (
    <main className="pg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <section className="dhero short">
        <div className="wrap">
          <nav className="crumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link>›<span aria-current="page">Политика конфиденциальности</span></nav>
          <span className="eyebrow">Документы</span>
          <h1>Политика конфиденциальности и cookies</h1>
          <p className="lead-t">Как Kleo Homes собирает, использует и защищает ваши данные. Политика составлена по закону Турции о защите персональных данных (KVKK, № 6698) и Общему регламенту ЕС (GDPR). Редакция от 25 сентября 2026 года.</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap post-grid">
          <article className="prose legal" id="prose">
            <h2 id="who">1. Кто обрабатывает ваши данные</h2>
            <p>Оператор персональных данных — <b>{company.legal?.name}</b> (Kleo Homes), <span>{company.address}</span>. Лицензия на деятельность с недвижимостью TTYB № <span>{company.legal?.license}</span>, регистрация в реестре операторов данных VERBİS № <span>{company.legal?.verbis}</span>.</p>
            <p>По всем вопросам о данных пишите на <a href={mail}>{company.email}</a> с темой «Персональные данные».</p>

            <h2 id="what">2. Какие данные мы собираем</h2>
            <ul>
              <li><b>Из форм на сайте:</b> имя, телефон, e-mail, удобный способ связи, бюджет, цель покупки и пожелания, ID объекта, который вас заинтересовал.</li>
              <li><b>При переписке:</b> сообщения в WhatsApp, Telegram и по почте, записи звонков — только если вы предупреждены.</li>
              <li><b>Для сделки</b> (передаёте отдельно, по договору): паспортные данные, налоговый номер, банковские реквизиты, документы для ВНЖ и гражданства.</li>
              <li><b>Автоматически:</b> IP-адрес, тип устройства и браузера, страницы, которые вы смотрели, источник перехода и рекламная кампания (UTM-метки) — через файлы cookies, см. раздел 8.</li>
            </ul>

            <h2 id="why">3. Зачем и на каком основании</h2>
            <table><thead><tr><th>Цель</th><th>Основание (KVKK ст. 5 / GDPR ст. 6)</th></tr></thead><tbody>
              <tr><td>Ответить на заявку, подобрать объекты, записать на просмотр</td><td>Ваш запрос и подготовка договора</td></tr>
              <tr><td>Провести сделку, оформить ТАПУ, ВНЖ или гражданство</td><td>Исполнение договора, требования закона</td></tr>
              <tr><td>Бухгалтерский и налоговый учёт</td><td>Требования закона</td></tr>
              <tr><td>Статистика посещений и улучшение сайта</td><td>Ваше согласие на аналитические cookies</td></tr>
              <tr><td>Показ рекламы и подборок новых объектов</td><td>Ваше отдельное согласие, его можно отозвать в любой момент</td></tr>
            </tbody></table>

            <h2 id="share">4. Кому мы передаём данные</h2>
            <ul>
              <li>Сотрудникам Kleo Homes, которые работают с вашей заявкой.</li>
              <li>Юристам, нотариусам, переводчикам, оценщикам и банкам — если это нужно для сделки.</li>
              <li>Застройщикам и собственникам — только имя и контакт, и только когда вы попросили показ или бронь.</li>
              <li>Сервисам, на которых работает сайт: хостинг, почта, аналитика (Google Analytics, Яндекс Метрика), реклама (Google, Meta) — в объёме, на который вы дали согласие.</li>
              <li>Государственным органам — только по требованию закона.</li>
            </ul>
            <p>Часть сервисов хранит данные за пределами Турции (например, в ЕС). Такая передача идёт по правилам статьи 9 KVKK и главы V GDPR.</p>

            <h2 id="keep">5. Сколько мы храним данные</h2>
            <ul>
              <li>Заявки и переписку без сделки — до 3 лет после последнего обращения, затем удаляем.</li>
              <li>Документы по сделке — столько, сколько требует налоговое и торговое законодательство Турции (обычно 10 лет).</li>
              <li>Данные cookies — не дольше срока, указанного в разделе 8.</li>
            </ul>

            <h2 id="rights">6. Ваши права</h2>
            <p>По статье 11 KVKK и GDPR вы можете:</p>
            <ul>
              <li>узнать, обрабатываем ли мы ваши данные, и получить их копию;</li>
              <li>исправить неточные данные;</li>
              <li>потребовать удалить данные или ограничить их обработку;</li>
              <li>возразить против обработки и отозвать согласие на рассылки и cookies;</li>
              <li>узнать, кому передавались данные;</li>
              <li>пожаловаться в Управление по защите персональных данных Турции (KVKK) или надзорный орган своей страны в ЕС.</li>
            </ul>

            <h2 id="how">7. Как отправить запрос</h2>
            <p>Напишите на <a href={mail}>{company.email}</a> или отправьте письмо на адрес офиса. Укажите имя и контакт, который вы оставляли, — так мы найдём ваши данные. Отвечаем в течение 30 дней, обычно быстрее.</p>

            <h2 id="cookies">8. Файлы cookies</h2>
            <p>Cookies — небольшие файлы, которые сайт сохраняет в вашем браузере. Необходимые работают всегда, остальные — только с вашего согласия.</p>
            <table><thead><tr><th>Вид</th><th>Зачем</th><th>Срок</th></tr></thead><tbody>
              <tr><td>Необходимые</td><td>Выбранная валюта и язык, избранное, защита форм от спама</td><td>до 1 года</td></tr>
              <tr><td>Аналитика</td><td>Google Analytics, Яндекс Метрика: какие страницы смотрят и откуда приходят</td><td>до 2 лет</td></tr>
              <tr><td>Реклама</td><td>Google Ads, Meta Pixel: показ объявлений тем, кто уже был на сайте</td><td>до 13 месяцев</td></tr>
            </tbody></table>
            <CookieSettings />

            <h2 id="changes">9. Изменения политики</h2>
            <p>Мы обновляем политику, когда меняются законы или наши сервисы. Дата действующей редакции указана в начале страницы. Политика опубликована на русском, английском и турецком языках; при расхождениях действует турецкая версия.</p>
            <p className="demo-note">Демо-текст для прототипа. Перед запуском юрист проверит политику на соответствие KVKK и GDPR и добавит текст информирования (aydınlatma metni) и отдельные согласия.</p>
          </article>
          <aside className="post-side">
            <nav className="toc" aria-label="Содержание"><b>Содержание</b><ol><li><a href="#who">Кто обрабатывает ваши данные</a></li><li><a href="#what">Какие данные мы собираем</a></li><li><a href="#why">Зачем и на каком основании</a></li><li><a href="#share">Кому мы передаём данные</a></li><li><a href="#keep">Сколько мы храним данные</a></li><li><a href="#rights">Ваши права</a></li><li><a href="#how">Как отправить запрос</a></li><li><a href="#cookies">Файлы cookies</a></li><li><a href="#changes">Изменения политики</a></li></ol></nav>
            <div className="cta-box"><b style={{ fontSize: "18px" }}>Запрос о данных</b><p>Узнать, какие данные мы храним, исправить или удалить их.</p><a className="btn btn-coral" href={mail}>Написать на почту</a><a href="#cookies" className="btn btn-line" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>Настройки cookies</a></div>
          </aside>
        </div>
      </section>
    </main>
  )
}
