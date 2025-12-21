export const NAV_ITEMS = [
    { label: "Каналы", href: "/channels" },
    { label: "Возможности", href: "/features" },
    { label: "Цены", href: "/pricing" },
    { label: "Кейсы", href: "/use-cases" },
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

export const PRICING_TIERS_FULL = [
    {
        name: "FREE",
        monthlyPrice: 0,
        annualPrice: 0,
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
        monthlyPrice: 29,
        annualPrice: 24,
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
        monthlyPrice: 79,
        annualPrice: 66,
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
        monthlyPrice: 199,
        annualPrice: 166,
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
    {
        name: "ENTERPRISE",
        monthlyPrice: -1,
        annualPrice: -1,
        messages: "Без ограничений",
        features: [
            "Все из BUSINESS",
            "Выделенная инфраструктура",
            "Кастомный SLA",
            "On-premise опция",
            "24/7 поддержка",
            "Персональный аккаунт-менеджер",
        ],
        cta: "Связаться с нами",
        popular: false,
    },
] as const

export const PRICING_FEATURES_MATRIX = [
    {
        category: "Каналы",
        features: [
            {
                name: "SMS (Eskiz, PlayMobile, GetSMS)",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Telegram Bot",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Email (SMTP, SendGrid, Mailgun)",
                free: false,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Push (FCM, APNs)",
                free: false,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "WhatsApp Business",
                free: false,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
        ],
    },
    {
        category: "Маршрутизация",
        features: [
            {
                name: "Базовая маршрутизация",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Smart Routing (по стоимости)",
                free: false,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Приоритетная маршрутизация",
                free: false,
                starter: false,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Кастомные правила",
                free: false,
                starter: false,
                growth: false,
                business: true,
                enterprise: true,
            },
            {
                name: "Geo-routing",
                free: false,
                starter: false,
                growth: false,
                business: true,
                enterprise: true,
            },
        ],
    },
    {
        category: "Аналитика",
        features: [
            {
                name: "Базовые метрики",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Delivery tracking",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Расширенная аналитика",
                free: false,
                starter: false,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Экспорт данных",
                free: false,
                starter: false,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Custom dashboards",
                free: false,
                starter: false,
                growth: false,
                business: true,
                enterprise: true,
            },
        ],
    },
    {
        category: "Разработка",
        features: [
            {
                name: "REST API",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "SDK (Node, Python, PHP, Go)",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Webhooks",
                free: false,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Шаблоны сообщений",
                free: false,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "API rate limit",
                free: "10/мин",
                starter: "100/мин",
                growth: "500/мин",
                business: "2000/мин",
                enterprise: "Без лимита",
            },
        ],
    },
    {
        category: "Команда и безопасность",
        features: [
            {
                name: "Участники команды",
                free: "1",
                starter: "3",
                growth: "10",
                business: "Без ограничений",
                enterprise: "Без ограничений",
            },
            {
                name: "Роли и права",
                free: false,
                starter: false,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Audit logs",
                free: false,
                starter: false,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "SSO/SAML",
                free: false,
                starter: false,
                growth: false,
                business: true,
                enterprise: true,
            },
            {
                name: "IP whitelist",
                free: false,
                starter: false,
                growth: false,
                business: true,
                enterprise: true,
            },
        ],
    },
    {
        category: "Поддержка",
        features: [
            {
                name: "Документация",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Community (GitHub)",
                free: true,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Email поддержка",
                free: false,
                starter: true,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Slack/Telegram чат",
                free: false,
                starter: false,
                growth: true,
                business: true,
                enterprise: true,
            },
            {
                name: "Выделенный менеджер",
                free: false,
                starter: false,
                growth: false,
                business: true,
                enterprise: true,
            },
            {
                name: "SLA гарантии",
                free: "—",
                starter: "99%",
                growth: "99.5%",
                business: "99.9%",
                enterprise: "99.99%",
            },
            {
                name: "Время ответа",
                free: "—",
                starter: "48ч",
                growth: "24ч",
                business: "4ч",
                enterprise: "1ч",
            },
        ],
    },
] as const

export const PRICING_FAQ = [
    {
        question: "Как рассчитывается количество уведомлений?",
        answer: "Каждое отправленное сообщение считается как одно уведомление, независимо от канала (SMS, Telegram, Email и т.д.). Неудачные попытки доставки не учитываются.",
    },
    {
        question: "Что происходит при превышении лимита?",
        answer: "При достижении лимита вы получите уведомление. Можно либо подождать следующего периода, либо перейти на более высокий тариф, либо докупить дополнительные уведомления.",
    },
    {
        question: "Могу ли я изменить тариф в любое время?",
        answer: "Да! Вы можете повысить тариф в любой момент, изменения вступят в силу немедленно. При понижении тарифа изменения применятся в следующем расчетном периоде.",
    },
    {
        question: "Есть ли скидка при годовой оплате?",
        answer: "Да, при оплате за год вы экономите ~17% по сравнению с ежемесячной оплатой.",
    },
    {
        question: "Нужна ли кредитная карта для FREE плана?",
        answer: "Нет, для FREE плана карта не требуется. Вы можете начать использовать OpenNotify прямо сейчас без каких-либо обязательств.",
    },
    {
        question: "Как работает Enterprise план?",
        answer: "Enterprise план создается индивидуально под ваши потребности. Свяжитесь с нами, и мы подберем оптимальное решение: объем уведомлений, SLA, выделенную инфраструктуру и персональную поддержку.",
    },
] as const

export const USE_CASES = [
    {
        id: "otp",
        title: "OTP и верификация",
        description:
            "Отправка одноразовых кодов для подтверждения номера телефона, двухфакторной аутентификации и верификации действий.",
        icon: "ShieldCheck",
        channels: ["SMS", "Telegram", "WhatsApp"],
        examples: [
            "Подтверждение регистрации",
            "Двухфакторная аутентификация",
            "Подтверждение платежей",
            "Восстановление пароля",
        ],
        stats: { deliveryRate: "99.8%", avgTime: "< 3 сек" },
    },
    {
        id: "ecommerce",
        title: "E-commerce уведомления",
        description:
            "Автоматические уведомления о заказах, доставке и акциях для интернет-магазинов и маркетплейсов.",
        icon: "ShoppingCart",
        channels: ["SMS", "Email", "Push", "Telegram"],
        examples: [
            "Подтверждение заказа",
            "Статус доставки",
            "Брошенная корзина",
            "Персональные предложения",
        ],
        stats: { conversionIncrease: "+23%", cartRecovery: "+15%" },
    },
    {
        id: "fintech",
        title: "Финансовые уведомления",
        description:
            "Транзакционные уведомления, алерты по безопасности и финансовая отчетность для банков и финтех.",
        icon: "Wallet",
        channels: ["SMS", "Push", "Email"],
        examples: [
            "Транзакции по карте",
            "Подозрительная активность",
            "Баланс и выписки",
            "Платежные напоминания",
        ],
        stats: { securityAlerts: "Мгновенно", compliance: "PCI DSS" },
    },
    {
        id: "logistics",
        title: "Логистика и доставка",
        description:
            "Отслеживание посылок, уведомления курьерам и клиентам для служб доставки и логистических компаний.",
        icon: "Truck",
        channels: ["SMS", "Telegram", "Push"],
        examples: [
            "Трекинг посылки",
            "Уведомление курьеру",
            "Прибытие на пункт выдачи",
            "Изменение адреса доставки",
        ],
        stats: { missedDeliveries: "-40%", customerSatisfaction: "+35%" },
    },
    {
        id: "healthcare",
        title: "Медицина и здоровье",
        description:
            "Напоминания о приеме, уведомления о результатах анализов и коммуникация врач-пациент.",
        icon: "Heart",
        channels: ["SMS", "Email", "Push"],
        examples: [
            "Напоминание о приеме",
            "Результаты анализов готовы",
            "Рецепт готов к выдаче",
            "Профилактические осмотры",
        ],
        stats: { noShowReduction: "-50%", patientEngagement: "+60%" },
    },
    {
        id: "education",
        title: "Образование",
        description:
            "Уведомления для студентов, родителей и преподавателей в школах, вузах и онлайн-курсах.",
        icon: "GraduationCap",
        channels: ["Email", "Telegram", "Push", "SMS"],
        examples: [
            "Расписание занятий",
            "Оценки и результаты",
            "Оплата обучения",
            "Новые материалы курса",
        ],
        stats: { parentEngagement: "+45%", paymentReminders: "98% success" },
    },
] as const

export const FEATURES_DETAILED = [
    {
        id: "smart-routing",
        title: "Smart Routing",
        tagline: "Автоматический выбор оптимального канала",
        description:
            "Интеллектуальная маршрутизация выбирает лучший канал доставки для каждого сообщения на основе стоимости, доступности получателя и типа контента.",
        icon: "Route",
        benefits: [
            {
                title: "Экономия до 70%",
                description:
                    "Автоматически использует бесплатные каналы (Telegram, Email) с fallback на SMS только при необходимости",
            },
            {
                title: "Максимальная доставляемость",
                description:
                    "Если один канал недоступен, система автоматически переключается на альтернативный",
            },
            {
                title: "Персонализация",
                description: "Учитывает предпочтения получателя и историю взаимодействий",
            },
        ],
        howItWorks: [
            "Получатель подключен к Telegram боту? → Отправляем в Telegram (бесплатно)",
            "Нет Telegram, но есть email? → Отправляем Email",
            "Критически важное сообщение? → SMS с гарантированной доставкой",
            "Провайдер недоступен? → Автоматический failover на резервный",
        ],
    },
    {
        id: "multi-channel",
        title: "Multi-Channel API",
        tagline: "Один API для всех каналов",
        description:
            "Единый интерфейс для отправки уведомлений через SMS, Telegram, Email, Push и WhatsApp. Подключите один раз — используйте везде.",
        icon: "Layers",
        benefits: [
            {
                title: "Одна интеграция",
                description: "Вместо 5 разных API — один OpenNotify SDK с единым форматом запросов",
            },
            {
                title: "Простое переключение",
                description:
                    "Смена провайдера или канала — это изменение одного параметра в запросе",
            },
            {
                title: "Консистентный опыт",
                description: "Единые webhooks, статусы доставки и аналитика для всех каналов",
            },
        ],
        codeExample: `// Один код — любой канал
await client.send({
    channel: "auto",  // или "sms", "telegram", "email"
    recipient: "+998901234567",
    message: "Ваш код: 123456"
})`,
    },
    {
        id: "analytics",
        title: "Аналитика и мониторинг",
        tagline: "Полная видимость всех отправок",
        description:
            "Отслеживайте доставку в реальном времени, анализируйте эффективность каналов и оптимизируйте расходы на уведомления.",
        icon: "BarChart3",
        benefits: [
            {
                title: "Real-time статусы",
                description: "Мгновенные webhooks о доставке, прочтении и ошибках",
            },
            {
                title: "Детальные отчеты",
                description:
                    "Breakdown по каналам, провайдерам, типам сообщений и временным периодам",
            },
            {
                title: "Cost tracking",
                description: "Точный учет расходов и экономии от smart routing",
            },
        ],
        metrics: [
            { label: "Delivery Rate", value: "99.5%" },
            { label: "Avg. Delivery Time", value: "< 3 сек" },
            { label: "Uptime SLA", value: "99.9%" },
        ],
    },
    {
        id: "templates",
        title: "Шаблоны сообщений",
        tagline: "Управляйте контентом централизованно",
        description:
            "Создавайте и управляйте шаблонами сообщений в одном месте. Поддержка переменных, локализации и A/B тестирования.",
        icon: "FileText",
        benefits: [
            {
                title: "Динамические переменные",
                description:
                    "Используйте {{name}}, {{code}}, {{link}} и другие переменные в шаблонах",
            },
            {
                title: "Версионирование",
                description: "История изменений и возможность откатиться к предыдущей версии",
            },
            {
                title: "Мультиязычность",
                description: "Разные версии шаблона для разных языков и регионов",
            },
        ],
        templateExample: `{
    "name": "otp_code",
    "channel": "auto",
    "content": {
        "ru": "Ваш код подтверждения: {{code}}",
        "uz": "Tasdiqlash kodingiz: {{code}}",
        "en": "Your verification code: {{code}}"
    }
}`,
    },
    {
        id: "webhooks",
        title: "Webhooks и интеграции",
        tagline: "Получайте обновления в реальном времени",
        description:
            "Настраивайте webhooks для получения событий о доставке, ошибках и действиях пользователей. Интегрируйтесь с любыми системами.",
        icon: "Webhook",
        benefits: [
            {
                title: "Мгновенные уведомления",
                description: "Получайте события delivery, read, failed в момент их возникновения",
            },
            {
                title: "Подпись запросов",
                description: "Криптографическая подпись каждого webhook для безопасности",
            },
            {
                title: "Retry механизм",
                description: "Автоматические повторные попытки при недоступности вашего endpoint",
            },
        ],
        events: [
            "notification.sent",
            "notification.delivered",
            "notification.failed",
            "notification.read",
        ],
    },
    {
        id: "security",
        title: "Безопасность",
        tagline: "Enterprise-grade защита данных",
        description:
            "Шифрование данных, ролевой доступ, audit logs и соответствие стандартам безопасности для защиты ваших данных и данных клиентов.",
        icon: "Shield",
        benefits: [
            {
                title: "Шифрование",
                description: "TLS 1.3 для передачи данных, AES-256 для хранения",
            },
            {
                title: "Роли и права",
                description: "Гранулярный контроль доступа для членов команды",
            },
            {
                title: "Audit logs",
                description: "Полная история всех действий для compliance",
            },
        ],
        certifications: ["SOC 2 Type II (в процессе)", "GDPR Compliant", "PCI DSS Ready"],
    },
] as const

export const CHANNELS_DETAILED = [
    {
        id: "sms",
        name: "SMS",
        icon: "MessageSquare",
        color: "blue",
        tagline: "Надежная доставка на любой телефон",
        description:
            "SMS остается самым надежным каналом для критически важных уведомлений. Работает на любом телефоне, не требует интернета и приложений.",
        providers: [
            {
                name: "Eskiz",
                description: "Крупнейший SMS-агрегатор Узбекистана",
                region: "Узбекистан",
            },
            {
                name: "PlayMobile",
                description: "Надежный провайдер с высокой доставляемостью",
                region: "Узбекистан",
            },
            {
                name: "GetSMS",
                description: "Быстрая доставка по конкурентным ценам",
                region: "СНГ",
            },
        ],
        useCases: ["OTP и верификация", "Транзакционные уведомления", "Критические алерты"],
        pricing: "от 50 сум/сообщение",
        deliveryRate: "99.5%",
        avgDeliveryTime: "3-10 сек",
        pros: ["Работает без интернета", "100% охват", "Высокое доверие"],
        cons: ["Стоимость выше других каналов", "Ограничения по символам"],
    },
    {
        id: "telegram",
        name: "Telegram",
        icon: "Send",
        color: "sky",
        tagline: "Бесплатные мгновенные уведомления",
        description:
            "Telegram — самый популярный мессенджер в Центральной Азии. Бесплатная доставка, rich-контент и интерактивность делают его идеальным для большинства уведомлений.",
        providers: [
            {
                name: "Telegram Bot API",
                description: "Официальный API для ботов",
                region: "Глобально",
            },
        ],
        useCases: ["OTP как альтернатива SMS", "Информационные рассылки", "Интерактивные боты"],
        pricing: "Бесплатно",
        deliveryRate: "99.9%",
        avgDeliveryTime: "< 1 сек",
        pros: ["Бесплатно", "Rich-контент (картинки, кнопки)", "Мгновенная доставка"],
        cons: ["Требует подписки на бота", "Не 100% охват"],
    },
    {
        id: "email",
        name: "Email",
        icon: "Mail",
        color: "violet",
        tagline: "Профессиональные email-рассылки",
        description:
            "Email идеален для детальных уведомлений, отчетов и маркетинговых кампаний. Поддержка HTML-шаблонов и вложений.",
        providers: [
            { name: "SMTP", description: "Любой SMTP-сервер", region: "Глобально" },
            { name: "SendGrid", description: "Лидер email-маркетинга", region: "Глобально" },
            { name: "Mailgun", description: "Email API для разработчиков", region: "Глобально" },
        ],
        useCases: ["Транзакционные письма", "Маркетинговые рассылки", "Отчеты и документы"],
        pricing: "от $0.0001/письмо",
        deliveryRate: "98%",
        avgDeliveryTime: "1-5 сек",
        pros: ["Детальный контент", "Вложения", "Низкая стоимость"],
        cons: ["Может попасть в спам", "Не мгновенная проверка"],
    },
    {
        id: "push",
        name: "Push",
        icon: "Bell",
        color: "orange",
        tagline: "Мгновенные мобильные уведомления",
        description:
            "Push-уведомления появляются прямо на экране устройства. Идеальны для real-time оповещений и вовлечения пользователей в приложении.",
        providers: [
            { name: "Firebase FCM", description: "Push для Android и iOS", region: "Глобально" },
            { name: "Apple APNs", description: "Нативный push для iOS", region: "Глобально" },
        ],
        useCases: ["In-app уведомления", "Real-time алерты", "Вовлечение пользователей"],
        pricing: "Бесплатно",
        deliveryRate: "95%",
        avgDeliveryTime: "< 1 сек",
        pros: ["Бесплатно", "Мгновенная доставка", "Rich-контент"],
        cons: ["Требует приложения", "Можно отключить"],
    },
    {
        id: "whatsapp",
        name: "WhatsApp",
        icon: "MessageCircle",
        color: "green",
        tagline: "Бизнес-коммуникация через WhatsApp",
        description:
            "WhatsApp Business API для официальных бизнес-рассылок. Высокий уровень доверия и открываемости сообщений.",
        providers: [
            {
                name: "WhatsApp Business API",
                description: "Официальный бизнес-канал",
                region: "Глобально",
            },
        ],
        useCases: ["Клиентская поддержка", "Транзакционные уведомления", "Маркетинговые кампании"],
        pricing: "от $0.005/сообщение",
        deliveryRate: "99%",
        avgDeliveryTime: "1-3 сек",
        pros: ["Высокая открываемость (98%)", "Rich-контент", "Двусторонняя коммуникация"],
        cons: ["Требует верификации бизнеса", "Строгие политики контента"],
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
