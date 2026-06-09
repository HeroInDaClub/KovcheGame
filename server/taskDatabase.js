// ============================================================
// Aegis-X: Cyber-Siege — Task Database (200 tasks, RU)
//
// Schema (см. types.d.ts):
//   • id, level (1-5), sector (1-12)
//   • type: 'multiple_choice' | 'code_repair'
//   • lore_description_ru, question_ru
//   • multiple_choice: options[4], correct_answer (текст опции)
//   • code_repair: language, code_snippet, correct_answer
//                  + опц. options (select-mode), acceptedAnswers, keywords
//
// Распределение по 200 задачам:
//   L1 (40):  31 MC + 9 CR (3 py + 3 ku + 3 pa)
//   L2 (40):  25 MC + 15 CR (5/5/5)
//   L3 (40):  19 MC + 21 CR (7/7/7)
//   L4 (40):  16 MC + 24 CR (8/8/8)
//   L5 (40):  13 MC + 27 CR (9/9/9)
//   Итого: 104 MC + 96 CR (32 py + 32 ku + 32 pa)
//
// Соответствие школьному курсу информатики РФ (8-11 кл.):
//   системы счисления, логика, алгоритмизация, программирование на
//   Python / КуМир / PascalABC.NET, сети, безопасность, БД.
// ============================================================

const TASKS = [

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 1 — Инициализация системы
  //  MC: 31 задача (id 1-31) · CR: 9 задач (id 32-40)
  // ════════════════════════════════════════════════

  // ── L1 Multiple Choice ──
  { id: '1', level: 1, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Аварийный шлюз заблокирован примитивным двоичным кодом.',
    question_ru: 'Переведи двоичное число 1010 в десятичное.',
    options: ['8', '10', '12', '15'], correct_answer: '10',
    hint_ru: 'Считай степени двойки справа налево: 2³+2¹' },

  { id: '2', level: 1, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Система идентификации требует базовые знания.',
    question_ru: 'Сколько бит в одном байте?',
    options: ['4', '8', '16', '32'], correct_answer: '8' },

  { id: '3', level: 1, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Панель управления ждёт авторизации.',
    question_ru: 'Переведи шестнадцатеричное FF в десятичное.',
    options: ['127', '200', '255', '256'], correct_answer: '255',
    hint_ru: 'F=15, итого 15×16 + 15' },

  { id: '4', level: 1, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'Сенсоры корабля передают данные в ASCII.',
    question_ru: 'Какой ASCII-код у символа "A"?',
    options: ['60', '65', '90', '97'], correct_answer: '65' },

  { id: '5', level: 1, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'Блок памяти содержит зашифрованный адрес.',
    question_ru: 'Сколько байт в одном килобайте (по стандарту IEC)?',
    options: ['100', '1000', '1024', '2048'], correct_answer: '1024' },

  { id: '6', level: 1, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'Терминал выводит ошибку формата данных.',
    question_ru: 'Сколько Мегабайт в 1 Гигабайте?',
    options: ['512', '1000', '1024', '2048'], correct_answer: '1024' },

  { id: '7', level: 1, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'Протокол связи блокирует несанкционированный трафик.',
    question_ru: 'Что такое IP-адрес?',
    options: ['Адрес ячейки памяти', 'Сетевой адрес устройства', 'Имя файла', 'Тип процессора'],
    correct_answer: 'Сетевой адрес устройства' },

  { id: '8', level: 1, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'Маршрутизатор ковчега повреждён вирусом.',
    question_ru: 'Сколько октетов в IPv4-адресе?',
    options: ['2', '4', '6', '8'], correct_answer: '4' },

  { id: '9', level: 1, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'Камеры наблюдения требуют сброс пароля.',
    question_ru: 'Максимальное число в одном октете IPv4?',
    options: ['127', '255', '256', '512'], correct_answer: '255' },

  { id: '10', level: 1, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'База паролей экипажа скомпрометирована.',
    question_ru: 'Что означает аббревиатура WWW?',
    options: ['Web Wireless World', 'World Wide Web', 'Wired World Web', 'Wireless World Wide'],
    correct_answer: 'World Wide Web' },

  { id: '11', level: 1, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'Журнал Aegis-X содержит закодированные команды.',
    question_ru: 'Переведи 1100 из двоичной системы в десятичную.',
    options: ['10', '11', '12', '14'], correct_answer: '12' },

  { id: '12', level: 1, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'Замок медотсека требует выбора верного определения.',
    question_ru: 'Что такое HTTP?',
    options: ['Язык программирования', 'Тип файла', 'Протокол передачи данных', 'Устройство памяти'],
    correct_answer: 'Протокол передачи данных' },

  { id: '13', level: 1, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Рубка управления заблокирована.',
    question_ru: 'Шестнадцатеричное представление числа 16?',
    options: ['F', '10', '16', '20'], correct_answer: '10',
    hint_ru: 'В HEX: 0,1,...9,A,B,C,D,E,F,10' },

  { id: '14', level: 1, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'ИИ запрашивает верификацию знаний.',
    question_ru: 'Что из этого — браузер?',
    options: ['Excel', 'Firefox', 'PowerPoint', 'Outlook'], correct_answer: 'Firefox' },

  { id: '15', level: 1, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Логический модуль ИИ повреждён.',
    question_ru: 'Чему равно: НЕ (1 И 0)?',
    options: ['0', '1', 'Неопределено', 'Ошибка'], correct_answer: '1',
    hint_ru: '1 И 0 = 0, НЕ 0 = 1' },

  { id: '16', level: 1, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'Двигательный отсек запрашивает идентификацию.',
    question_ru: 'Что делает служба DNS?',
    options: ['Шифрует трафик', 'Переводит имена в IP-адреса', 'Хранит пароли', 'Сжимает файлы'],
    correct_answer: 'Переводит имена в IP-адреса' },

  { id: '17', level: 1, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'Навигационный компьютер сбросил настройки.',
    question_ru: 'Что делает команда ping?',
    options: ['Удаляет файлы', 'Шифрует трафик', 'Проверяет доступность хоста', 'Запускает сервер'],
    correct_answer: 'Проверяет доступность хоста' },

  { id: '18', level: 1, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'Сигнальный маяк принимает шифрованный сигнал.',
    question_ru: 'Переведи HEX 1F в десятичное.',
    options: ['15', '21', '31', '47'], correct_answer: '31',
    hint_ru: '1×16 + 15' },

  { id: '19', level: 1, sector: 7, type: 'multiple_choice',
    lore_description_ru: 'Ангарные ворота требуют верный код.',
    question_ru: 'Какой протокол используется для отправки email?',
    options: ['SMTP', 'HTTP', 'FTP', 'DNS'], correct_answer: 'SMTP' },

  { id: '20', level: 1, sector: 7, type: 'multiple_choice',
    lore_description_ru: 'Транспортный дрон не отвечает.',
    question_ru: 'Что такое URL?',
    options: ['Тип кабеля', 'Адрес ресурса в интернете', 'Имя пользователя', 'Шрифт'],
    correct_answer: 'Адрес ресурса в интернете' },

  { id: '21', level: 1, sector: 7, type: 'multiple_choice',
    lore_description_ru: 'Дверь ангара требует двоичный код.',
    question_ru: 'Переведи 10000000 (2) в десятичное.',
    options: ['64', '100', '128', '256'], correct_answer: '128' },

  { id: '22', level: 1, sector: 8, type: 'multiple_choice',
    lore_description_ru: 'Складской инвентарь требует сетевого порта.',
    question_ru: 'Какой порт по умолчанию у HTTP?',
    options: ['21', '22', '80', '443'], correct_answer: '80' },

  { id: '23', level: 1, sector: 8, type: 'multiple_choice',
    lore_description_ru: 'Система учёта ресурсов повреждена.',
    question_ru: 'Какой порт по умолчанию у HTTPS?',
    options: ['80', '143', '443', '8080'], correct_answer: '443' },

  { id: '24', level: 1, sector: 8, type: 'multiple_choice',
    lore_description_ru: 'Контейнеры с магнитными замками.',
    question_ru: 'Что такое LAN?',
    options: ['Глобальная сеть', 'Локальная сеть', 'Беспроводной протокол', 'Сетевой адаптер'],
    correct_answer: 'Локальная сеть' },

  { id: '25', level: 1, sector: 9, type: 'multiple_choice',
    lore_description_ru: 'Командный мост требует HEX-расчёта.',
    question_ru: 'Переведи HEX A5 в десятичное.',
    options: ['125', '155', '165', '175'], correct_answer: '165' },

  { id: '26', level: 1, sector: 9, type: 'multiple_choice',
    lore_description_ru: 'Тактический компьютер ждёт ответа.',
    question_ru: 'Что делает маршрутизатор (router)?',
    options: ['Хранит файлы', 'Переключает свет', 'Передаёт пакеты между сетями', 'Шифрует диск'],
    correct_answer: 'Передаёт пакеты между сетями' },

  { id: '27', level: 1, sector: 9, type: 'multiple_choice',
    lore_description_ru: 'Сенсорный массив отключился.',
    question_ru: 'Сколько бит в IPv4-адресе?',
    options: ['16', '32', '64', '128'], correct_answer: '32' },

  { id: '28', level: 1, sector: 10, type: 'multiple_choice',
    lore_description_ru: 'Серверная требует доступа.',
    question_ru: 'Что такое операционная система?',
    options: ['Программа управляющая компьютером', 'Тип процессора', 'Сетевой протокол', 'Часть монитора'],
    correct_answer: 'Программа управляющая компьютером' },

  { id: '29', level: 1, sector: 10, type: 'multiple_choice',
    lore_description_ru: 'Главный сервер защищён простой системой счисления.',
    question_ru: 'Переведи 101010 (2) в десятичное.',
    options: ['38', '40', '42', '44'], correct_answer: '42' },

  { id: '30', level: 1, sector: 10, type: 'multiple_choice',
    lore_description_ru: 'Резервный сервер шифрует соединения.',
    question_ru: 'Что делает firewall?',
    options: ['Антивирус', 'Блокирует нежелательный трафик', 'Удаляет файлы', 'Создаёт резервные копии'],
    correct_answer: 'Блокирует нежелательный трафик' },

  { id: '31', level: 1, sector: 11, type: 'multiple_choice',
    lore_description_ru: 'Турельная панель проверяет логику.',
    question_ru: 'Чему равно 1 ИЛИ 0 ИЛИ 0?',
    options: ['0', '1', 'неопределено', 'ошибка'], correct_answer: '1' },

  // ── L1 Code Repair — Python ──
  { id: '32', level: 1, sector: 12, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт спасательной капсулы должен вывести позывной.',
    question_ru: 'Что должно стоять вместо ▓▓▓, чтобы вывести строку AEGIS?',
    code_snippet: 'print(▓▓▓)',
    correct_answer: '"AEGIS"',
    acceptedAnswers: ["'AEGIS'", '"aegis"', "'aegis'"],
    hint_ru: 'Строки в Python заключаются в кавычки' },

  { id: '33', level: 1, sector: 1, type: 'code_repair', language: 'python',
    lore_description_ru: 'Терминал ждёт ввод имени оператора.',
    question_ru: 'Какая функция читает строку с клавиатуры в Python?',
    code_snippet: 'name = ▓▓▓("Введите имя: ")\nprint("Привет,", name)',
    correct_answer: 'input',
    hint_ru: 'Встроенная функция чтения строки' },

  { id: '34', level: 1, sector: 3, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт переменной хранит десятичный год запуска.',
    question_ru: 'Какой оператор присвоит переменной year значение 2147?',
    code_snippet: 'year ▓▓▓ 2147\nprint(year)',
    correct_answer: '=',
    hint_ru: 'Оператор присваивания в Python' },

  // ── L1 Code Repair — КуМир ──
  { id: '35', level: 1, sector: 4, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм навигации не объявлен правильно.',
    question_ru: 'Какое ключевое слово начинает алгоритм в КуМир?',
    code_snippet: '▓▓▓ старт_навигации\nнач\n  вывод "ok"\nкон',
    correct_answer: 'алг',
    acceptedAnswers: ['алгоритм'],
    hint_ru: 'Заглавная конструкция любого алгоритма КуМир' },

  { id: '36', level: 1, sector: 5, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Модуль вывода эвакуационного кода сломан.',
    question_ru: 'Какая команда выводит значения в КуМир?',
    code_snippet: 'алг привет\nнач\n  ▓▓▓ "AEGIS-X"\nкон',
    correct_answer: 'вывод',
    hint_ru: 'Команда вывода в стандартном КуМир' },

  { id: '37', level: 1, sector: 6, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Переменная-счётчик объявлена неверного типа.',
    question_ru: 'Какой тип используется для целых чисел в КуМир?',
    code_snippet: 'алг счётчик\nнач\n  ▓▓▓ n\n  n := 42\n  вывод n\nкон',
    correct_answer: 'цел',
    acceptedAnswers: ['целый'],
    hint_ru: 'Краткое обозначение целочисленного типа' },

  // ── L1 Code Repair — Pascal ──
  { id: '38', level: 1, sector: 9, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Турельная программа не выводит сигнал тревоги.',
    question_ru: 'Какая команда выводит строку с переводом строки в Pascal?',
    code_snippet: 'begin\n  ▓▓▓(\'ALERT\');\nend.',
    correct_answer: 'writeln',
    acceptedAnswers: ['write'],
    hint_ru: 'Стандартная команда вывода (write/writeln)' },

  { id: '39', level: 1, sector: 11, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Сектор хранит код доступа в целочисленной переменной.',
    question_ru: 'Какой тип данных описывает целое число в Pascal?',
    code_snippet: 'var code: ▓▓▓;\nbegin\n  code := 2025;\n  writeln(code)\nend.',
    correct_answer: 'integer',
    hint_ru: 'Стандартный целочисленный тип' },

  { id: '40', level: 1, sector: 2, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Программа сектора не завершается корректно.',
    question_ru: 'Какой символ ставится после слова end в конце программы Pascal?',
    code_snippet: 'begin\n  writeln(\'ok\')\nend▓\n',
    correct_answer: '.',
    hint_ru: 'Точка обозначает конец программы' },

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 2 — Взлом периферии
  //  MC: 25 (41-65) · CR: 15 (66-70 py, 71-75 ku, 76-80 pa)
  // ════════════════════════════════════════════════

  // ── L2 Multiple Choice ──
  { id: '41', level: 2, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Шифр Цезаря защищает файл конфигурации.',
    question_ru: 'Шифр Цезаря со сдвигом 3: "NHFV" расшифровывается как?',
    options: ['JCBN', 'KHES', 'KING', 'MERG'], correct_answer: 'KHES',
    hint_ru: 'Сдвинь каждую букву на 3 позиции назад' },

  { id: '42', level: 2, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Архивные логи закодированы ROT13.',
    question_ru: 'ROT13 от "NRTF-K"?',
    options: ['ALERT-K', 'AEGIS-X', 'CYBER-X', 'CRYPT-X'], correct_answer: 'AEGIS-X' },

  { id: '43', level: 2, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'Сетевая подсеть требует маску.',
    question_ru: 'Маска подсети для сети /24?',
    options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'],
    correct_answer: '255.255.255.0' },

  { id: '44', level: 2, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'Роутер требует диапазон.',
    question_ru: 'Сколько хостов помещается в подсеть /24?',
    options: ['128', '254', '255', '256'], correct_answer: '254',
    hint_ru: '256 минус адрес сети и широковещательный' },

  { id: '45', level: 2, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'Веб-сервер корабля принимает запросы.',
    question_ru: 'Какой HTML-тег создаёт гиперссылку?',
    options: ['<a>', '<href>', '<link>', '<url>'], correct_answer: '<a>' },

  { id: '46', level: 2, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'Командная строка ждёт навигации.',
    question_ru: 'Какая Linux-команда показывает текущую директорию?',
    options: ['ls', 'cd', 'pwd', 'mv'], correct_answer: 'pwd' },

  { id: '47', level: 2, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'Терминал требует список файлов.',
    question_ru: 'Какая Linux-команда выводит список файлов?',
    options: ['cat', 'ls', 'pwd', 'cp'], correct_answer: 'ls' },

  { id: '48', level: 2, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Python-скрипт защиты вычисляет силу.',
    question_ru: 'Что выведет: print(2 ** 8) в Python?',
    options: ['10', '16', '256', '512'], correct_answer: '256' },

  { id: '49', level: 2, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Цикл вируса прокручивает счётчик.',
    question_ru: 'Сколько раз выполнится for i in range(7): print(i)?',
    options: ['6', '7', '8', 'бесконечно'], correct_answer: '7' },

  { id: '50', level: 2, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'Хеш защищает пароль администратора.',
    question_ru: 'Что такое хеш-функция?',
    options: ['Шифр с ключом', 'Преобразование данных в строку фиксированной длины', 'Архиватор', 'Алгоритм сортировки'],
    correct_answer: 'Преобразование данных в строку фиксированной длины' },

  { id: '51', level: 2, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'MD5 хеш найден в журнале.',
    question_ru: 'Сколько символов в MD5-хеше (HEX)?',
    options: ['16', '24', '32', '64'], correct_answer: '32',
    hint_ru: '128 бит / 4 бита на HEX-символ' },

  { id: '52', level: 2, sector: 7, type: 'multiple_choice',
    lore_description_ru: 'Координаты ангара закодированы Base64.',
    question_ru: 'Что такое Base64?',
    options: ['Алгоритм шифрования', 'Кодирование двоичных данных текстом', 'Тип сжатия', 'Файловая система'],
    correct_answer: 'Кодирование двоичных данных текстом' },

  { id: '53', level: 2, sector: 8, type: 'multiple_choice',
    lore_description_ru: 'Складская БД на SQL.',
    question_ru: 'Какой SQL-оператор получает данные из таблицы?',
    options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correct_answer: 'SELECT' },

  { id: '54', level: 2, sector: 9, type: 'multiple_choice',
    lore_description_ru: 'Сканер портов разведки.',
    question_ru: 'Какой порт по умолчанию использует SSH?',
    options: ['21', '22', '23', '25'], correct_answer: '22' },

  { id: '55', level: 2, sector: 9, type: 'multiple_choice',
    lore_description_ru: 'Сервис БД слушает порт.',
    question_ru: 'Стандартный порт MySQL?',
    options: ['1433', '3306', '5432', '27017'], correct_answer: '3306' },

  { id: '56', level: 2, sector: 10, type: 'multiple_choice',
    lore_description_ru: 'Серверный процесс перегружен.',
    question_ru: 'Какая команда Linux показывает запущенные процессы?',
    options: ['top', 'cat', 'grep', 'find'], correct_answer: 'top' },

  { id: '57', level: 2, sector: 11, type: 'multiple_choice',
    lore_description_ru: 'Защитная система анализирует угрозу.',
    question_ru: 'Что такое фишинг?',
    options: ['Сжатие файлов', 'Сетевой сканер', 'Мошеннические письма для кражи данных', 'Тип шифрования'],
    correct_answer: 'Мошеннические письма для кражи данных' },

  { id: '58', level: 2, sector: 11, type: 'multiple_choice',
    lore_description_ru: 'Сигнатура трояна в журнале.',
    question_ru: 'Что такое троянская программа?',
    options: ['Сетевой протокол', 'Вредонос маскирующийся под полезную программу', 'Антивирус', 'Файловый менеджер'],
    correct_answer: 'Вредонос маскирующийся под полезную программу' },

  { id: '59', level: 2, sector: 12, type: 'multiple_choice',
    lore_description_ru: 'ASCII-сигнал капсулы.',
    question_ru: 'Расшифруй ASCII: 65 69 71 73 83',
    options: ['ACEIS', 'AEGIS', 'AENIS', 'BFHJT'], correct_answer: 'AEGIS' },

  { id: '60', level: 2, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Сертификат шлюза проверяется.',
    question_ru: 'Что обеспечивает SSL/TLS?',
    options: ['Сжатие данных', 'Шифрование интернет-соединений', 'Дефрагментацию', 'Маршрутизацию'],
    correct_answer: 'Шифрование интернет-соединений' },

  { id: '61', level: 2, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'Wi-Fi корабля защищён.',
    question_ru: 'WPA2 — это:',
    options: ['Антивирус', 'Протокол защиты беспроводных сетей', 'Тип кабеля', 'Файловая система'],
    correct_answer: 'Протокол защиты беспроводных сетей' },

  { id: '62', level: 2, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'Анализ модели OSI.',
    question_ru: 'На каком уровне OSI работает IP?',
    options: ['1 (физический)', '2 (канальный)', '3 (сетевой)', '4 (транспортный)'],
    correct_answer: '3 (сетевой)' },

  { id: '63', level: 2, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'Логическая схема двигателя.',
    question_ru: 'Чему равно (1 И 1) ИЛИ (0 И 1)?',
    options: ['0', '1', '2', 'не определено'], correct_answer: '1' },

  { id: '64', level: 2, sector: 8, type: 'multiple_choice',
    lore_description_ru: 'Складские данные в JSON.',
    question_ru: 'Что такое JSON?',
    options: ['Язык программирования', 'Формат обмена данными', 'СУБД', 'Протокол сети'],
    correct_answer: 'Формат обмена данными' },

  { id: '65', level: 2, sector: 10, type: 'multiple_choice',
    lore_description_ru: 'Сервер дублирует данные.',
    question_ru: 'Что делает RAID 1?',
    options: ['Распределяет данные между дисками', 'Зеркалирует диски', 'Сжимает данные', 'Шифрует диски'],
    correct_answer: 'Зеркалирует диски' },

  // ── L2 Code Repair — Python (5) ──
  { id: '66', level: 2, sector: 1, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт проверки уровня заряда оперирует условием.',
    question_ru: 'Какое ключевое слово начинает условный оператор в Python?',
    code_snippet: '▓▓▓ energy > 50:\n    print("OK")\nelse:\n    print("LOW")',
    correct_answer: 'if',
    hint_ru: 'Английское ключевое слово условия' },

  { id: '67', level: 2, sector: 5, type: 'code_repair', language: 'python',
    lore_description_ru: 'Цикл подбора пароля перебирает числа.',
    question_ru: 'Что должно стоять вместо ▓▓▓ для перебора чисел 0-9?',
    code_snippet: 'for i in ▓▓▓(10):\n    print(i)',
    correct_answer: 'range',
    hint_ru: 'Встроенная функция диапазона целых чисел' },

  { id: '68', level: 2, sector: 5, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт считает сумму чисел в списке.',
    question_ru: 'Какой оператор корректно добавит x к total?',
    code_snippet: 'total = 0\nfor x in [1, 2, 3]:\n    total ▓▓▓ x\nprint(total)',
    options: ['= x', '+= x', '== x', '+ x'],
    correct_answer: '+= x',
    hint_ru: 'Составной оператор накопления' },

  { id: '69', level: 2, sector: 7, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт ангарных дронов сравнивает значения.',
    question_ru: 'Какой оператор проверяет равенство значений в Python?',
    code_snippet: 'a = 5\nb = 5\nif a ▓▓▓ b:\n    print("Равны")',
    correct_answer: '==',
    hint_ru: 'НЕ присваивание (=), а сравнение' },

  { id: '70', level: 2, sector: 8, type: 'code_repair', language: 'python',
    lore_description_ru: 'Складская функция возвращает результат.',
    question_ru: 'Какое ключевое слово возвращает значение из функции?',
    code_snippet: 'def double(x):\n    ▓▓▓ x * 2\n\nprint(double(21))',
    correct_answer: 'return',
    hint_ru: 'Ключевое слово возврата результата' },

  // ── L2 Code Repair — КуМир (5) ──
  { id: '71', level: 2, sector: 2, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм маяка переключает режим работы.',
    question_ru: 'Какое слово открывает блок условия в КуМир?',
    code_snippet: 'алг сигнал\nнач\n  цел x\n  x := 10\n  ▓▓▓ x > 5\n    то вывод "max"\n  все\nкон',
    correct_answer: 'если',
    hint_ru: 'Русскоязычное ключевое слово условия' },

  { id: '72', level: 2, sector: 4, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Цикл сканера портов перебирает значения.',
    question_ru: 'Какое ключевое слово открывает тело цикла в КуМир?',
    code_snippet: 'алг скан\nнач\n  цел i\n  ▓▓▓ для i от 1 до 5\n    вывод i\n  кц\nкон',
    correct_answer: 'нц',
    acceptedAnswers: ['начцикла'],
    hint_ru: 'Краткое "начало цикла"' },

  { id: '73', level: 2, sector: 5, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Сумматор не накапливает значение.',
    question_ru: 'Какой оператор присваивает значение переменной в КуМир?',
    code_snippet: 'алг сумма\nнач\n  цел s\n  s ▓▓▓ 0\n  вывод s\nкон',
    correct_answer: ':=',
    hint_ru: 'Оператор присваивания в КуМир/Pascal' },

  { id: '74', level: 2, sector: 9, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Защита базы запрашивает ввод оператора.',
    question_ru: 'Какая команда читает значение с клавиатуры в КуМир?',
    code_snippet: 'алг приветствие\nнач\n  лит имя\n  ▓▓▓ имя\n  вывод "Привет, ", имя\nкон',
    correct_answer: 'ввод',
    hint_ru: 'Команда ввода' },

  { id: '75', level: 2, sector: 10, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Цикл-сканер не закрыт.',
    question_ru: 'Какое ключевое слово завершает тело цикла нц в КуМир?',
    code_snippet: 'нц для i от 1 до 3\n  вывод i\n▓▓▓',
    correct_answer: 'кц',
    acceptedAnswers: ['конецц', 'конец цикла', 'конеццикла'],
    hint_ru: 'Краткое "конец цикла"' },

  // ── L2 Code Repair — Pascal (5) ──
  { id: '76', level: 2, sector: 3, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Программа защиты не определяет начало блока.',
    question_ru: 'Какое ключевое слово открывает блок операторов в Pascal?',
    code_snippet: 'var n: integer;\n▓▓▓\n  n := 5;\n  writeln(n)\nend.',
    correct_answer: 'begin' },

  { id: '77', level: 2, sector: 4, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Условие распознавания угрозы повреждено.',
    question_ru: 'Какое ключевое слово завершает блок THEN в условии Pascal? (на самом деле "не нужно", но если есть IF — что обычно идёт перед телом?)',
    code_snippet: 'if x > 0 ▓▓▓\n  writeln(\'positive\');',
    correct_answer: 'then' },

  { id: '78', level: 2, sector: 6, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Цикл реактора перебирает уровни мощности.',
    question_ru: 'Какое ключевое слово открывает цикл со счётчиком в Pascal?',
    code_snippet: '▓▓▓ i := 1 to 10 do\n  writeln(i);',
    correct_answer: 'for' },

  { id: '79', level: 2, sector: 7, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Скрипт ангара выводит таблицу значений.',
    question_ru: 'Какой оператор присваивания используется в Pascal?',
    code_snippet: 'var n: integer;\nbegin\n  n ▓▓▓ 100;\n  writeln(n)\nend.',
    correct_answer: ':=' },

  { id: '80', level: 2, sector: 8, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Складская программа сравнивает значения.',
    question_ru: 'Какой оператор проверяет равенство в Pascal?',
    code_snippet: 'if x ▓▓▓ y then\n  writeln(\'equal\');',
    correct_answer: '=',
    hint_ru: 'В Pascal "=" — это сравнение; ":=" — это присваивание' },

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 3 — Проникновение в ядро
  //  MC: 19 (81-99) · CR: 21 (100-106 py, 107-113 ku, 114-120 pa)
  // ════════════════════════════════════════════════

  // ── L3 Multiple Choice ──
  { id: '81', level: 3, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Aegis-X использует RSA.',
    question_ru: 'В чём суть асимметричного шифрования?',
    options: ['Один ключ для всего', 'Используются два разных ключа: публичный и приватный', 'Без ключа', 'Случайные данные'],
    correct_answer: 'Используются два разных ключа: публичный и приватный' },

  { id: '82', level: 3, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'Сниффер перехватил трафик.',
    question_ru: 'Что делает ARP-спуфинг?',
    options: ['Шифрует трафик', 'Подделывает ARP-таблицы для перехвата трафика', 'Сжимает пакеты', 'Меняет IP-адрес'],
    correct_answer: 'Подделывает ARP-таблицы для перехвата трафика' },

  { id: '83', level: 3, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'Веб-сервер содержит уязвимость.',
    question_ru: 'Что такое SQL-инъекция?',
    options: ['Создание таблицы', 'Внедрение SQL-кода через пользовательский ввод', 'Сортировка данных', 'Шифрование БД'],
    correct_answer: 'Внедрение SQL-кода через пользовательский ввод' },

  { id: '84', level: 3, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'XSS-атака на интерфейс.',
    question_ru: 'Что такое XSS?',
    options: ['Шифрование сессии', 'Внедрение JavaScript на страницу', 'Тип сертификата', 'Антивирус'],
    correct_answer: 'Внедрение JavaScript на страницу' },

  { id: '85', level: 3, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'Эскалация привилегий в системе.',
    question_ru: 'Что такое privilege escalation?',
    options: ['Сжатие данных', 'Получение более высоких прав доступа', 'Переадресация порта', 'Установка ОС'],
    correct_answer: 'Получение более высоких прав доступа' },

  { id: '86', level: 3, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'Криптомодуль использует AES.',
    question_ru: 'AES — это:',
    options: ['Асимметричный шифр', 'Симметричный блочный шифр', 'Хеш-функция', 'Протокол сети'],
    correct_answer: 'Симметричный блочный шифр' },

  { id: '87', level: 3, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'Длина ключа AES.',
    question_ru: 'Чем AES-256 отличается от AES-128?',
    options: ['Алгоритмом', 'Длиной ключа: 256 против 128 бит', 'Скоростью', 'Размером блока'],
    correct_answer: 'Длиной ключа: 256 против 128 бит' },

  { id: '88', level: 3, sector: 7, type: 'multiple_choice',
    lore_description_ru: 'DDoS на ангар.',
    question_ru: 'Что такое DDoS-атака?',
    options: ['Сжатие трафика', 'Распределённая атака отказа в обслуживании', 'Тип VPN', 'Сертификат'],
    correct_answer: 'Распределённая атака отказа в обслуживании' },

  { id: '89', level: 3, sector: 9, type: 'multiple_choice',
    lore_description_ru: 'VPN-туннель защищает связь.',
    question_ru: 'Что такое VPN?',
    options: ['Антивирус', 'Виртуальная частная сеть с шифрованием', 'Тип браузера', 'Сжатие данных'],
    correct_answer: 'Виртуальная частная сеть с шифрованием' },

  { id: '90', level: 3, sector: 10, type: 'multiple_choice',
    lore_description_ru: 'Радужные таблицы против хешей.',
    question_ru: 'Как защититься от rainbow table attack?',
    options: ['Сжать пароли', 'Добавлять соль к паролю перед хешированием', 'Менять алгоритм', 'Удалять пароли'],
    correct_answer: 'Добавлять соль к паролю перед хешированием' },

  { id: '91', level: 3, sector: 10, type: 'multiple_choice',
    lore_description_ru: '2FA-защита сервера.',
    question_ru: 'Что такое двухфакторная аутентификация?',
    options: ['Два пароля подряд', 'Подтверждение личности двумя разными способами', 'Двойное шифрование', 'Два сертификата'],
    correct_answer: 'Подтверждение личности двумя разными способами' },

  { id: '92', level: 3, sector: 11, type: 'multiple_choice',
    lore_description_ru: 'IDS-система анализирует трафик.',
    question_ru: 'Что делает IDS?',
    options: ['Шифрует данные', 'Обнаруживает вторжения в сеть', 'Создаёт VPN', 'Сжимает трафик'],
    correct_answer: 'Обнаруживает вторжения в сеть' },

  { id: '93', level: 3, sector: 12, type: 'multiple_choice',
    lore_description_ru: 'PKI обеспечивает доверие.',
    question_ru: 'Для чего нужна цифровая подпись?',
    options: ['Шифрование диска', 'Проверка подлинности и целостности данных', 'Сжатие', 'Маршрутизация'],
    correct_answer: 'Проверка подлинности и целостности данных' },

  { id: '94', level: 3, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'MITM-перехват соединения.',
    question_ru: 'Что такое MITM-атака?',
    options: ['Антивирус', 'Перехват между двумя сторонами связи', 'Тип шифра', 'Сертификат'],
    correct_answer: 'Перехват между двумя сторонами связи' },

  { id: '95', level: 3, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'Reverse shell обходит файрвол.',
    question_ru: 'Reverse shell — это:',
    options: ['Файловый менеджер', 'Соединение жертвы с атакующим для удалённого управления', 'Антивирус', 'Браузер'],
    correct_answer: 'Соединение жертвы с атакующим для удалённого управления' },

  { id: '96', level: 3, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Сложность алгоритма поиска.',
    question_ru: 'Какова сложность линейного поиска в массиве?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct_answer: 'O(n)' },

  { id: '97', level: 3, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Сложность алгоритма Aegis-X.',
    question_ru: 'Какова сложность двоичного поиска в отсортированном массиве?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct_answer: 'O(log n)' },

  { id: '98', level: 3, sector: 8, type: 'multiple_choice',
    lore_description_ru: 'Подготовленные запросы защищают БД.',
    question_ru: 'Что такое prepared statements?',
    options: ['Скрипты установки', 'Запросы с параметрами защищающие от SQL-инъекций', 'Резервные копии', 'Сортировка'],
    correct_answer: 'Запросы с параметрами защищающие от SQL-инъекций' },

  { id: '99', level: 3, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'CVE-каталог уязвимостей.',
    question_ru: 'Что такое CVE?',
    options: ['Антивирус', 'База публичных уязвимостей', 'Тип сертификата', 'Шифр'],
    correct_answer: 'База публичных уязвимостей' },

  // ── L3 Code Repair — Python (7) ──
  { id: '100', level: 3, sector: 5, type: 'code_repair', language: 'python',
    lore_description_ru: 'Функция факториала рекурсивно неполна.',
    question_ru: 'Что должно стоять вместо ▓▓▓ для корректной рекурсии?',
    code_snippet: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(▓▓▓)',
    correct_answer: 'n - 1',
    acceptedAnswers: ['n-1'],
    hint_ru: 'Рекурсивный вызов с уменьшенным аргументом' },

  { id: '101', level: 3, sector: 5, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт ищет максимум в списке.',
    question_ru: 'Какая встроенная функция вернёт наибольшее значение?',
    code_snippet: 'data = [3, 7, 1, 9, 4]\nresult = ▓▓▓(data)\nprint(result)',
    correct_answer: 'max' },

  { id: '102', level: 3, sector: 6, type: 'code_repair', language: 'python',
    lore_description_ru: 'Шифр Цезаря смещает символ.',
    question_ru: 'Какая функция возвращает ASCII-код символа?',
    code_snippet: 'code = ▓▓▓("A")\nprint(code)  # должно вывести 65',
    correct_answer: 'ord',
    hint_ru: 'Обратная функция к chr()' },

  { id: '103', level: 3, sector: 7, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт обходит безопасный логин.',
    question_ru: 'Какая строка корректно проверит, есть ли x в списке data?',
    code_snippet: 'data = [1, 2, 3]\nif ▓▓▓:\n    print("Найдено")',
    options: ['x in data', 'data has x', 'x = data', 'find(x, data)'],
    correct_answer: 'x in data' },

  { id: '104', level: 3, sector: 8, type: 'code_repair', language: 'python',
    lore_description_ru: 'Список индексаций повреждён.',
    question_ru: 'Какой индекс вернёт последний элемент списка?',
    code_snippet: 'data = [10, 20, 30, 40]\nlast = data[▓▓▓]\nprint(last)  # должно вывести 40',
    correct_answer: '-1',
    acceptedAnswers: ['len(data)-1', '3'],
    hint_ru: 'Отрицательная индексация в Python' },

  { id: '105', level: 3, sector: 9, type: 'code_repair', language: 'python',
    lore_description_ru: 'Защитный скрипт повторяет операцию пока есть ресурс.',
    question_ru: 'Какое ключевое слово открывает цикл с предусловием?',
    code_snippet: 'energy = 100\n▓▓▓ energy > 0:\n    energy -= 10\nprint("Drained")',
    correct_answer: 'while' },

  { id: '106', level: 3, sector: 11, type: 'code_repair', language: 'python',
    lore_description_ru: 'Функция-агрегатор суммирует данные сенсоров.',
    question_ru: 'Какая встроенная функция возвращает сумму элементов?',
    code_snippet: 'readings = [5, 8, 12, 3]\ntotal = ▓▓▓(readings)\nprint(total)',
    correct_answer: 'sum' },

  // ── L3 Code Repair — КуМир (7) ──
  { id: '107', level: 3, sector: 2, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм поиска минимума повреждён.',
    question_ru: 'Какой оператор корректно сравнит min с очередным a[i]?',
    code_snippet: 'нц для i от 1 до 5\n  если a[i] ▓▓▓ min\n    то min := a[i]\n  все\nкц',
    options: ['<', '>', '=', '<>'],
    correct_answer: '<' },

  { id: '108', level: 3, sector: 4, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Цикл-пока перебирает попытки взлома.',
    question_ru: 'Какое ключевое слово открывает условие в цикле "пока"?',
    code_snippet: 'нц ▓▓▓ x > 0\n  x := x - 1\nкц',
    correct_answer: 'пока' },

  { id: '109', level: 3, sector: 5, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм с параметром возвращает значение.',
    question_ru: 'Какое слово используется для возвращаемого параметра в КуМир?',
    code_snippet: 'алг цел квадрат(▓▓▓ цел n)\nнач\n  знач := n * n\nкон',
    options: ['арг', 'рез', 'аргрез', 'знач'],
    correct_answer: 'арг',
    hint_ru: 'Параметр, передаваемый в функцию' },

  { id: '110', level: 3, sector: 6, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Массив целых хранит коды доступа.',
    question_ru: 'Какое слово объявляет массив целых в КуМир?',
    code_snippet: '▓▓▓ цел коды[1:10]',
    correct_answer: 'таб',
    acceptedAnswers: ['таблица'],
    hint_ru: 'В КуМир массив называется "таблица"' },

  { id: '111', level: 3, sector: 7, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм находит и возвращает максимум.',
    question_ru: 'Какая переменная содержит результат функции в КуМир?',
    code_snippet: 'алг цел макс(арг цел a, b)\nнач\n  если a > b то ▓▓▓ := a иначе ▓▓▓ := b все\nкон',
    correct_answer: 'знач',
    hint_ru: 'Специальная переменная-результат функции' },

  { id: '112', level: 3, sector: 9, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Цикл с шагом перебирает чётные значения.',
    question_ru: 'Каким словом задаётся шаг цикла "для" в КуМир?',
    code_snippet: 'нц для i от 2 до 20 ▓▓▓ 2\n  вывод i, " "\nкц',
    correct_answer: 'шаг',
    hint_ru: 'Прямой перевод: "step"' },

  { id: '113', level: 3, sector: 11, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Условие двойной проверки в защите.',
    question_ru: 'Какой логический оператор работает как "и" в КуМир?',
    code_snippet: 'если x > 0 ▓▓▓ x < 100\n  то вывод "OK"\nвсе',
    correct_answer: 'и' },

  // ── L3 Code Repair — Pascal (7) ──
  { id: '114', level: 3, sector: 5, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Процедура шифрования объявлена неполно.',
    question_ru: 'Какое слово начинает определение процедуры в Pascal?',
    code_snippet: '▓▓▓ encrypt(var s: string);\nbegin\n  writeln(s)\nend;',
    correct_answer: 'procedure' },

  { id: '115', level: 3, sector: 5, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Функция возвращает контрольную сумму.',
    question_ru: 'Какое ключевое слово описывает функцию (возвращающую значение) в Pascal?',
    code_snippet: '▓▓▓ checksum(n: integer): integer;\nbegin\n  checksum := n mod 256\nend;',
    correct_answer: 'function' },

  { id: '116', level: 3, sector: 7, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Массив координат не описан.',
    question_ru: 'Как объявить массив из 10 целых чисел в Pascal?',
    code_snippet: 'var coords: ▓▓▓ [1..10] of integer;\nbegin\n  coords[1] := 0\nend.',
    correct_answer: 'array' },

  { id: '117', level: 3, sector: 9, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Цикл WHILE не отделён от условия.',
    question_ru: 'Какое слово отделяет условие от тела цикла while?',
    code_snippet: 'while x > 0 ▓▓▓\nbegin\n  x := x - 1\nend;',
    correct_answer: 'do' },

  { id: '118', level: 3, sector: 10, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'REPEAT-цикл проверяет условие выхода.',
    question_ru: 'Какое слово завершает цикл repeat (открывает условие выхода)?',
    code_snippet: 'repeat\n  x := x + 1\n▓▓▓ x = 10;',
    correct_answer: 'until' },

  { id: '119', level: 3, sector: 11, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Целочисленный остаток вычисляется неверно.',
    question_ru: 'Какой оператор Pascal вычисляет остаток от деления?',
    code_snippet: 'var r: integer;\nbegin\n  r := 17 ▓▓▓ 5;\n  writeln(r)  // должно вывести 2\nend.',
    correct_answer: 'mod' },

  { id: '120', level: 3, sector: 12, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Целочисленное деление в навигаторе.',
    question_ru: 'Какой оператор выполняет целочисленное деление в Pascal?',
    code_snippet: 'var q: integer;\nbegin\n  q := 17 ▓▓▓ 5;\n  writeln(q)  // должно вывести 3\nend.',
    correct_answer: 'div' },

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 4 — Перехват контроля
  //  MC: 16 (121-136) · CR: 24 (137-144 py, 145-152 ku, 153-160 pa)
  // ════════════════════════════════════════════════

  // ── L4 Multiple Choice ──
  { id: '121', level: 4, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Атака на криптоалгоритм.',
    question_ru: 'Что такое chosen-plaintext attack?',
    options: ['Атака с известным шифртекстом', 'Атака с выбранным открытым текстом', 'Перебор ключей', 'Атака по сторонним каналам'],
    correct_answer: 'Атака с выбранным открытым текстом' },

  { id: '122', level: 4, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'BGP-маршрутизация скомпрометирована.',
    question_ru: 'Что такое BGP hijacking?',
    options: ['Шифрование маршрутов', 'Перехват трафика через ложные BGP-объявления', 'Тип VPN', 'Сжатие маршрутов'],
    correct_answer: 'Перехват трафика через ложные BGP-объявления' },

  { id: '123', level: 4, sector: 2, type: 'multiple_choice',
    lore_description_ru: 'DNS-кеш атакован.',
    question_ru: 'Что такое DNS cache poisoning?',
    options: ['Удаление DNS-записей', 'Внедрение ложных записей в DNS-кеш', 'Шифрование запросов', 'Сжатие записей'],
    correct_answer: 'Внедрение ложных записей в DNS-кеш' },

  { id: '124', level: 4, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'SSRF на корабельный сервер.',
    question_ru: 'Что делает SSRF-атакующий?',
    options: ['Атакует клиента', 'Заставляет сервер делать запросы к внутренним ресурсам', 'Шифрует трафик', 'Удаляет логи'],
    correct_answer: 'Заставляет сервер делать запросы к внутренним ресурсам' },

  { id: '125', level: 4, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'Буфер ядра переполнен.',
    question_ru: 'Что такое buffer overflow?',
    options: ['Сжатие памяти', 'Запись данных за пределы буфера', 'Алгоритм сортировки', 'Тип хеша'],
    correct_answer: 'Запись данных за пределы буфера' },

  { id: '126', level: 4, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'AES-GCM режим обеспечивает целостность.',
    question_ru: 'Что обеспечивает режим GCM в AES?',
    options: ['Только шифрование', 'Шифрование и аутентификацию данных', 'Только подпись', 'Сжатие'],
    correct_answer: 'Шифрование и аутентификацию данных' },

  { id: '127', level: 4, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'PBKDF2 выводит ключ из пароля.',
    question_ru: 'Зачем нужен PBKDF2?',
    options: ['Шифровать диск', 'Безопасно получить ключ из пароля', 'Сжать данные', 'Сортировать'],
    correct_answer: 'Безопасно получить ключ из пароля' },

  { id: '128', level: 4, sector: 8, type: 'multiple_choice',
    lore_description_ru: 'Слепая SQL-инъекция в БД.',
    question_ru: 'Что такое blind SQL injection?',
    options: ['Атака с прямым выводом', 'Инъекция где результат угадывается по поведению', 'Сжатие SQL', 'Защита от SQL'],
    correct_answer: 'Инъекция где результат угадывается по поведению' },

  { id: '129', level: 4, sector: 9, type: 'multiple_choice',
    lore_description_ru: 'Pass-the-Ticket в Active Directory.',
    question_ru: 'Что использует атака Pass-the-Ticket?',
    options: ['Пароль root', 'Украденные Kerberos-тикеты', 'Сертификаты HTTPS', 'API-ключи'],
    correct_answer: 'Украденные Kerberos-тикеты' },

  { id: '130', level: 4, sector: 10, type: 'multiple_choice',
    lore_description_ru: 'Руткит спрятан в ядре.',
    question_ru: 'Что характерно для rootkit?',
    options: ['Видимая иконка', 'Сокрытие присутствия в системе', 'Открытое API', 'Логирование действий'],
    correct_answer: 'Сокрытие присутствия в системе' },

  { id: '131', level: 4, sector: 11, type: 'multiple_choice',
    lore_description_ru: 'SOC анализирует артефакты.',
    question_ru: 'Что такое IOC в ИБ?',
    options: ['Сертификат', 'Индикатор компрометации', 'Тип шифра', 'Тип брандмауэра'],
    correct_answer: 'Индикатор компрометации' },

  { id: '132', level: 4, sector: 12, type: 'multiple_choice',
    lore_description_ru: 'Квантовая физика защищает ключи.',
    question_ru: 'Что такое QKD?',
    options: ['Сжатие данных', 'Квантовое распределение ключей', 'Тип хеша', 'Файловая система'],
    correct_answer: 'Квантовое распределение ключей' },

  { id: '133', level: 4, sector: 12, type: 'multiple_choice',
    lore_description_ru: 'Алгоритм Шора ломает RSA.',
    question_ru: 'Что делает алгоритм Шора с RSA?',
    options: ['Шифрует данные', 'Раскладывает большие числа на множители за полиномиальное время', 'Сжимает ключи', 'Меняет режим'],
    correct_answer: 'Раскладывает большие числа на множители за полиномиальное время' },

  { id: '134', level: 4, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'CSRF-атака на сессию.',
    question_ru: 'Как защититься от CSRF?',
    options: ['Использовать HTTPS', 'Применять CSRF-токены и SameSite cookies', 'Шифровать БД', 'Сжимать страницы'],
    correct_answer: 'Применять CSRF-токены и SameSite cookies' },

  { id: '135', level: 4, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'TPM-чип хранит ключи.',
    question_ru: 'Что такое TPM?',
    options: ['Тип процессора', 'Аппаратный модуль для хранения криптоключей', 'Сетевой протокол', 'СУБД'],
    correct_answer: 'Аппаратный модуль для хранения криптоключей' },

  { id: '136', level: 4, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Сложность сортировки.',
    question_ru: 'Какова сложность быстрой сортировки (quicksort) в среднем?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'], correct_answer: 'O(n log n)' },

  // ── L4 Code Repair — Python (8) ──
  { id: '137', level: 4, sector: 5, type: 'code_repair', language: 'python',
    lore_description_ru: 'Алгоритм пузырьковой сортировки повреждён.',
    question_ru: 'Какое значение должно быть в условии сравнения соседей?',
    code_snippet: 'def bubble(a):\n    n = len(a)\n    for i in range(n):\n        for j in range(n - i - 1):\n            if a[j] ▓▓▓ a[j + 1]:\n                a[j], a[j+1] = a[j+1], a[j]\n    return a',
    options: ['>', '<', '==', '!='],
    correct_answer: '>' },

  { id: '138', level: 4, sector: 5, type: 'code_repair', language: 'python',
    lore_description_ru: 'Двоичный поиск ищет код доступа.',
    question_ru: 'Какое выражение корректно сужает поиск к правой половине?',
    code_snippet: 'def binsearch(a, key):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == key: return mid\n        if a[mid] < key:\n            lo = ▓▓▓\n        else:\n            hi = mid - 1\n    return -1',
    correct_answer: 'mid + 1',
    acceptedAnswers: ['mid+1'] },

  { id: '139', level: 4, sector: 6, type: 'code_repair', language: 'python',
    lore_description_ru: 'XOR-шифр накладывает ключ на байт.',
    question_ru: 'Какой оператор Python выполняет побитовое XOR?',
    code_snippet: 'data = 0b10110010\nkey  = 0b11001100\ncipher = data ▓▓▓ key\nprint(bin(cipher))',
    correct_answer: '^',
    hint_ru: 'Битовое исключающее ИЛИ' },

  { id: '140', level: 4, sector: 7, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт суммирует чётные числа в массиве.',
    question_ru: 'Какое выражение корректно отбирает чётные?',
    code_snippet: 'data = [1, 2, 3, 4, 5, 6]\nresult = sum(x for x in data if ▓▓▓)\nprint(result)  # 12',
    options: ['x % 2 == 0', 'x / 2 == 0', 'x mod 2 = 0', 'even(x)'],
    correct_answer: 'x % 2 == 0' },

  { id: '141', level: 4, sector: 8, type: 'code_repair', language: 'python',
    lore_description_ru: 'Подсчёт уникальных IP-адресов.',
    question_ru: 'Какая структура данных хранит только уникальные элементы?',
    code_snippet: 'ips = ["1.1.1.1", "2.2.2.2", "1.1.1.1"]\nunique = ▓▓▓(ips)\nprint(len(unique))  # 2',
    correct_answer: 'set' },

  { id: '142', level: 4, sector: 9, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт извлекает имя пользователя из лога.',
    question_ru: 'Какой метод строки разделит строку по пробелам?',
    code_snippet: 'line = "user=alice ip=10.0.0.1"\nparts = line.▓▓▓()\nprint(parts[0])  # user=alice',
    correct_answer: 'split' },

  { id: '143', level: 4, sector: 10, type: 'code_repair', language: 'python',
    lore_description_ru: 'Объект-словарь представляет пользователя.',
    question_ru: 'Какая конструкция Python — пустой словарь?',
    code_snippet: 'users = ▓▓▓\nusers["admin"] = 1\nprint(users)',
    options: ['{}', '[]', '()', 'set()'],
    correct_answer: '{}' },

  { id: '144', level: 4, sector: 11, type: 'code_repair', language: 'python',
    lore_description_ru: 'Скрипт логирует, если попыток больше N.',
    question_ru: 'Какой оператор корректно проверит и больше, и меньше или равно?',
    code_snippet: 'attempts = 5\nif 3 ▓▓▓ attempts ▓▓▓ 10:\n    print("Подозрительно")',
    options: ['< ... <=', '<= ... <=', '> ... >=', '< ... >'],
    correct_answer: '<= ... <=' },

  // ── L4 Code Repair — КуМир (8) ──
  { id: '145', level: 4, sector: 2, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Рекурсивный алгоритм Фибоначчи неполон.',
    question_ru: 'Какое выражение корректно для рекурсии Фибоначчи?',
    code_snippet: 'алг цел фиб(арг цел n)\nнач\n  если n < 2\n    то знач := n\n    иначе знач := ▓▓▓\n  все\nкон',
    correct_answer: 'фиб(n-1) + фиб(n-2)',
    acceptedAnswers: ['фиб(n-2) + фиб(n-1)', 'фиб(n - 1) + фиб(n - 2)'] },

  { id: '146', level: 4, sector: 4, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм линейного поиска возвращает индекс.',
    question_ru: 'Какое условие выхода из цикла используется для досрочного завершения?',
    code_snippet: 'нц для i от 1 до n\n  если a[i] = key\n    то знач := i; ▓▓▓\n  все\nкц',
    options: ['продолжить', 'выход', 'стоп', 'кон'],
    correct_answer: 'выход',
    hint_ru: 'В КуМир — "выход" из цикла' },

  { id: '147', level: 4, sector: 5, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Сортировка вставкой передвигает элементы.',
    question_ru: 'Какое сравнение корректно для перестановки соседей по возрастанию?',
    code_snippet: 'если a[j] > a[j+1]\n  то\n    врем := a[j]\n    a[j] ▓▓▓ a[j+1]\n    a[j+1] := врем\nвсе',
    correct_answer: ':=' },

  { id: '148', level: 4, sector: 6, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Логическое отрицание в защите.',
    question_ru: 'Какое слово в КуМир означает логическое отрицание?',
    code_snippet: 'если ▓▓▓ дверь_открыта\n  то вывод "Закрыта"\nвсе',
    correct_answer: 'не' },

  { id: '149', level: 4, sector: 7, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм возвращает длину массива.',
    question_ru: 'Какие индексы у таблицы a[1:n]?',
    code_snippet: 'таб цел a[1:n]\nвывод "Первый: ", a[▓▓▓]',
    options: ['0', '1', 'n', 'n+1'],
    correct_answer: '1',
    hint_ru: 'В КуМир таблицы обычно начинаются с 1, как указано в объявлении' },

  { id: '150', level: 4, sector: 9, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм-функция возвращает чётность.',
    question_ru: 'Какой оператор вычисляет остаток от деления в КуМир?',
    code_snippet: 'алг лог чёт(арг цел n)\nнач\n  знач := n ▓▓▓ 2 = 0\nкон',
    correct_answer: 'mod',
    acceptedAnswers: ['мод'],
    hint_ru: 'КуМир использует mod как Pascal' },

  { id: '151', level: 4, sector: 10, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм отдыхает заданное число итераций.',
    question_ru: 'Какое слово открывает простой цикл со счётчиком в КуМир?',
    code_snippet: 'нц 5 ▓▓▓\n  вывод "*"\nкц',
    correct_answer: 'раз',
    hint_ru: 'Цикл повторений "N раз"' },

  { id: '152', level: 4, sector: 12, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Логическое или защищает резервную систему.',
    question_ru: 'Какое слово в КуМир означает логическое "ИЛИ"?',
    code_snippet: 'если энергия > 0 ▓▓▓ резерв > 0\n  то вывод "Жив"\nвсе',
    correct_answer: 'или' },

  // ── L4 Code Repair — Pascal (8) ──
  { id: '153', level: 4, sector: 1, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Программа Pascal должна начинаться с заголовка.',
    question_ru: 'Какое слово начинает программу с именем в Pascal?',
    code_snippet: '▓▓▓ Aegis;\nbegin\n  writeln(\'start\')\nend.',
    correct_answer: 'program' },

  { id: '154', level: 4, sector: 2, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Цикл с обратным направлением считает обратно.',
    question_ru: 'Какое слово делает цикл for-обратным в Pascal?',
    code_snippet: 'for i := 10 ▓▓▓ 1 do\n  writeln(i);',
    correct_answer: 'downto' },

  { id: '155', level: 4, sector: 5, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Функция максимума возвращает результат.',
    question_ru: 'Как функция Pascal возвращает значение? (что слева от ":=")',
    code_snippet: 'function maxv(a, b: integer): integer;\nbegin\n  if a > b then ▓▓▓ := a else ▓▓▓ := b\nend;',
    correct_answer: 'maxv',
    hint_ru: 'Имя функции используется как переменная-результат' },

  { id: '156', level: 4, sector: 6, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Цикл while должен быть с телом из нескольких строк.',
    question_ru: 'Какое ключевое слово открывает блок операторов внутри while?',
    code_snippet: 'while x > 0 do\n▓▓▓\n  x := x - 1;\n  writeln(x)\nend;',
    correct_answer: 'begin' },

  { id: '157', level: 4, sector: 7, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Условное выражение с булевской операцией.',
    question_ru: 'Какое слово в Pascal — логическое "И"?',
    code_snippet: 'if (a > 0) ▓▓▓ (a < 100) then\n  writeln(\'ok\');',
    correct_answer: 'and' },

  { id: '158', level: 4, sector: 9, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Логическое отрицание в условии.',
    question_ru: 'Какое слово в Pascal — логическое отрицание?',
    code_snippet: 'if ▓▓▓ locked then\n  writeln(\'open\');',
    correct_answer: 'not' },

  { id: '159', level: 4, sector: 10, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Чтение значения с клавиатуры.',
    question_ru: 'Какая команда читает значение с переводом строки в Pascal?',
    code_snippet: 'var n: integer;\nbegin\n  ▓▓▓(n);\n  writeln(n * 2)\nend.',
    correct_answer: 'readln',
    acceptedAnswers: ['read'] },

  { id: '160', level: 4, sector: 11, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Рекурсивная функция факториала.',
    question_ru: 'Какое выражение корректно вычисляет факториал n>1?',
    code_snippet: 'function fact(n: integer): integer;\nbegin\n  if n <= 1 then fact := 1\n  else fact := ▓▓▓\nend;',
    correct_answer: 'n * fact(n - 1)',
    acceptedAnswers: ['n*fact(n-1)', 'fact(n-1)*n', 'n * fact(n-1)'] },

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 5 — Финальный протокол
  //  MC: 13 (161-173) · CR: 27 (174-182 py, 183-191 ku, 192-200 pa)
  // ════════════════════════════════════════════════

  // ── L5 Multiple Choice ──
  { id: '161', level: 5, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Aegis-X использует гомоморфное шифрование.',
    question_ru: 'Что позволяет гомоморфное шифрование?',
    options: ['Только хранение', 'Вычисления над зашифрованными данными без расшифровки', 'Сжатие', 'Подпись'],
    correct_answer: 'Вычисления над зашифрованными данными без расшифровки' },

  { id: '162', level: 5, sector: 1, type: 'multiple_choice',
    lore_description_ru: 'Криптостойкость Диффи-Хеллмана.',
    question_ru: 'На какой математической задаче основан DH?',
    options: ['Задача коммивояжёра', 'Дискретный логарифм', 'P=NP', 'Гипотеза Римана'],
    correct_answer: 'Дискретный логарифм' },

  { id: '163', level: 5, sector: 3, type: 'multiple_choice',
    lore_description_ru: 'Десериализация ведёт к RCE.',
    question_ru: 'Чем опасна небезопасная десериализация?',
    options: ['Утечкой памяти', 'Выполнением произвольного кода через вредоносный объект', 'Сжатием данных', 'Падением сети'],
    correct_answer: 'Выполнением произвольного кода через вредоносный объект' },

  { id: '164', level: 5, sector: 4, type: 'multiple_choice',
    lore_description_ru: 'ROP обходит защиту DEP.',
    question_ru: 'Что такое ROP-цепочка?',
    options: ['Тип сертификата', 'Использование существующего кода для обхода DEP', 'Шифр блочного типа', 'Тип VPN'],
    correct_answer: 'Использование существующего кода для обхода DEP' },

  { id: '165', level: 5, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Алгоритм Дейкстры в графе сети.',
    question_ru: 'Алгоритм Дейкстры находит:',
    options: ['Максимальный поток', 'Кратчайший путь в графе с неотрицательными весами', 'Минимальное остовное дерево', 'Цикл'],
    correct_answer: 'Кратчайший путь в графе с неотрицательными весами' },

  { id: '166', level: 5, sector: 6, type: 'multiple_choice',
    lore_description_ru: 'ChaCha20-Poly1305 как AEAD.',
    question_ru: 'Что обеспечивает ChaCha20-Poly1305?',
    options: ['Только шифрование', 'Аутентифицированное шифрование (AEAD)', 'Только MAC', 'Сжатие'],
    correct_answer: 'Аутентифицированное шифрование (AEAD)' },

  { id: '167', level: 5, sector: 7, type: 'multiple_choice',
    lore_description_ru: 'Supply chain атака внедряет бэкдор.',
    question_ru: 'Что такое supply chain attack?',
    options: ['Атака на клиента', 'Компрометация компонента в цепочке поставки ПО', 'Тип DDoS', 'Атака на BIOS'],
    correct_answer: 'Компрометация компонента в цепочке поставки ПО' },

  { id: '168', level: 5, sector: 8, type: 'multiple_choice',
    lore_description_ru: 'CAP-теорема для распределённой СУБД.',
    question_ru: 'Что говорит CAP-теорема?',
    options: ['Все три свойства возможны', 'Можно выбрать только 2 из 3: Consistency, Availability, Partition tolerance', 'Только Consistency возможна', 'Связи между свойствами нет'],
    correct_answer: 'Можно выбрать только 2 из 3: Consistency, Availability, Partition tolerance' },

  { id: '169', level: 5, sector: 10, type: 'multiple_choice',
    lore_description_ru: 'APT-группировки атакуют долго.',
    question_ru: 'Что характерно для APT?',
    options: ['Случайные атаки', 'Длительные целенаправленные кампании', 'Открытое сканирование', 'Шум в сети'],
    correct_answer: 'Длительные целенаправленные кампании' },

  { id: '170', level: 5, sector: 12, type: 'multiple_choice',
    lore_description_ru: 'NIST стандартизировал постквантовые алгоритмы.',
    question_ru: 'Какие алгоритмы стандартизировал NIST в 2024 для постквантовой криптографии?',
    options: ['RSA и ECC', 'AES и SHA-3', 'CRYSTALS-Kyber и CRYSTALS-Dilithium', 'DES и MD5'],
    correct_answer: 'CRYSTALS-Kyber и CRYSTALS-Dilithium' },

  { id: '171', level: 5, sector: 5, type: 'multiple_choice',
    lore_description_ru: 'Динамическое программирование решает сложные задачи.',
    question_ru: 'Какова сложность стандартного DP для рюкзака на (n, W)?',
    options: ['O(n)', 'O(n + W)', 'O(n × W)', 'O(2^n)'], correct_answer: 'O(n × W)' },

  { id: '172', level: 5, sector: 11, type: 'multiple_choice',
    lore_description_ru: 'AMSI bypass в Windows.',
    question_ru: 'Что атакует техника AMSI bypass?',
    options: ['Антивирус ESET', 'Проверку скриптов Windows Antimalware Scan Interface', 'Сертификаты', 'TPM'],
    correct_answer: 'Проверку скриптов Windows Antimalware Scan Interface' },

  { id: '173', level: 5, sector: 12, type: 'multiple_choice',
    lore_description_ru: 'Стандарт постквантовых ключей.',
    question_ru: 'На какой математической задаче основан CRYSTALS-Kyber?',
    options: ['Дискретный логарифм', 'Факторизация', 'Обучение с ошибками на решётках (Module-LWE)', 'NP-полнота SAT'],
    correct_answer: 'Обучение с ошибками на решётках (Module-LWE)' },

  // ── L5 Code Repair — Python (9) ──
  { id: '174', level: 5, sector: 1, type: 'code_repair', language: 'python',
    lore_description_ru: 'Алгоритм Евклида находит НОД.',
    question_ru: 'Какое выражение должно стоять для рекурсии алгоритма Евклида?',
    code_snippet: 'def gcd(a, b):\n    if b == 0:\n        return a\n    return ▓▓▓',
    correct_answer: 'gcd(b, a % b)',
    acceptedAnswers: ['gcd(b, a%b)'] },

  { id: '175', level: 5, sector: 5, type: 'code_repair', language: 'python',
    lore_description_ru: 'Быстрая сортировка делит массив на части.',
    question_ru: 'Какое выражение вернёт элементы, меньшие опорного?',
    code_snippet: 'def quicksort(a):\n    if len(a) <= 1: return a\n    p = a[0]\n    left  = ▓▓▓\n    right = [x for x in a[1:] if x >= p]\n    return quicksort(left) + [p] + quicksort(right)',
    correct_answer: '[x for x in a[1:] if x < p]',
    acceptedAnswers: ['[x for x in a[1:] if x<p]'] },

  { id: '176', level: 5, sector: 5, type: 'code_repair', language: 'python',
    lore_description_ru: 'Динамическое программирование считает Фибоначчи.',
    question_ru: 'Какое выражение корректно сохраняет результат?',
    code_snippet: 'def fib(n):\n    dp = [0] * (n + 1)\n    dp[0], dp[1] = 0, 1\n    for i in range(2, n + 1):\n        dp[i] = ▓▓▓\n    return dp[n]',
    correct_answer: 'dp[i - 1] + dp[i - 2]',
    acceptedAnswers: ['dp[i-1] + dp[i-2]', 'dp[i-2] + dp[i-1]'] },

  { id: '177', level: 5, sector: 6, type: 'code_repair', language: 'python',
    lore_description_ru: 'Хеш SHA-256 вычисляется через hashlib.',
    question_ru: 'Какой метод возвращает шестнадцатеричный хеш строки?',
    code_snippet: 'import hashlib\nh = hashlib.sha256(b"AEGIS").▓▓▓()\nprint(h[:8])',
    correct_answer: 'hexdigest' },

  { id: '178', level: 5, sector: 7, type: 'code_repair', language: 'python',
    lore_description_ru: 'BFS обходит граф уровень за уровнем.',
    question_ru: 'Какая структура данных нужна для BFS?',
    code_snippet: 'from collections import deque\ndef bfs(g, s):\n    q = ▓▓▓([s])\n    visited = {s}\n    while q:\n        u = q.popleft()\n        for v in g[u]:\n            if v not in visited:\n                visited.add(v); q.append(v)',
    correct_answer: 'deque' },

  { id: '179', level: 5, sector: 8, type: 'code_repair', language: 'python',
    lore_description_ru: 'Декоратор логирует вызовы функции.',
    question_ru: 'Какой синтаксис применяет декоратор к функции?',
    code_snippet: 'def log(f):\n    def wrap(*a, **k):\n        print("вызов", f.__name__)\n        return f(*a, **k)\n    return wrap\n\n▓▓▓\ndef target():\n    return 42',
    correct_answer: '@log',
    hint_ru: 'Знак собачки + имя декоратора' },

  { id: '180', level: 5, sector: 9, type: 'code_repair', language: 'python',
    lore_description_ru: 'Поиск всех вхождений регулярным выражением.',
    question_ru: 'Какой метод re возвращает список всех совпадений?',
    code_snippet: 'import re\nresult = re.▓▓▓(r"\\d+", "port 8080 host 192")\nprint(result)  # [\'8080\', \'192\']',
    correct_answer: 'findall' },

  { id: '181', level: 5, sector: 11, type: 'code_repair', language: 'python',
    lore_description_ru: 'Менеджер контекста безопасно работает с файлом.',
    question_ru: 'Какое ключевое слово открывает context manager?',
    code_snippet: '▓▓▓ open("log.txt") as f:\n    data = f.read()',
    correct_answer: 'with' },

  { id: '182', level: 5, sector: 12, type: 'code_repair', language: 'python',
    lore_description_ru: 'Обработка возможной ошибки сетевого вызова.',
    question_ru: 'Какое слово открывает блок обработки исключения?',
    code_snippet: 'try:\n    r = risky()\n▓▓▓ Exception as e:\n    print(e)',
    correct_answer: 'except' },

  // ── L5 Code Repair — КуМир (9) ──
  { id: '183', level: 5, sector: 1, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Рекурсивный НОД работает на двух числах.',
    question_ru: 'Какое выражение завершает рекурсию НОД?',
    code_snippet: 'алг цел нод(арг цел a, b)\nнач\n  если b = 0\n    то знач := a\n    иначе знач := ▓▓▓\n  все\nкон',
    correct_answer: 'нод(b, a mod b)',
    acceptedAnswers: ['нод(b, a мод b)', 'нод(b, mod(a,b))'] },

  { id: '184', level: 5, sector: 2, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм находит количество цифр числа.',
    question_ru: 'Какое условие продолжает цикл, пока есть цифры?',
    code_snippet: 'нц пока ▓▓▓\n  n := div(n, 10)\n  k := k + 1\nкц',
    correct_answer: 'n > 0',
    acceptedAnswers: ['n>0', 'n <> 0'] },

  { id: '185', level: 5, sector: 4, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм проверяет, является ли число простым.',
    question_ru: 'Какое выражение корректно проверит деление n на i?',
    code_snippet: 'нц для i от 2 до n - 1\n  если ▓▓▓ = 0\n    то знач := нет; выход\n  все\nкц',
    correct_answer: 'mod(n, i)',
    acceptedAnswers: ['n mod i', 'n мод i'] },

  { id: '186', level: 5, sector: 5, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Перевод числа в двоичную систему через деление.',
    question_ru: 'Какое выражение вернёт остаток деления n на 2 в КуМир?',
    code_snippet: 'нц пока n > 0\n  бит := ▓▓▓\n  n := div(n, 2)\nкц',
    correct_answer: 'mod(n, 2)',
    acceptedAnswers: ['n mod 2', 'n мод 2'] },

  { id: '187', level: 5, sector: 6, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Рекурсия для возведения в степень.',
    question_ru: 'Какое выражение для рекурсии "степень n"?',
    code_snippet: 'алг вещ степ(арг вещ x, арг цел n)\nнач\n  если n = 0\n    то знач := 1\n    иначе знач := x * ▓▓▓\n  все\nкон',
    correct_answer: 'степ(x, n - 1)',
    acceptedAnswers: ['степ(x, n-1)'] },

  { id: '188', level: 5, sector: 7, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм обращает строку.',
    question_ru: 'Что должно быть в условии, чтобы пройти строку с конца к началу?',
    code_snippet: 'нц для i от длин(s) до 1 ▓▓▓ -1\n  результат := результат + s[i]\nкц',
    correct_answer: 'шаг' },

  { id: '189', level: 5, sector: 8, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм обменивает два значения.',
    question_ru: 'Какая переменная нужна для безопасного обмена?',
    code_snippet: 'цел ▓▓▓\nврем := a\na := b\nb := врем',
    options: ['врем', 'tmp', 't', 'x'],
    correct_answer: 'врем' },

  { id: '190', level: 5, sector: 9, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Алгоритм с побочным эффектом изменяет аргумент.',
    question_ru: 'Какое слово описывает параметр, передаваемый ПО ССЫЛКЕ (изменяемый)?',
    code_snippet: 'алг увеличить(▓▓▓ цел x)\nнач\n  x := x + 1\nкон',
    options: ['арг', 'рез', 'аргрез', 'знач'],
    correct_answer: 'аргрез' },

  { id: '191', level: 5, sector: 11, type: 'code_repair', language: 'kumir',
    lore_description_ru: 'Утверждение проверяет инвариант защиты.',
    question_ru: 'Какое слово в КуМир проверяет инвариант (assertion)?',
    code_snippet: '▓▓▓ x >= 0\nвывод "x неотрицателен"',
    correct_answer: 'утв',
    acceptedAnswers: ['утверждение'],
    hint_ru: 'Краткое "утверждение"' },

  // ── L5 Code Repair — Pascal (9) ──
  { id: '192', level: 5, sector: 5, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Бинарный поиск находит ключ.',
    question_ru: 'Как корректно сузить поиск, если a[mid] < key?',
    code_snippet: 'while (lo <= hi) do begin\n  mid := (lo + hi) div 2;\n  if a[mid] = key then begin r := mid; break end;\n  if a[mid] < key then ▓▓▓\n  else hi := mid - 1\nend;',
    correct_answer: 'lo := mid + 1',
    acceptedAnswers: ['lo:=mid+1', 'lo := mid+1'] },

  { id: '193', level: 5, sector: 5, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Сортировка выбором ищет минимум.',
    question_ru: 'Какой оператор корректно обменяет два элемента a[i] и a[k]?',
    code_snippet: 'tmp  := a[i];\na[i] := a[k];\na[k] := ▓▓▓;',
    correct_answer: 'tmp' },

  { id: '194', level: 5, sector: 6, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Запись хранит структурированные данные пользователя.',
    question_ru: 'Какое слово описывает структуру (запись) в Pascal?',
    code_snippet: 'type TUser = ▓▓▓\n  id: integer;\n  name: string\nend;',
    correct_answer: 'record' },

  { id: '195', level: 5, sector: 7, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Решето Эратосфена находит простые числа.',
    question_ru: 'Какой шаг внутреннего цикла отмечает кратные p начиная с p*p?',
    code_snippet: 'for j := p * p to n do\n  if (j ▓▓▓ p) = 0 then sieve[j] := true;',
    correct_answer: 'mod' },

  { id: '196', level: 5, sector: 8, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Динамика для максимальной возрастающей подпоследовательности.',
    question_ru: 'Какое выражение обновляет dp[i] при a[j] < a[i]?',
    code_snippet: 'for j := 1 to i - 1 do\n  if (a[j] < a[i]) and (dp[j] + 1 > dp[i]) then\n    dp[i] := ▓▓▓;',
    correct_answer: 'dp[j] + 1',
    acceptedAnswers: ['dp[j]+1'] },

  { id: '197', level: 5, sector: 9, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Перевод числа в двоичный вид.',
    question_ru: 'Какой оператор берёт остаток деления n на 2?',
    code_snippet: 'while n > 0 do begin\n  bit := n ▓▓▓ 2;\n  n   := n div 2;\n  writeln(bit)\nend;',
    correct_answer: 'mod' },

  { id: '198', level: 5, sector: 10, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Передача массива в процедуру по ссылке.',
    question_ru: 'Какое слово делает параметр изменяемым (передаваемым по ссылке)?',
    code_snippet: 'procedure sort(▓▓▓ a: array of integer);\nbegin\n  // ...\nend;',
    correct_answer: 'var' },

  { id: '199', level: 5, sector: 11, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'Рекурсивный обход дерева.',
    question_ru: 'Что должно стоять для рекурсивного обхода левого поддерева?',
    code_snippet: 'procedure dfs(v: integer);\nbegin\n  if left[v] <> 0 then ▓▓▓;\n  visit(v);\n  if right[v] <> 0 then dfs(right[v])\nend;',
    correct_answer: 'dfs(left[v])',
    acceptedAnswers: ['dfs(left[v])'] },

  { id: '200', level: 5, sector: 12, type: 'code_repair', language: 'pascal',
    lore_description_ru: 'ФИНАЛ: ROT13 расшифровывает финальный код Aegis-X.',
    question_ru: 'Какое выражение поворачивает буквы алфавита на 13 (для A..Z, индекс 0..25)?',
    code_snippet: 'newCode := (code + ▓▓▓) mod 26;',
    correct_answer: '13' },
];

module.exports = { TASKS };
