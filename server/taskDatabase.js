// ============================================================
// Aegis-X: Cyber-Siege — Task Database (200 задач, RU)
//
// Распределение по типам/категориям:
//   80 logic_crypto (text_phrase) — 16/уровень
//   60 multiple_choice (cs_theory) — 12/уровень
//   60 code_repair (programming)   — 12/уровень (4 py + 4 ku + 4 pa)
//
// Игровая логика типа:
//   • multiple_choice — ОДНА попытка, при ошибке status='failed' навсегда
//   • code_repair     — попытки не ограничены
//   • text_phrase     — попытки не ограничены, case-insensitive,
//                       стрипает лишние пробелы и пунктуацию
//
// hints: string[] — раскрываются по порядку, каждая −10 очков
// ============================================================

const TASKS = [

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 1 (40 задач: 16 logic + 12 MC + 12 CR)
  // ════════════════════════════════════════════════

  // ── L1 · LOGIC & CRYPTO (text_phrase) ──
  { id: '1', level: 1, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X закодировал команду открытия шлюза двоичным числом.',
    question_ru: 'Переведи 1010 (двоичное) в десятичное.',
    correct_answer: '10',
    hints: ['Степени двойки справа налево: 1·8 + 0·4 + 1·2 + 0·1', '8 + 2 = ?'] },

  { id: '2', level: 1, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сенсор передал HEX-код позывного.',
    question_ru: 'Переведи HEX FF в десятичное число.',
    correct_answer: '255',
    hints: ['F = 15. Число: 15·16 + 15'] },

  { id: '3', level: 1, sector: 2, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Маяк передал серию сигналов в кодировке ASCII.',
    question_ru: 'Расшифруй ASCII 65 69 71 73 83 как слово.',
    correct_answer: 'AEGIS',
    acceptedAnswers: ['эгис'],
    hints: ['65 = A, латиница идёт подряд: 66=B, 67=C…'] },

  { id: '4', level: 1, sector: 2, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X скрыл слово простой подстановкой.',
    question_ru: 'Шифр Цезаря со сдвигом −3: «NHFV» → ?',
    correct_answer: 'KHES',
    acceptedAnswers: ['кхес'],
    hints: ['Каждую букву сдвигай на 3 позиции назад в латинском алфавите'] },

  { id: '5', level: 1, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Следующий ход вычислительной матрицы предсказуем.',
    question_ru: 'Следующее число в ряду: 2, 4, 8, 16, ?',
    correct_answer: '32',
    hints: ['Каждое следующее число в 2 раза больше предыдущего'] },

  { id: '6', level: 1, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Древняя последовательность Фибоначчи в системе навигации.',
    question_ru: 'Какое следующее число: 1, 1, 2, 3, 5, 8, ?',
    correct_answer: '13',
    hints: ['Каждое число — сумма двух предыдущих', '5 + 8 = ?'] },

  { id: '7', level: 1, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Двоичная сумма открывает реакторный замок.',
    question_ru: 'Чему равно 1011 + 0101 в двоичной системе?',
    correct_answer: '10000',
    hints: ['Складывай столбиком справа: 1+1=10, переноси', '11 + 5 = 16 = ?'] },

  { id: '8', level: 1, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Логическая связь сенсоров.',
    question_ru: 'Чему равно (1 И 0) ИЛИ 1?',
    correct_answer: '1',
    acceptedAnswers: ['истина', 'true', 'да'],
    hints: ['1 И 0 = 0, потом 0 ИЛИ 1 = ?'] },

  { id: '9', level: 1, sector: 5, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X спрятал ключ в зеркальном слове.',
    question_ru: 'Палиндром числа 121 это 121. Является ли число 12321 палиндромом? Ответь «да» или «нет».',
    correct_answer: 'да',
    acceptedAnswers: ['yes'],
    hints: ['Палиндром читается одинаково слева направо и справа налево'] },

  { id: '10', level: 1, sector: 5, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Двоичная вселенная скрывает простоту.',
    question_ru: 'Сколько единиц в двоичной записи числа 13?',
    correct_answer: '3',
    hints: ['13 = 8 + 4 + 1 = 1101 в двоичной'] },

  { id: '11', level: 1, sector: 6, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Команда выживания корабля считает пайки.',
    question_ru: 'На корабле 7 отсеков. Каждый соединён с каждым ровно одним коридором. Сколько всего коридоров?',
    correct_answer: '21',
    hints: ['Это число пар: n·(n−1)/2', '7·6/2 = ?'] },

  { id: '12', level: 1, sector: 6, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X шифрует через сдвиги.',
    question_ru: 'ROT13: «NRTVF» → ?',
    correct_answer: 'AEGIS',
    hints: ['Каждая буква сдвигается на 13 позиций (по кольцу)'] },

  { id: '13', level: 1, sector: 7, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Дрон передал координаты в виде последовательности.',
    question_ru: 'Закономерность: 1, 4, 9, 16, 25, ?',
    correct_answer: '36',
    hints: ['Это квадраты натуральных чисел: 1², 2², 3²…', '6² = ?'] },

  { id: '14', level: 1, sector: 8, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Складской шифр на основе позиции в алфавите.',
    question_ru: 'A=1, B=2, … Z=26. Чему равна сумма позиций букв слова CAB?',
    correct_answer: '6',
    hints: ['C=3, A=1, B=2. Сложи их'] },

  { id: '15', level: 1, sector: 9, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Терминал шахматной защиты.',
    question_ru: 'Сколько клеток на шахматной доске?',
    correct_answer: '64',
    hints: ['Доска 8×8'] },

  { id: '16', level: 1, sector: 12, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X скрыл пароль в простейшем шифре.',
    question_ru: 'Если ABC = 123, то CAB = ?',
    correct_answer: '312',
    hints: ['Каждая буква = её позиция в алфавите'] },

  // ── L1 · MULTIPLE CHOICE (cs_theory) ──
  { id: '17', level: 1, sector: 1, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Сенсор идентификации требует базовые знания.',
    question_ru: 'Сколько бит в одном байте?',
    options: ['4', '8', '16', '32'], correct_answer: '8',
    hints: ['Стандарт IEC: байт состоит из 8 бит'] },

  { id: '18', level: 1, sector: 2, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Память блока ковчега требует единиц измерения.',
    question_ru: 'Сколько байт в одном килобайте (по стандарту IEC)?',
    options: ['100', '1000', '1024', '2048'], correct_answer: '1024' },

  { id: '19', level: 1, sector: 3, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Маршрутизатор повреждён.',
    question_ru: 'Что такое IP-адрес?',
    options: ['Адрес ячейки памяти', 'Сетевой адрес устройства', 'Имя файла', 'Тип процессора'],
    correct_answer: 'Сетевой адрес устройства' },

  { id: '20', level: 1, sector: 3, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Сетевой блок требует понимания.',
    question_ru: 'Сколько октетов в IPv4-адресе?',
    options: ['2', '4', '6', '8'], correct_answer: '4' },

  { id: '21', level: 1, sector: 4, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'База паролей экипажа.',
    question_ru: 'Что означает аббревиатура WWW?',
    options: ['Web Wireless World', 'World Wide Web', 'Wired World Web', 'Wireless Working Web'],
    correct_answer: 'World Wide Web' },

  { id: '22', level: 1, sector: 5, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'ИИ ковчега проверяет уровень.',
    question_ru: 'Что из этого — браузер?',
    options: ['Excel', 'Firefox', 'PowerPoint', 'Outlook'], correct_answer: 'Firefox' },

  { id: '23', level: 1, sector: 6, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Навигатор сбросил настройки.',
    question_ru: 'Что делает служба DNS?',
    options: ['Шифрует трафик', 'Переводит имена в IP-адреса', 'Хранит пароли', 'Сжимает файлы'],
    correct_answer: 'Переводит имена в IP-адреса' },

  { id: '24', level: 1, sector: 7, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Ангар требует кода.',
    question_ru: 'Какой протокол отправляет email?',
    options: ['SMTP', 'HTTP', 'FTP', 'DNS'], correct_answer: 'SMTP' },

  { id: '25', level: 1, sector: 8, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Склад инвентаризирует порты.',
    question_ru: 'Какой порт по умолчанию у HTTP?',
    options: ['21', '22', '80', '443'], correct_answer: '80' },

  { id: '26', level: 1, sector: 9, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Командный мост проверяет логику.',
    question_ru: 'Что делает маршрутизатор (router)?',
    options: ['Хранит файлы', 'Переключает свет', 'Передаёт пакеты между сетями', 'Шифрует диск'],
    correct_answer: 'Передаёт пакеты между сетями' },

  { id: '27', level: 1, sector: 10, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Серверная требует знаний ОС.',
    question_ru: 'Что такое операционная система?',
    options: ['Программа управляющая компьютером', 'Тип процессора', 'Сетевой протокол', 'Часть монитора'],
    correct_answer: 'Программа управляющая компьютером' },

  { id: '28', level: 1, sector: 11, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Турельная защита изучает угрозы.',
    question_ru: 'Что такое компьютерный вирус?',
    options: ['Антивирус', 'Сетевой кабель', 'Вредоносная программа', 'Тип сертификата'],
    correct_answer: 'Вредоносная программа' },

  // ── L1 · CODE REPAIR (programming) ──
  // Python (4)
  { id: '29', level: 1, sector: 12, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Скрипт спасательной капсулы должен вывести позывной.',
    question_ru: 'Что должно стоять вместо ▓▓▓, чтобы вывести строку AEGIS?',
    code_snippet: 'print(▓▓▓)', correct_answer: '"AEGIS"',
    acceptedAnswers: ["'AEGIS'", '"aegis"', "'aegis'"],
    hints: ['Строки в Python заключаются в кавычки'] },

  { id: '30', level: 1, sector: 1, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Терминал ждёт ввода имени оператора.',
    question_ru: 'Какая функция читает строку с клавиатуры в Python?',
    code_snippet: 'name = ▓▓▓("Введите имя: ")\nprint("Привет,", name)',
    correct_answer: 'input',
    hints: ['Встроенная функция, противоположная print()'] },

  { id: '31', level: 1, sector: 3, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Переменная-год должна быть присвоена.',
    question_ru: 'Какой оператор присвоит переменной year значение 2147?',
    code_snippet: 'year ▓▓▓ 2147\nprint(year)', correct_answer: '=',
    hints: ['Один символ — основа присваивания в Python'] },

  { id: '32', level: 1, sector: 5, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Скрипт энергии складывает резервы.',
    question_ru: 'Какой оператор Python вычисляет сумму двух чисел?',
    code_snippet: 'a = 5\nb = 7\ntotal = a ▓▓▓ b\nprint(total)  # 12',
    correct_answer: '+' },

  // КуМир (4)
  { id: '33', level: 1, sector: 4, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Алгоритм навигации не объявлен.',
    question_ru: 'Какое ключевое слово начинает алгоритм в КуМир?',
    code_snippet: '▓▓▓ старт_навигации\nнач\n  вывод "ok"\nкон',
    correct_answer: 'алг', acceptedAnswers: ['алгоритм'],
    hints: ['Сокращение от «алгоритм»'] },

  { id: '34', level: 1, sector: 5, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Модуль вывода эвакуационного кода.',
    question_ru: 'Какая команда выводит значения в КуМир?',
    code_snippet: 'алг привет\nнач\n  ▓▓▓ "AEGIS-X"\nкон',
    correct_answer: 'вывод' },

  { id: '35', level: 1, sector: 6, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Переменная-счётчик объявлена неверного типа.',
    question_ru: 'Какой тип используется для целых чисел в КуМир?',
    code_snippet: 'алг счёт\nнач\n  ▓▓▓ n\n  n := 42\n  вывод n\nкон',
    correct_answer: 'цел', acceptedAnswers: ['целый'] },

  { id: '36', level: 1, sector: 9, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Сумматор переменных.',
    question_ru: 'Какой оператор присваивает значение переменной в КуМир?',
    code_snippet: 'алг сумма\nнач\n  цел s\n  s ▓▓▓ 0\n  вывод s\nкон',
    correct_answer: ':=',
    hints: ['Двоеточие плюс знак равенства'] },

  // Pascal (4)
  { id: '37', level: 1, sector: 9, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Турельная программа должна вывести сигнал.',
    question_ru: 'Какая команда выводит строку с переводом строки в Pascal?',
    code_snippet: 'begin\n  ▓▓▓(\'ALERT\');\nend.',
    correct_answer: 'writeln', acceptedAnswers: ['write'] },

  { id: '38', level: 1, sector: 11, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Целочисленный код доступа.',
    question_ru: 'Какой тип данных описывает целое число в Pascal?',
    code_snippet: 'var code: ▓▓▓;\nbegin\n  code := 2025;\n  writeln(code)\nend.',
    correct_answer: 'integer' },

  { id: '39', level: 1, sector: 2, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Программа реактора хранит температуру дробью.',
    question_ru: 'Какой тип описывает вещественное число в Pascal?',
    code_snippet: 'var temp: ▓▓▓;\nbegin\n  temp := 36.6;\n  writeln(temp)\nend.',
    correct_answer: 'real' },

  { id: '40', level: 1, sector: 4, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Блок операторов не открыт.',
    question_ru: 'Какое ключевое слово открывает блок операторов в Pascal?',
    code_snippet: 'var n: integer;\n▓▓▓\n  n := 5;\n  writeln(n)\nend.',
    correct_answer: 'begin' },

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 2
  // ════════════════════════════════════════════════

  // ── L2 · LOGIC & CRYPTO ──
  { id: '41', level: 2, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'ROT13 шифрует архивные логи.',
    question_ru: 'ROT13: «NRTVF-K» → ?',
    correct_answer: 'AEGIS-X',
    acceptedAnswers: ['aegisx', 'aegis x'],
    hints: ['Сдвиг ровно на 13 латинских позиций'] },

  { id: '42', level: 2, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сложение в Hex для замка отсека.',
    question_ru: 'Чему равно 1F + 21 в HEX (ответ в HEX)?',
    correct_answer: '40',
    hints: ['В десятичных: 31 + 33 = 64. Переведи 64 в HEX', '64 = 4·16 + 0'] },

  { id: '43', level: 2, sector: 2, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Шифр Атбаш зеркалит алфавит.',
    question_ru: 'Атбаш латиницей (A↔Z, B↔Y…): «ZVTRH» → ?',
    correct_answer: 'AEGIS',
    hints: ['Каждую букву меняй на «зеркальную»: A↔Z, B↔Y, C↔X…'] },

  { id: '44', level: 2, sector: 2, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сетевой блок ждёт правильной маски.',
    question_ru: 'Сколько узлов помещается в подсеть /24?',
    correct_answer: '254',
    hints: ['256 адресов всего, но 2 служебные (сеть и broadcast)'] },

  { id: '45', level: 2, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Логика парадоксальной защиты.',
    question_ru: 'Чему равно (НЕ 0) И (1 ИЛИ 0)? Ответь 0 или 1.',
    correct_answer: '1',
    hints: ['НЕ 0 = 1; 1 ИЛИ 0 = 1; 1 И 1 = ?'] },

  { id: '46', level: 2, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Логическая закономерность сетевого протокола.',
    question_ru: 'Следующее: 3, 6, 12, 24, 48, ?',
    correct_answer: '96',
    hints: ['Каждое число — удвоение предыдущего'] },

  { id: '47', level: 2, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Шифр Цезаря с большим сдвигом.',
    question_ru: 'Цезарь сдвиг −5: «FJLNX» → ?',
    correct_answer: 'AEGIS',
    hints: ['Каждую букву на 5 назад по латинскому алфавиту'] },

  { id: '48', level: 2, sector: 5, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сетка-головоломка скрывает координаты.',
    question_ru: 'На сетке 10×10 пронумерованы клетки 1..100 слева направо построчно. Какой номер у клетки в 4-й строке, 7-м столбце?',
    correct_answer: '37',
    hints: ['(строка − 1)·10 + столбец', '(4−1)·10 + 7 = 30 + 7'] },

  { id: '49', level: 2, sector: 6, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Реактор сжигает топливо по правилу.',
    question_ru: 'Если 2⁵ = 32, то 2⁷ = ?',
    correct_answer: '128',
    hints: ['Каждая следующая степень — удвоение: 2⁶ = 64, 2⁷ = ?'] },

  { id: '50', level: 2, sector: 7, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Команда ангара играет в логику.',
    question_ru: 'Если все хакеры — гении, и Алиса — хакер, кто Алиса? (одно слово)',
    correct_answer: 'гений',
    acceptedAnswers: ['гениальна'],
    hints: ['Силлогизм: общее правило + частный случай → вывод'] },

  { id: '51', level: 2, sector: 8, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Складские дрон-агенты считают комбинации.',
    question_ru: 'Сколькими способами можно расставить 3 разных дрона в ряд?',
    correct_answer: '6',
    hints: ['Это 3!', '3 · 2 · 1 = ?'] },

  { id: '52', level: 2, sector: 9, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Командный центр восстанавливает PIN.',
    question_ru: 'Сумма цифр числа 2147?',
    correct_answer: '14',
    hints: ['2 + 1 + 4 + 7'] },

  { id: '53', level: 2, sector: 10, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'XOR-шифр над двумя двоичными.',
    question_ru: 'Чему равно 1101 XOR 0110 (в двоичной)?',
    correct_answer: '1011',
    hints: ['XOR: 1 если биты разные, 0 если одинаковые'] },

  { id: '54', level: 2, sector: 11, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X спрятал слово.',
    question_ru: 'Анаграмма: переставь буквы слова «АРКА» так, чтобы получилось животное.',
    correct_answer: 'РАКА',
    acceptedAnswers: ['рака', 'каракулевая овца', 'кара'],
    hints: ['В слове 4 буквы; одно слово на букву Р'] },

  { id: '55', level: 2, sector: 12, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Капсула эвакуации читает HEX-сигнал.',
    question_ru: 'Расшифруй HEX-сообщение «48 49»: какое английское слово?',
    correct_answer: 'HI',
    hints: ['0x48 = 72 = «H», 0x49 = 73 = ?'] },

  { id: '56', level: 2, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Системные часы корабля бьют по закону.',
    question_ru: 'Если сейчас 23:00 на 24-часовом ковчеге, какое время будет через 5 часов?',
    correct_answer: '04:00',
    acceptedAnswers: ['4:00', '4', '04', '04 00'],
    hints: ['23 + 5 = 28, отнимай 24'] },

  // ── L2 · MULTIPLE CHOICE ──
  { id: '57', level: 2, sector: 3, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Веб-сервер ждёт корректного тега.',
    question_ru: 'Какой HTML-тег создаёт гиперссылку?',
    options: ['<a>', '<href>', '<link>', '<url>'], correct_answer: '<a>' },

  { id: '58', level: 2, sector: 4, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Командная строка ждёт команды.',
    question_ru: 'Какая Linux-команда показывает текущую директорию?',
    options: ['ls', 'cd', 'pwd', 'mv'], correct_answer: 'pwd' },

  { id: '59', level: 2, sector: 4, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Файловая система требует обзора.',
    question_ru: 'Какая Linux-команда выводит список файлов?',
    options: ['cat', 'ls', 'pwd', 'cp'], correct_answer: 'ls' },

  { id: '60', level: 2, sector: 6, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Хеш защищает пароль.',
    question_ru: 'Что такое хеш-функция?',
    options: ['Шифр с ключом', 'Преобразование данных в строку фиксированной длины', 'Архиватор', 'Алгоритм сортировки'],
    correct_answer: 'Преобразование данных в строку фиксированной длины' },

  { id: '61', level: 2, sector: 6, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Журнал безопасности.',
    question_ru: 'Сколько символов в MD5-хеше (запись HEX)?',
    options: ['16', '24', '32', '64'], correct_answer: '32' },

  { id: '62', level: 2, sector: 8, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Складские данные в JSON.',
    question_ru: 'Что такое JSON?',
    options: ['Язык программирования', 'Формат обмена данными', 'СУБД', 'Протокол сети'],
    correct_answer: 'Формат обмена данными' },

  { id: '63', level: 2, sector: 9, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Сканер портов разведки.',
    question_ru: 'Какой порт по умолчанию использует SSH?',
    options: ['21', '22', '23', '25'], correct_answer: '22' },

  { id: '64', level: 2, sector: 9, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'СУБД ждёт стандартный порт.',
    question_ru: 'Стандартный порт MySQL?',
    options: ['1433', '3306', '5432', '27017'], correct_answer: '3306' },

  { id: '65', level: 2, sector: 1, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Сертификат шлюза.',
    question_ru: 'Что обеспечивает SSL/TLS?',
    options: ['Сжатие данных', 'Шифрование интернет-соединений', 'Дефрагментацию', 'Маршрутизацию'],
    correct_answer: 'Шифрование интернет-соединений' },

  { id: '66', level: 2, sector: 2, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Wi-Fi защищён.',
    question_ru: 'WPA2 — это:',
    options: ['Антивирус', 'Протокол защиты беспроводных сетей', 'Тип кабеля', 'Файловая система'],
    correct_answer: 'Протокол защиты беспроводных сетей' },

  { id: '67', level: 2, sector: 11, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Защитный модуль учит угрозам.',
    question_ru: 'Что такое фишинг?',
    options: ['Сжатие файлов', 'Сетевой сканер', 'Мошеннические письма для кражи данных', 'Тип шифрования'],
    correct_answer: 'Мошеннические письма для кражи данных' },

  { id: '68', level: 2, sector: 10, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Сервер дублирует данные.',
    question_ru: 'Что делает RAID 1?',
    options: ['Распределяет данные между дисками', 'Зеркалирует диски', 'Сжимает данные', 'Шифрует диски'],
    correct_answer: 'Зеркалирует диски' },

  // ── L2 · CODE REPAIR ──
  // Python
  { id: '69', level: 2, sector: 1, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Скрипт-проверка уровня заряда.',
    question_ru: 'Какое ключевое слово начинает условный оператор в Python?',
    code_snippet: '▓▓▓ energy > 50:\n    print("OK")\nelse:\n    print("LOW")',
    correct_answer: 'if' },

  { id: '70', level: 2, sector: 5, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Цикл перебора пароля.',
    question_ru: 'Что должно стоять вместо ▓▓▓ для перебора 0..9?',
    code_snippet: 'for i in ▓▓▓(10):\n    print(i)',
    correct_answer: 'range' },

  { id: '71', level: 2, sector: 5, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Скрипт сравнивает значения.',
    question_ru: 'Какой оператор проверяет равенство значений в Python?',
    code_snippet: 'a = 5\nb = 5\nif a ▓▓▓ b:\n    print("Равны")',
    correct_answer: '==',
    hints: ['НЕ присваивание (=), а сравнение — нужно два символа'] },

  { id: '72', level: 2, sector: 8, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Функция возвращает результат.',
    question_ru: 'Какое слово возвращает значение из функции?',
    code_snippet: 'def double(x):\n    ▓▓▓ x * 2\n\nprint(double(21))',
    correct_answer: 'return' },

  // КуМир
  { id: '73', level: 2, sector: 2, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Алгоритм маяка переключает режим.',
    question_ru: 'Какое слово открывает блок условия в КуМир?',
    code_snippet: 'алг сигнал\nнач\n  цел x\n  x := 10\n  ▓▓▓ x > 5\n    то вывод "max"\n  все\nкон',
    correct_answer: 'если' },

  { id: '74', level: 2, sector: 4, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Цикл сканера перебирает порты.',
    question_ru: 'Какое слово открывает тело цикла в КуМир?',
    code_snippet: 'алг скан\nнач\n  цел i\n  ▓▓▓ для i от 1 до 5\n    вывод i\n  кц\nкон',
    correct_answer: 'нц',
    hints: ['Сокращение «начало цикла»'] },

  { id: '75', level: 2, sector: 9, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Защита базы запрашивает ввод.',
    question_ru: 'Какая команда читает значение с клавиатуры в КуМир?',
    code_snippet: 'алг привет\nнач\n  лит имя\n  ▓▓▓ имя\n  вывод "Привет, ", имя\nкон',
    correct_answer: 'ввод' },

  { id: '76', level: 2, sector: 10, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Цикл-сканер не закрыт.',
    question_ru: 'Какое ключевое слово завершает тело цикла нц?',
    code_snippet: 'нц для i от 1 до 3\n  вывод i\n▓▓▓',
    correct_answer: 'кц' },

  // Pascal
  { id: '77', level: 2, sector: 4, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Распознавание угрозы.',
    question_ru: 'Какое слово ставится перед телом IF-блока в Pascal?',
    code_snippet: 'if x > 0 ▓▓▓\n  writeln(\'positive\');',
    correct_answer: 'then' },

  { id: '78', level: 2, sector: 6, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Цикл реактора.',
    question_ru: 'Какое слово открывает цикл со счётчиком в Pascal?',
    code_snippet: '▓▓▓ i := 1 to 10 do\n  writeln(i);',
    correct_answer: 'for' },

  { id: '79', level: 2, sector: 7, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Скрипт ангара.',
    question_ru: 'Какой оператор присваивания в Pascal?',
    code_snippet: 'var n: integer;\nbegin\n  n ▓▓▓ 100;\n  writeln(n)\nend.',
    correct_answer: ':=' },

  { id: '80', level: 2, sector: 8, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Складская сверка.',
    question_ru: 'Какой оператор проверяет равенство в Pascal?',
    code_snippet: 'if x ▓▓▓ y then\n  writeln(\'equal\');',
    correct_answer: '=',
    hints: ['В Pascal «=» — сравнение, «:=» — присваивание'] },

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 3
  // ════════════════════════════════════════════════

  // ── L3 · LOGIC & CRYPTO ──
  { id: '81', level: 3, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Подсчёт битов в маске.',
    question_ru: 'Сколько единичных бит в двоичной записи числа 255?',
    correct_answer: '8',
    hints: ['255 = 2⁸ − 1', '11111111 — сколько единиц?'] },

  { id: '82', level: 3, sector: 2, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Криптоматрица шифра подстановки.',
    question_ru: 'Шифр: A→3, B→1, C→2. Закодированное «CAB» = ? (через запятую)',
    correct_answer: '2,3,1',
    acceptedAnswers: ['2 3 1', '231'],
    hints: ['Подставь каждую букву по таблице'] },

  { id: '83', level: 3, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сеть передаёт пакеты по пути.',
    question_ru: 'В сети 4 узла, каждые два связаны одним каналом. Сколько каналов?',
    correct_answer: '6',
    hints: ['Это C(4, 2)', '4·3/2 = ?'] },

  { id: '84', level: 3, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Уязвимое поле логики.',
    question_ru: 'Сколько строк в таблице истинности для трёх переменных?',
    correct_answer: '8',
    hints: ['Каждая переменная — 2 значения; формула 2ⁿ'] },

  { id: '85', level: 3, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Эскалация прав в системе.',
    question_ru: 'Закономерность: 1, 2, 6, 24, 120, ?',
    correct_answer: '720',
    hints: ['Каждое — умножение предыдущего на возрастающее число: ×2, ×3, ×4…', '120 · 6 = ?'] },

  { id: '86', level: 3, sector: 5, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X скрыл число модульной арифметикой.',
    question_ru: 'Чему равно 17 mod 5?',
    correct_answer: '2',
    hints: ['Остаток от деления 17 на 5'] },

  { id: '87', level: 3, sector: 6, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Длина ключа влияет на стойкость.',
    question_ru: 'Сколько разных значений принимает 8-битный ключ?',
    correct_answer: '256',
    hints: ['2 в степени 8'] },

  { id: '88', level: 3, sector: 7, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Прямая логика парадокса.',
    question_ru: 'У вируса есть 2 состояния: активен или нет. Сколько разных комбинаций для 4 вирусов?',
    correct_answer: '16',
    hints: ['2⁴'] },

  { id: '89', level: 3, sector: 8, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Шифр частот букв.',
    question_ru: 'Сколько букв в русском алфавите?',
    correct_answer: '33',
    hints: ['Включая ё и ъ'] },

  { id: '90', level: 3, sector: 9, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сетевая криптография.',
    question_ru: 'Подсеть /29 содержит сколько ХОСТОВ (без сети и broadcast)?',
    correct_answer: '6',
    hints: ['/29 = 8 адресов, минус 2 служебных'] },

  { id: '91', level: 3, sector: 10, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Радужные таблицы перебирают хеши.',
    question_ru: 'Радужные таблицы помогают взламывать… (одно слово)',
    correct_answer: 'пароли',
    acceptedAnswers: ['пароль', 'хеши', 'хеш'],
    hints: ['Предвычисленные пары «открытый текст ↔ хеш»'] },

  { id: '92', level: 3, sector: 11, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X прячет числа в дробях.',
    question_ru: 'Какое следующее: 1, 1/2, 1/3, 1/4, ?',
    correct_answer: '1/5',
    acceptedAnswers: ['0.2', '0,2'],
    hints: ['Знаменатель растёт на 1 каждый раз'] },

  { id: '93', level: 3, sector: 12, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Подпись модуля проверяется через хеш.',
    question_ru: 'SHA-256 даёт хеш длиной сколько бит?',
    correct_answer: '256',
    hints: ['Подсказка в названии алгоритма'] },

  { id: '94', level: 3, sector: 2, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Перехват MITM.',
    question_ru: 'У трёх агентов A, B, C по одному ключу. Сколько уникальных пар можно составить?',
    correct_answer: '3',
    hints: ['AB, AC, BC'] },

  { id: '95', level: 3, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Reverse-shell обходит файрвол.',
    question_ru: 'Соедини точки последовательно: 1→3→5→7. Какое следующее число?',
    correct_answer: '9',
    hints: ['Каждое +2'] },

  { id: '96', level: 3, sector: 5, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сложность алгоритма по нотации O.',
    question_ru: 'Для массива из 16 элементов двоичный поиск делает максимум сколько сравнений?',
    correct_answer: '4',
    hints: ['log₂(16) = ?'] },

  // ── L3 · MULTIPLE CHOICE ──
  { id: '97', level: 3, sector: 1, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Aegis-X использует RSA.',
    question_ru: 'В чём суть асимметричного шифрования?',
    options: ['Один ключ для всего', 'Два разных ключа: публичный и приватный', 'Без ключей', 'Случайные данные'],
    correct_answer: 'Два разных ключа: публичный и приватный' },

  { id: '98', level: 3, sector: 3, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Веб-сервер уязвим.',
    question_ru: 'Что такое SQL-инъекция?',
    options: ['Создание таблицы', 'Внедрение SQL-кода через ввод', 'Сортировка данных', 'Шифрование БД'],
    correct_answer: 'Внедрение SQL-кода через ввод' },

  { id: '99', level: 3, sector: 3, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'XSS-атака.',
    question_ru: 'Что такое XSS?',
    options: ['Шифрование сессии', 'Внедрение JavaScript на страницу', 'Тип сертификата', 'Антивирус'],
    correct_answer: 'Внедрение JavaScript на страницу' },

  { id: '100', level: 3, sector: 4, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Эскалация прав.',
    question_ru: 'Что такое privilege escalation?',
    options: ['Сжатие данных', 'Получение более высоких прав доступа', 'Переадресация порта', 'Установка ОС'],
    correct_answer: 'Получение более высоких прав доступа' },

  { id: '101', level: 3, sector: 6, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Криптомодуль AES.',
    question_ru: 'AES — это:',
    options: ['Асимметричный шифр', 'Симметричный блочный шифр', 'Хеш-функция', 'Протокол сети'],
    correct_answer: 'Симметричный блочный шифр' },

  { id: '102', level: 3, sector: 7, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'DDoS на ангар.',
    question_ru: 'Что такое DDoS-атака?',
    options: ['Сжатие трафика', 'Распределённая атака отказа в обслуживании', 'Тип VPN', 'Сертификат'],
    correct_answer: 'Распределённая атака отказа в обслуживании' },

  { id: '103', level: 3, sector: 9, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'VPN-туннель.',
    question_ru: 'Что такое VPN?',
    options: ['Антивирус', 'Виртуальная частная сеть с шифрованием', 'Тип браузера', 'Сжатие данных'],
    correct_answer: 'Виртуальная частная сеть с шифрованием' },

  { id: '104', level: 3, sector: 10, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Защита от радужных таблиц.',
    question_ru: 'Что добавляют к паролю перед хешированием?',
    options: ['Сжатие', 'Соль (salt)', 'Сертификат', 'Подпись'],
    correct_answer: 'Соль (salt)' },

  { id: '105', level: 3, sector: 11, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'IDS-система.',
    question_ru: 'Что делает IDS?',
    options: ['Шифрует данные', 'Обнаруживает вторжения в сеть', 'Создаёт VPN', 'Сжимает трафик'],
    correct_answer: 'Обнаруживает вторжения в сеть' },

  { id: '106', level: 3, sector: 12, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'PKI обеспечивает доверие.',
    question_ru: 'Для чего нужна цифровая подпись?',
    options: ['Шифрование диска', 'Проверка подлинности и целостности данных', 'Сжатие', 'Маршрутизация'],
    correct_answer: 'Проверка подлинности и целостности данных' },

  { id: '107', level: 3, sector: 5, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Сложность поиска.',
    question_ru: 'Какова сложность двоичного поиска в отсортированном массиве?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct_answer: 'O(log n)' },

  { id: '108', level: 3, sector: 8, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Защита БД.',
    question_ru: 'Что такое prepared statements?',
    options: ['Скрипты установки', 'Запросы с параметрами защищающие от SQL-инъекций', 'Резервные копии', 'Сортировка'],
    correct_answer: 'Запросы с параметрами защищающие от SQL-инъекций' },

  // ── L3 · CODE REPAIR ──
  // Python
  { id: '109', level: 3, sector: 5, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Рекурсия факториала Aegis-X.',
    question_ru: 'Что должно стоять вместо ▓▓▓ для корректной рекурсии?',
    code_snippet: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(▓▓▓)',
    correct_answer: 'n - 1', acceptedAnswers: ['n-1'],
    hints: ['Рекурсивный вызов с уменьшенным аргументом'] },

  { id: '110', level: 3, sector: 5, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Скрипт ищет максимум.',
    question_ru: 'Какая встроенная функция вернёт наибольшее значение?',
    code_snippet: 'data = [3, 7, 1, 9, 4]\nresult = ▓▓▓(data)\nprint(result)',
    correct_answer: 'max' },

  { id: '111', level: 3, sector: 9, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Цикл расходует ресурс.',
    question_ru: 'Какое ключевое слово открывает цикл с предусловием?',
    code_snippet: 'energy = 100\n▓▓▓ energy > 0:\n    energy -= 10\nprint("Done")',
    correct_answer: 'while' },

  { id: '112', level: 3, sector: 11, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Сенсоры суммируются.',
    question_ru: 'Какая функция возвращает сумму элементов списка?',
    code_snippet: 'readings = [5, 8, 12, 3]\ntotal = ▓▓▓(readings)\nprint(total)',
    correct_answer: 'sum' },

  // КуМир
  { id: '113', level: 3, sector: 2, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Поиск минимума.',
    question_ru: 'Какой оператор сравнения корректно перепишет min, если a[i] меньше?',
    code_snippet: 'нц для i от 1 до 5\n  если a[i] ▓▓▓ min\n    то min := a[i]\n  все\nкц',
    options: ['<', '>', '=', '<>'], correct_answer: '<' },

  { id: '114', level: 3, sector: 4, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Цикл-пока перебирает попытки.',
    question_ru: 'Какое слово открывает условие цикла «пока» в КуМир?',
    code_snippet: 'нц ▓▓▓ x > 0\n  x := x - 1\nкц',
    correct_answer: 'пока' },

  { id: '115', level: 3, sector: 6, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Массив кодов доступа.',
    question_ru: 'Какое слово объявляет массив (таблицу) в КуМир?',
    code_snippet: '▓▓▓ цел коды[1:10]',
    correct_answer: 'таб', acceptedAnswers: ['таблица'] },

  { id: '116', level: 3, sector: 7, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Алгоритм возвращает максимум.',
    question_ru: 'Какая переменная содержит результат функции в КуМир?',
    code_snippet: 'алг цел макс(арг цел a, b)\nнач\n  если a > b то ▓▓▓ := a иначе ▓▓▓ := b все\nкон',
    correct_answer: 'знач' },

  // Pascal
  { id: '117', level: 3, sector: 5, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Процедура шифрования.',
    question_ru: 'Какое слово открывает процедуру в Pascal?',
    code_snippet: '▓▓▓ encrypt(var s: string);\nbegin\n  writeln(s)\nend;',
    correct_answer: 'procedure' },

  { id: '118', level: 3, sector: 7, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Массив координат.',
    question_ru: 'Каким словом описывается массив в Pascal?',
    code_snippet: 'var coords: ▓▓▓ [1..10] of integer;\nbegin\n  coords[1] := 0\nend.',
    correct_answer: 'array' },

  { id: '119', level: 3, sector: 11, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Целочисленный остаток.',
    question_ru: 'Какой оператор Pascal даёт остаток от деления?',
    code_snippet: 'var r: integer;\nbegin\n  r := 17 ▓▓▓ 5;\n  writeln(r)  // 2\nend.',
    correct_answer: 'mod' },

  { id: '120', level: 3, sector: 12, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Целочисленное деление.',
    question_ru: 'Какой оператор Pascal делает целочисленное деление?',
    code_snippet: 'var q: integer;\nbegin\n  q := 17 ▓▓▓ 5;\n  writeln(q)  // 3\nend.',
    correct_answer: 'div' },

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 4
  // ════════════════════════════════════════════════

  // ── L4 · LOGIC & CRYPTO ──
  { id: '121', level: 4, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Многошаговый шифр Aegis-X.',
    question_ru: 'Зашифруй слово «AB» Атбашем, потом Цезарем сдвиг +1. Ответ?',
    correct_answer: 'AZ',
    hints: ['Атбаш: A→Z, B→Y. Получится ZY', 'Затем +1: Z→A, Y→Z'] },

  { id: '122', level: 4, sector: 2, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сетевые маршруты Aegis-X.',
    question_ru: 'В сети 5 серверов, каждый соединён с каждым (полный граф). Сколько рёбер?',
    correct_answer: '10',
    hints: ['C(5, 2) = 5·4/2'] },

  { id: '123', level: 4, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'SSRF, но в логике.',
    question_ru: 'Чему равно (НЕ (A ИЛИ B)) при A=1, B=0?',
    correct_answer: '0',
    acceptedAnswers: ['ложь', 'false', 'нет'],
    hints: ['1 ИЛИ 0 = 1; НЕ 1 = ?'] },

  { id: '124', level: 4, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Переполнение буфера в числах.',
    question_ru: 'Чему равно 11111111 + 1 в двоичной (для 8 битов с переполнением)?',
    correct_answer: '00000000',
    acceptedAnswers: ['0', '00000000'],
    hints: ['255 + 1 = 256 = 100000000, но мы храним только 8 бит'] },

  { id: '125', level: 4, sector: 5, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Анализ сложности сортировки.',
    question_ru: 'Сортировка пузырьком имеет худшую сложность O(n^k). Чему равно k?',
    correct_answer: '2',
    hints: ['Два вложенных цикла → n·n'] },

  { id: '126', level: 4, sector: 6, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Подстановочный шифр с известным ключом.',
    question_ru: 'Подстановка: A↔Z, B↔Y, …. «ZTV» → ?',
    correct_answer: 'AGE',
    hints: ['Это шифр Атбаш', 'Z→A, T→G, V→E'] },

  { id: '127', level: 4, sector: 7, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Логика IoT-устройств.',
    question_ru: 'У дрона 4 датчика, каждый «активен» или «нет». Сколько разных состояний дрона?',
    correct_answer: '16',
    hints: ['2⁴'] },

  { id: '128', level: 4, sector: 8, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Слепая SQL-инъекция считает символы.',
    question_ru: 'Сколько различных 3-буквенных паролей из символов {A, B, C} (с повторами)?',
    correct_answer: '27',
    hints: ['3 варианта на позицию × 3 позиции', '3³'] },

  { id: '129', level: 4, sector: 9, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Тикеты Kerberos и подсчёт сессий.',
    question_ru: 'У 4 операторов по 3 тикета у каждого. Всего тикетов?',
    correct_answer: '12',
    hints: ['Произведение: 4 × 3'] },

  { id: '130', level: 4, sector: 10, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Aegis-X скрывает rootkit.',
    question_ru: 'У многозначного числа 9876 — сколько различных цифр?',
    correct_answer: '4',
    hints: ['9, 8, 7, 6 — все разные'] },

  { id: '131', level: 4, sector: 11, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'IOC-индикатор по сигнатуре.',
    question_ru: 'Закономерность: 2, 3, 5, 7, 11, ?',
    correct_answer: '13',
    hints: ['Простые числа'] },

  { id: '132', level: 4, sector: 12, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Квантовая загадка ключей.',
    question_ru: 'Если 1024 = 2^10, то 4096 = 2 в степени ?',
    correct_answer: '12',
    hints: ['4096 = 1024 · 4 = 2¹⁰ · 2² = 2^?'] },

  { id: '133', level: 4, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'CSRF и порядок токенов.',
    question_ru: 'В строке из символов «AABABBA» сколько символов B?',
    correct_answer: '3',
    hints: ['Просто посчитай B по одному'] },

  { id: '134', level: 4, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'TPM-ключ имеет hex-представление.',
    question_ru: 'Сколько HEX-символов нужно, чтобы записать 32-битное число?',
    correct_answer: '8',
    hints: ['1 hex = 4 бита', '32 / 4 = ?'] },

  { id: '135', level: 4, sector: 5, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Динамика по сложности.',
    question_ru: 'Сложность быстрой сортировки в среднем — O(n^k log n). Чему равно k?',
    correct_answer: '1',
    hints: ['Среднее: O(n log n), значит n в первой степени'] },

  { id: '136', level: 4, sector: 6, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Многократное XOR.',
    question_ru: 'Чему равно X XOR X для любого X?',
    correct_answer: '0',
    hints: ['XOR одинаковых битов всегда равен 0'] },

  // ── L4 · MULTIPLE CHOICE ──
  { id: '137', level: 4, sector: 1, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Атака с известным открытым текстом.',
    question_ru: 'Что такое chosen-plaintext attack?',
    options: ['Атака с известным шифртекстом', 'Атака с выбранным открытым текстом', 'Перебор ключей', 'Атака по сторонним каналам'],
    correct_answer: 'Атака с выбранным открытым текстом' },

  { id: '138', level: 4, sector: 3, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'SSRF на сервер.',
    question_ru: 'Что делает SSRF-атакующий?',
    options: ['Атакует клиента', 'Заставляет сервер делать запросы к внутренним ресурсам', 'Шифрует трафик', 'Удаляет логи'],
    correct_answer: 'Заставляет сервер делать запросы к внутренним ресурсам' },

  { id: '139', level: 4, sector: 4, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Переполнение буфера.',
    question_ru: 'Что такое buffer overflow?',
    options: ['Сжатие памяти', 'Запись данных за пределы буфера', 'Алгоритм сортировки', 'Тип хеша'],
    correct_answer: 'Запись данных за пределы буфера' },

  { id: '140', level: 4, sector: 6, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'AES-GCM целостность.',
    question_ru: 'Что обеспечивает режим GCM в AES?',
    options: ['Только шифрование', 'Шифрование и аутентификацию данных', 'Только подпись', 'Сжатие'],
    correct_answer: 'Шифрование и аутентификацию данных' },

  { id: '141', level: 4, sector: 8, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Слепая SQL-инъекция.',
    question_ru: 'Что такое blind SQL injection?',
    options: ['Атака с прямым выводом', 'Инъекция где результат угадывается по поведению', 'Сжатие SQL', 'Защита от SQL'],
    correct_answer: 'Инъекция где результат угадывается по поведению' },

  { id: '142', level: 4, sector: 9, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Pass-the-Ticket.',
    question_ru: 'Что использует атака Pass-the-Ticket?',
    options: ['Пароль root', 'Украденные Kerberos-тикеты', 'Сертификаты HTTPS', 'API-ключи'],
    correct_answer: 'Украденные Kerberos-тикеты' },

  { id: '143', level: 4, sector: 10, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Руткит в ядре.',
    question_ru: 'Что характерно для rootkit?',
    options: ['Видимая иконка', 'Сокрытие присутствия в системе', 'Открытое API', 'Логирование действий'],
    correct_answer: 'Сокрытие присутствия в системе' },

  { id: '144', level: 4, sector: 11, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'SOC-аналитики.',
    question_ru: 'Что такое IOC в ИБ?',
    options: ['Сертификат', 'Индикатор компрометации', 'Тип шифра', 'Тип брандмауэра'],
    correct_answer: 'Индикатор компрометации' },

  { id: '145', level: 4, sector: 12, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Квантовая криптография.',
    question_ru: 'Что такое QKD?',
    options: ['Сжатие данных', 'Квантовое распределение ключей', 'Тип хеша', 'Файловая система'],
    correct_answer: 'Квантовое распределение ключей' },

  { id: '146', level: 4, sector: 4, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'TPM-чип.',
    question_ru: 'Что такое TPM?',
    options: ['Тип процессора', 'Аппаратный модуль для хранения криптоключей', 'Сетевой протокол', 'СУБД'],
    correct_answer: 'Аппаратный модуль для хранения криптоключей' },

  { id: '147', level: 4, sector: 5, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Сложность сортировки.',
    question_ru: 'Какова сложность быстрой сортировки в среднем?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'], correct_answer: 'O(n log n)' },

  { id: '148', level: 4, sector: 7, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'IoT-протоколы.',
    question_ru: 'Основная проблема многих IoT-протоколов?',
    options: ['Высокая скорость', 'Слабая или отсутствующая аутентификация', 'Сложность установки', 'Большой размер кода'],
    correct_answer: 'Слабая или отсутствующая аутентификация' },

  // ── L4 · CODE REPAIR ──
  // Python
  { id: '149', level: 4, sector: 5, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Пузырьковая сортировка.',
    question_ru: 'Какой оператор сравнения нужен для сортировки по возрастанию?',
    code_snippet: 'def bubble(a):\n    n = len(a)\n    for i in range(n):\n        for j in range(n - i - 1):\n            if a[j] ▓▓▓ a[j+1]:\n                a[j], a[j+1] = a[j+1], a[j]\n    return a',
    options: ['>', '<', '==', '!='], correct_answer: '>' },

  { id: '150', level: 4, sector: 5, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Двоичный поиск.',
    question_ru: 'Какое выражение сужает поиск к правой половине?',
    code_snippet: 'while lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == key: return mid\n    if a[mid] < key:\n        lo = ▓▓▓\n    else:\n        hi = mid - 1',
    correct_answer: 'mid + 1', acceptedAnswers: ['mid+1'] },

  { id: '151', level: 4, sector: 6, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'XOR-шифр.',
    question_ru: 'Какой оператор Python выполняет побитовое XOR?',
    code_snippet: 'data = 0b10110010\nkey  = 0b11001100\ncipher = data ▓▓▓ key\nprint(bin(cipher))',
    correct_answer: '^' },

  { id: '152', level: 4, sector: 8, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Уникальные IP.',
    question_ru: 'Какая структура хранит только уникальные элементы?',
    code_snippet: 'ips = ["1.1.1.1", "2.2.2.2", "1.1.1.1"]\nunique = ▓▓▓(ips)\nprint(len(unique))  # 2',
    correct_answer: 'set' },

  // КуМир
  { id: '153', level: 4, sector: 2, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Рекурсивный Фибоначчи.',
    question_ru: 'Какое выражение должно быть для рекурсии Фибоначчи?',
    code_snippet: 'алг цел фиб(арг цел n)\nнач\n  если n < 2\n    то знач := n\n    иначе знач := ▓▓▓\n  все\nкон',
    correct_answer: 'фиб(n-1) + фиб(n-2)',
    acceptedAnswers: ['фиб(n-2) + фиб(n-1)'] },

  { id: '154', level: 4, sector: 4, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Линейный поиск.',
    question_ru: 'Какое слово досрочно выходит из цикла в КуМир?',
    code_snippet: 'нц для i от 1 до n\n  если a[i] = key\n    то знач := i; ▓▓▓\n  все\nкц',
    options: ['продолжить', 'выход', 'стоп', 'кон'], correct_answer: 'выход' },

  { id: '155', level: 4, sector: 6, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Логическое отрицание.',
    question_ru: 'Какое слово в КуМир — логическое отрицание?',
    code_snippet: 'если ▓▓▓ дверь_открыта\n  то вывод "Закрыта"\nвсе',
    correct_answer: 'не' },

  { id: '156', level: 4, sector: 9, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Чётность через mod.',
    question_ru: 'Какой оператор остатка от деления в КуМир?',
    code_snippet: 'алг лог чёт(арг цел n)\nнач\n  знач := n ▓▓▓ 2 = 0\nкон',
    correct_answer: 'mod', acceptedAnswers: ['мод'] },

  // Pascal
  { id: '157', level: 4, sector: 1, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Заголовок программы Pascal.',
    question_ru: 'Какое слово начинает программу с именем в Pascal?',
    code_snippet: '▓▓▓ Aegis;\nbegin\n  writeln(\'start\')\nend.',
    correct_answer: 'program' },

  { id: '158', level: 4, sector: 2, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Обратный счётчик.',
    question_ru: 'Какое слово делает цикл for обратным?',
    code_snippet: 'for i := 10 ▓▓▓ 1 do\n  writeln(i);',
    correct_answer: 'downto' },

  { id: '159', level: 4, sector: 7, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Логическое И.',
    question_ru: 'Какое слово в Pascal — логическое «И»?',
    code_snippet: 'if (a > 0) ▓▓▓ (a < 100) then\n  writeln(\'ok\');',
    correct_answer: 'and' },

  { id: '160', level: 4, sector: 11, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Рекурсивный факториал.',
    question_ru: 'Какое выражение корректно вычисляет fact(n) при n>1?',
    code_snippet: 'function fact(n: integer): integer;\nbegin\n  if n <= 1 then fact := 1\n  else fact := ▓▓▓\nend;',
    correct_answer: 'n * fact(n - 1)',
    acceptedAnswers: ['n*fact(n-1)', 'fact(n-1)*n'] },

  // ════════════════════════════════════════════════
  //  УРОВЕНЬ 5
  // ════════════════════════════════════════════════

  // ── L5 · LOGIC & CRYPTO ──
  { id: '161', level: 5, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Финальный код Aegis-X — двухэтапный шифр.',
    question_ru: 'Цезарь +13 → Атбаш. Закодируй «A». Сколько шагов и какой итоговый символ?',
    correct_answer: 'M',
    hints: ['A → +13 → N', 'N → Атбаш → M'] },

  { id: '162', level: 5, sector: 2, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Сложный сетевой топ.',
    question_ru: 'В графе 6 вершин, граф ПОЛНЫЙ. Сколько рёбер?',
    correct_answer: '15',
    hints: ['C(6, 2) = 6·5/2'] },

  { id: '163', level: 5, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'SSTI и подсчёт операторов.',
    question_ru: 'Какое максимальное число рёбер в дереве из 8 вершин?',
    correct_answer: '7',
    hints: ['В дереве рёбер = вершин − 1'] },

  { id: '164', level: 5, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'ROP-цепочка и адресация.',
    question_ru: 'Адресное пространство 32 бит — сколько ГИГАБАЙТ адресов? (целое)',
    correct_answer: '4',
    hints: ['2³² байт = 4·2³⁰ байт = 4 ГБ'] },

  { id: '165', level: 5, sector: 5, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Алгоритм Дейкстры и кратчайшие.',
    question_ru: 'В графе из 5 вершин и 8 рёбер. Найди MAX число рёбер в простом цикле.',
    correct_answer: '5',
    hints: ['В цикле длиной n вершин ровно n рёбер'] },

  { id: '166', level: 5, sector: 6, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'AEAD-шифрование.',
    question_ru: 'Поток ChaCha20 использует 256-битный ключ. Сколько разных ключей?',
    correct_answer: '2^256',
    acceptedAnswers: ['2**256', '2 в степени 256'],
    hints: ['Каждый бит — 0 или 1, всего 256 бит'] },

  { id: '167', level: 5, sector: 7, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Supply-chain и зависимости.',
    question_ru: 'У пакета X прямые зависимости — пакеты A, B. У A — C, D. У B — E. Сколько ВСЕГО уникальных пакетов в дереве?',
    correct_answer: '6',
    hints: ['X + A + B + C + D + E'] },

  { id: '168', level: 5, sector: 8, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'CAP-теорема и комбинации.',
    question_ru: 'Сколько способов выбрать 2 свойства из 3 в CAP-теореме?',
    correct_answer: '3',
    hints: ['C(3, 2) = 3'] },

  { id: '169', level: 5, sector: 9, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Mimikatz и хеши.',
    question_ru: 'Сколько HEX-символов в SHA-256-хеше?',
    correct_answer: '64',
    hints: ['256 бит / 4 бита на hex-символ'] },

  { id: '170', level: 5, sector: 10, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'APT-кампания таблицу проходит.',
    question_ru: 'В таблице 5 строк и 8 столбцов. Сколько ячеек?',
    correct_answer: '40',
    hints: ['Произведение'] },

  { id: '171', level: 5, sector: 11, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'UEBA — поведенческие графы.',
    question_ru: 'Через сколько рукопожатий все 10 операторов знают друг друга (полный граф)?',
    correct_answer: '45',
    hints: ['Это C(10, 2)', '10·9/2 = ?'] },

  { id: '172', level: 5, sector: 12, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'ROT13 ультиматум Aegis-X.',
    question_ru: 'ROT13: «PUVCURE» → ? (одно английское слово)',
    correct_answer: 'CIPHER',
    hints: ['Каждую букву сдвинь на 13 в обе стороны (ROT13 симметричен)'] },

  { id: '173', level: 5, sector: 1, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Подсчёт перестановок ключа.',
    question_ru: 'Сколько разных перестановок букв слова AEGIS (все буквы разные)?',
    correct_answer: '120',
    hints: ['5! = 5·4·3·2·1'] },

  { id: '174', level: 5, sector: 3, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'XSS-фильтр считает теги.',
    question_ru: 'В строке «<a><b><a><c><a>» — сколько раз встречается <a>?',
    correct_answer: '3',
    hints: ['Просто посчитай вхождения'] },

  { id: '175', level: 5, sector: 4, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'ASLR-адреса.',
    question_ru: 'Сколько различных значений может принимать 1 байт?',
    correct_answer: '256',
    hints: ['2⁸'] },

  { id: '176', level: 5, sector: 6, type: 'text_phrase', category: 'logic_crypto',
    lore_description_ru: 'Финальный шифр — комбинация.',
    question_ru: 'Считая каждую букву A=1, Z=26: сумма позиций слова AID? (латиница)',
    correct_answer: '14',
    hints: ['A=1, I=9, D=4', '1 + 9 + 4 = ?'] },

  // ── L5 · MULTIPLE CHOICE ──
  { id: '177', level: 5, sector: 1, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Гомоморфное шифрование.',
    question_ru: 'Что позволяет гомоморфное шифрование?',
    options: ['Только хранение', 'Вычисления над зашифрованными данными без расшифровки', 'Сжатие', 'Подпись'],
    correct_answer: 'Вычисления над зашифрованными данными без расшифровки' },

  { id: '178', level: 5, sector: 5, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Алгоритм Дейкстры.',
    question_ru: 'Алгоритм Дейкстры находит:',
    options: ['Максимальный поток', 'Кратчайший путь в графе с неотрицательными весами', 'Минимальное остовное дерево', 'Цикл'],
    correct_answer: 'Кратчайший путь в графе с неотрицательными весами' },

  { id: '179', level: 5, sector: 4, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'ROP против DEP.',
    question_ru: 'Что такое ROP-цепочка?',
    options: ['Тип сертификата', 'Использование существующего кода для обхода DEP', 'Шифр блочного типа', 'Тип VPN'],
    correct_answer: 'Использование существующего кода для обхода DEP' },

  { id: '180', level: 5, sector: 7, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Supply-chain атаки.',
    question_ru: 'Что такое supply chain attack?',
    options: ['Атака на клиента', 'Компрометация компонента в цепочке поставки ПО', 'Тип DDoS', 'Атака на BIOS'],
    correct_answer: 'Компрометация компонента в цепочке поставки ПО' },

  { id: '181', level: 5, sector: 8, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'CAP-теорема.',
    question_ru: 'Что говорит CAP-теорема о распределённых системах?',
    options: ['Все три свойства возможны', 'Только 2 из 3: Consistency, Availability, Partition tolerance', 'Только Consistency', 'Свойства не связаны'],
    correct_answer: 'Только 2 из 3: Consistency, Availability, Partition tolerance' },

  { id: '182', level: 5, sector: 10, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'APT.',
    question_ru: 'Что характерно для APT?',
    options: ['Случайные атаки', 'Длительные целенаправленные кампании', 'Открытое сканирование', 'Шум в сети'],
    correct_answer: 'Длительные целенаправленные кампании' },

  { id: '183', level: 5, sector: 12, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Постквантовая криптография.',
    question_ru: 'Какие алгоритмы стандартизировал NIST в 2024 для постквантового шифрования?',
    options: ['RSA и ECC', 'AES и SHA-3', 'CRYSTALS-Kyber и CRYSTALS-Dilithium', 'DES и MD5'],
    correct_answer: 'CRYSTALS-Kyber и CRYSTALS-Dilithium' },

  { id: '184', level: 5, sector: 6, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'AEAD.',
    question_ru: 'Что обеспечивает ChaCha20-Poly1305?',
    options: ['Только шифрование', 'Аутентифицированное шифрование (AEAD)', 'Только MAC', 'Сжатие'],
    correct_answer: 'Аутентифицированное шифрование (AEAD)' },

  { id: '185', level: 5, sector: 5, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Динамическое программирование.',
    question_ru: 'Сложность стандартного DP для задачи о рюкзаке (n предметов, ёмкость W)?',
    options: ['O(n)', 'O(n + W)', 'O(n · W)', 'O(2^n)'], correct_answer: 'O(n · W)' },

  { id: '186', level: 5, sector: 11, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'AMSI bypass.',
    question_ru: 'Что атакует AMSI bypass?',
    options: ['Антивирус ESET', 'Проверку скриптов Windows Antimalware Scan Interface', 'Сертификаты', 'TPM'],
    correct_answer: 'Проверку скриптов Windows Antimalware Scan Interface' },

  { id: '187', level: 5, sector: 12, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Основа Kyber.',
    question_ru: 'На какой задаче основан CRYSTALS-Kyber?',
    options: ['Дискретный логарифм', 'Факторизация', 'Обучение с ошибками на решётках (Module-LWE)', 'SAT'],
    correct_answer: 'Обучение с ошибками на решётках (Module-LWE)' },

  { id: '188', level: 5, sector: 3, type: 'multiple_choice', category: 'cs_theory',
    lore_description_ru: 'Уязвимости десериализации.',
    question_ru: 'Чем опасна небезопасная десериализация?',
    options: ['Утечкой памяти', 'Выполнением произвольного кода через вредоносный объект', 'Сжатием данных', 'Падением сети'],
    correct_answer: 'Выполнением произвольного кода через вредоносный объект' },

  // ── L5 · CODE REPAIR ──
  // Python
  { id: '189', level: 5, sector: 1, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Алгоритм Евклида.',
    question_ru: 'Какое выражение для рекурсии НОД?',
    code_snippet: 'def gcd(a, b):\n    if b == 0:\n        return a\n    return ▓▓▓',
    correct_answer: 'gcd(b, a % b)', acceptedAnswers: ['gcd(b, a%b)'] },

  { id: '190', level: 5, sector: 5, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Динамика Фибоначчи.',
    question_ru: 'Какое выражение корректно сохраняет результат DP?',
    code_snippet: 'def fib(n):\n    dp = [0]*(n+1)\n    dp[0], dp[1] = 0, 1\n    for i in range(2, n+1):\n        dp[i] = ▓▓▓\n    return dp[n]',
    correct_answer: 'dp[i - 1] + dp[i - 2]',
    acceptedAnswers: ['dp[i-1] + dp[i-2]', 'dp[i-2] + dp[i-1]'] },

  { id: '191', level: 5, sector: 7, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'BFS-обход графа.',
    question_ru: 'Какая структура нужна для BFS?',
    code_snippet: 'from collections import deque\nq = ▓▓▓([start])\nvisited = {start}\nwhile q:\n    u = q.popleft()',
    correct_answer: 'deque' },

  { id: '192', level: 5, sector: 11, type: 'code_repair', category: 'programming', language: 'python',
    lore_description_ru: 'Context manager.',
    question_ru: 'Какое ключевое слово безопасно открывает файл?',
    code_snippet: '▓▓▓ open("log.txt") as f:\n    data = f.read()',
    correct_answer: 'with' },

  // КуМир
  { id: '193', level: 5, sector: 1, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Рекурсивный НОД.',
    question_ru: 'Какое выражение завершает рекурсию НОД?',
    code_snippet: 'алг цел нод(арг цел a, b)\nнач\n  если b = 0\n    то знач := a\n    иначе знач := ▓▓▓\n  все\nкон',
    correct_answer: 'нод(b, a mod b)',
    acceptedAnswers: ['нод(b, a мод b)', 'нод(b, mod(a,b))'] },

  { id: '194', level: 5, sector: 4, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Проверка простоты.',
    question_ru: 'Какое выражение остатка от деления n на i?',
    code_snippet: 'нц для i от 2 до n - 1\n  если ▓▓▓ = 0\n    то знач := нет; выход\n  все\nкц',
    correct_answer: 'mod(n, i)',
    acceptedAnswers: ['n mod i', 'n мод i'] },

  { id: '195', level: 5, sector: 9, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Параметр по ссылке.',
    question_ru: 'Какое слово делает параметр изменяемым (по ссылке) в КуМир?',
    code_snippet: 'алг увеличить(▓▓▓ цел x)\nнач\n  x := x + 1\nкон',
    options: ['арг', 'рез', 'аргрез', 'знач'], correct_answer: 'аргрез' },

  { id: '196', level: 5, sector: 11, type: 'code_repair', category: 'programming', language: 'kumir',
    lore_description_ru: 'Утверждение-инвариант.',
    question_ru: 'Какое слово в КуМир проверяет инвариант (assertion)?',
    code_snippet: '▓▓▓ x >= 0\nвывод "x неотрицателен"',
    correct_answer: 'утв', acceptedAnswers: ['утверждение'] },

  // Pascal
  { id: '197', level: 5, sector: 5, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Бинарный поиск.',
    question_ru: 'Как корректно сужать поиск, если a[mid] < key?',
    code_snippet: 'while (lo <= hi) do begin\n  mid := (lo + hi) div 2;\n  if a[mid] = key then begin r := mid; break end;\n  if a[mid] < key then ▓▓▓\n  else hi := mid - 1\nend;',
    correct_answer: 'lo := mid + 1',
    acceptedAnswers: ['lo:=mid+1', 'lo := mid+1'] },

  { id: '198', level: 5, sector: 6, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Запись (структура).',
    question_ru: 'Каким словом описывается запись (struct) в Pascal?',
    code_snippet: 'type TUser = ▓▓▓\n  id: integer;\n  name: string\nend;',
    correct_answer: 'record' },

  { id: '199', level: 5, sector: 9, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'Перевод в двоичную.',
    question_ru: 'Какой оператор берёт остаток деления n на 2?',
    code_snippet: 'while n > 0 do begin\n  bit := n ▓▓▓ 2;\n  n   := n div 2;\n  writeln(bit)\nend;',
    correct_answer: 'mod' },

  { id: '200', level: 5, sector: 12, type: 'code_repair', category: 'programming', language: 'pascal',
    lore_description_ru: 'ФИНАЛ: ROT13 расшифровывает код Aegis-X.',
    question_ru: 'Какой сдвиг (число) применяет ROT13 к 26-буквенному алфавиту?',
    code_snippet: 'newCode := (code + ▓▓▓) mod 26;',
    correct_answer: '13' },
];

module.exports = { TASKS };
