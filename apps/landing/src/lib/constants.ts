export const NAV_ITEMS = [
    { label: "Каналы", href: "#channels" },
    { label: "Возможности", href: "#features" },
    { label: "Цены", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
] as const

export const PRICING_TIERS = [
    {
        name: "FREE",
        price: 0,
        period: "навсегда",
        messages: "500",
        features: [
            "2 канала (SMS + Telegram)",
            "Базовая аналитика",
            "Community поддержка",
            "API доступ",
        ],
        cta: "Начать бесплатно",
        popular: false,
    },
    {
        name: "STARTER",
        price: 29,
        period: "в месяц",
        messages: "5,000",
        features: [
            "Все каналы",
            "Умная маршрутизация",
            "Шаблоны сообщений",
            "Email поддержка",
            "Webhooks",
        ],
        cta: "Выбрать план",
        popular: true,
    },
    {
        name: "GROWTH",
        price: 79,
        period: "в месяц",
        messages: "25,000",
        features: [
            "Все из STARTER",
            "Приоритетная маршрутизация",
            "Расширенная аналитика",
            "Slack поддержка",
            "Управление командой",
        ],
        cta: "Выбрать план",
        popular: false,
    },
    {
        name: "BUSINESS",
        price: 199,
        period: "в месяц",
        messages: "100,000",
        features: [
            "Все из GROWTH",
            "SLA 99.9%",
            "Выделенный менеджер",
            "Кастомные интеграции",
            "Приоритетная поддержка",
        ],
        cta: "Связаться с нами",
        popular: false,
    },
] as const

export const CHANNELS = [
    {
        name: "SMS",
        icon: "MessageSquare",
        providers: ["Eskiz", "PlayMobile", "GetSMS"],
        description: "Надежная доставка SMS через локальных провайдеров Узбекистана",
        color: "text-blue-500",
    },
    {
        name: "Telegram",
        icon: "Send",
        providers: ["Telegram Bot API"],
        description: "Бесплатные уведомления через Telegram боты",
        color: "text-sky-500",
    },
    {
        name: "Email",
        icon: "Mail",
        providers: ["SMTP", "SendGrid", "Mailgun"],
        description: "Транзакционные и маркетинговые email-рассылки",
        color: "text-violet-500",
    },
    {
        name: "Push",
        icon: "Bell",
        providers: ["Firebase FCM", "Apple APNs"],
        description: "Мгновенные push-уведомления на мобильные устройства",
        color: "text-orange-500",
    },
    {
        name: "WhatsApp",
        icon: "MessageCircle",
        providers: ["WhatsApp Business API"],
        description: "Бизнес-сообщения через WhatsApp",
        color: "text-green-500",
    },
] as const

export const FAQ_ITEMS = [
    {
        question: "Как начать использовать OpenNotify?",
        answer: "Зарегистрируйтесь на платформе, получите API-ключ и подключите ваших провайдеров (Eskiz, PlayMobile и др.). Затем используйте наш SDK или REST API для отправки уведомлений. Весь процесс занимает менее 10 минут.",
    },
    {
        question: "Какие SMS-провайдеры поддерживаются?",
        answer: "Мы поддерживаем все основные SMS-провайдеры Узбекистана: Eskiz, PlayMobile, GetSMS. Вы подключаете свой собственный аккаунт у провайдера — мы предоставляем единый API для управления.",
    },
    {
        question: "Как работает smart routing?",
        answer: "Smart routing автоматически выбирает оптимальный канал доставки на основе стоимости, доступности получателя и типа сообщения. Например, OTP сначала отправляется в Telegram, а если пользователь не подключен — fallback на SMS.",
    },
    {
        question: "Сколько стоит отправка через Telegram?",
        answer: "Отправка через Telegram бесплатна — вы платите только за использование платформы OpenNotify согласно вашему тарифу. Это позволяет сэкономить до 70% по сравнению с SMS-only решениями.",
    },
    {
        question: "Есть ли SDK для моего языка программирования?",
        answer: "Да! Мы предоставляем официальные SDK для Node.js, Python, PHP и Go. Также доступен REST API для интеграции с любым языком программирования.",
    },
    {
        question: "Как перенести существующую интеграцию?",
        answer: "Миграция проста: замените вызовы API вашего текущего провайдера на OpenNotify API. Наши SDK совместимы с популярными форматами запросов. Мы также предоставляем гайд по миграции и поддержку.",
    },
    {
        question: "Какие гарантии SLA?",
        answer: "На тарифе BUSINESS мы гарантируем SLA 99.9% uptime. Все тарифы включают мониторинг в реальном времени и автоматический failover между провайдерами для максимальной надежности.",
    },
] as const

export const FEATURES = [
    {
        title: "Smart Routing",
        description:
            "Автоматический выбор канала на основе стоимости, доступности и предпочтений получателя",
        icon: "Route",
    },
    {
        title: "Multi-Channel",
        description:
            "Один API для SMS, Telegram, Email, Push и WhatsApp — без отдельных интеграций",
        icon: "Layers",
    },
    {
        title: "70% экономии",
        description:
            "Используйте бесплатные каналы (Telegram, Email) с автоматическим fallback на SMS",
        icon: "PiggyBank",
    },
] as const

export const CODE_EXAMPLES = {
    nodejs: `import { OpenNotify } from "@opennotify/node-sdk"

const client = new OpenNotify({ apiKey: "sk_live_..." })

await client.send({
    channel: "sms",
    provider: "eskiz",
    recipient: "+998901234567",
    message: "Ваш код: 123456"
})`,
    python: `from opennotify import OpenNotify

client = OpenNotify(api_key="sk_live_...")

result = client.send({
    "channel": "sms",
    "provider": "eskiz",
    "recipient": "+998901234567",
    "message": "Ваш код: 123456"
})`,
    php: `use OpenNotify\\OpenNotify;

$client = new OpenNotify("sk_live_...");

$result = $client->send([
    "channel" => "sms",
    "provider" => "eskiz",
    "recipient" => "+998901234567",
    "message" => "Ваш код: 123456"
]);`,
    go: `client, _ := opennotify.New("sk_live_...")

result, _ := client.Send(ctx, opennotify.SendOptions{
    Channel:   opennotify.ChannelSMS,
    Provider:  opennotify.ProviderEskiz,
    Recipient: "+998901234567",
    Message:   "Ваш код: 123456",
})`,
    curl: `curl -X POST https://api.opennotify.dev/api/v1/send \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "sms",
    "provider": "eskiz",
    "recipient": "+998901234567",
    "message": "Ваш код: 123456"
  }'`,
} as const
