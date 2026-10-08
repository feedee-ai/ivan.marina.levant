// Shared facts for every language: contacts, services, schedule, reviews.
// Prices: put a number in EUR (e.g. 55) instead of null — the site shows it automatically.

export const site = {
  url: 'https://ivan-marina-levant.example', // TODO: replace with the real domain
  instagram: 'https://www.instagram.com/ivan.marina.levant/',
  instagramHandle: '@ivan.marina.levant',
  phones: {
    ivan: { display: '+34 613 728 778', wa: '34613728778' },
    marina: { display: '+34 613 296 874', wa: '34613296874' },
  },
  address: 'Carrer de Molina de Segura, 2, L’Olivereta, 46018 València',
  metro: 'Av. del Cid',
  maps: 'https://www.google.com/maps/search/?api=1&query=Levant+Massage+by+Marina+%26+Ivan+Carrer+de+Molina+de+Segura+2+Valencia',
  mapsEmbed: 'https://www.google.com/maps?q=Carrer+de+Molina+de+Segura+2,+46018+Val%C3%A8ncia&output=embed',
  geo: { lat: 39.4698, lng: -0.3986 },
  hours: { open: '10:00', close: '20:00' }, // every day
  rating: { value: '5,0', count: 22 },
};

// masters: who can do it. 'both' = the four-hands duo.
export const services = [
  { id: 'four', masters: ['both'], durations: [90], price: null, signature: true },
  { id: 'therapeutic', masters: ['ivan', 'marina'], durations: [60, 90], price: null },
  { id: 'deep', masters: ['ivan'], durations: [60, 90], price: null },
  { id: 'face', masters: ['marina'], durations: [60], price: null },
  { id: 'yoga', masters: ['ivan'], durations: [60, 90], price: null },
  { id: 'neck', masters: ['ivan', 'marina'], durations: [40], price: null },
  { id: 'feet', masters: ['ivan', 'marina'], durations: [45], price: null },
  { id: 'manual', masters: ['ivan'], durations: [60], price: null },
  { id: 'consult', masters: ['ivan', 'marina'], durations: [20], price: 0 },
];

// Real Google reviews, kept in the language they were written in.
export const reviews = [
  { name: 'Аріна Г.', lang: 'UA', ago: { uk: '9 міс. тому', ru: '9 мес. назад', es: 'hace 9 meses', en: '9 months ago' },
    text: 'Я людина, яка постійно все тримає під контролем, але там це було майже неможливо — ти не можеш ментально слідкувати за двома людьми, тому розслабляєшся все одно. Це дуже командна і якісна робота! У Марини дуже ніжні руки, у Івана — мужні й сильні, відчувається досвід.' },
  { name: 'Daria S.', lang: 'RU', ago: { uk: '3 міс. тому', ru: '3 мес. назад', es: 'hace 3 meses', en: '3 months ago' },
    text: 'Огромное спасибо Марине и Ивану! Они буквально спасли меня от сильной боли в плече и руке. Из-за защемления боль отдавала даже в сердце. После проведённого массажа уже на следующий день…' },
  { name: 'Liz P.', lang: 'ES', ago: { uk: '5 міс. тому', ru: '5 мес. назад', es: 'hace 5 meses', en: '5 months ago' },
    text: 'Para mí fue una suerte conocer a Ivan y Marina. De sus sesiones salgo totalmente renovada. Amables y cercanos, con una profesionalidad exquisita. Se nota la mejoría desde el primer día. 100% recomendable.' },
  { name: 'Hollow', lang: 'EN', ago: { uk: '6 міс. тому', ru: '6 мес. назад', es: 'hace 6 meses', en: '6 months ago' },
    text: 'They really helped me with neck pain, so I can sleep much better now. I’m extremely grateful and highly recommend them.' },
  { name: 'Наталя Б.', lang: 'UA', ago: { uk: '11 міс. тому', ru: '11 мес. назад', es: 'hace 11 meses', en: '11 months ago' },
    text: 'В захваті від масажу в чотири руки. Я ніби розчинилася на кушетці. Все продумано до дрібниць: рушничок, музика, аромат, засоби особистої гігієни. Прийду ще!' },
  { name: 'Регина П.', lang: 'RU', ago: { uk: '10 міс. тому', ru: '10 мес. назад', es: 'hace 10 meses', en: '10 months ago' },
    text: 'Мариночка, благодарю за чудесный массаж, я море удовольствия получила. Люблю профессионалов своего дела: красота, уют, комфорт и сервис на высшем уровне.' },
  { name: 'Наталя К.', lang: 'UA', ago: { uk: '7 міс. тому', ru: '7 мес. назад', es: 'hace 7 meses', en: '7 months ago' },
    text: 'Неймовірний масаж! Після сеансу відчуття повного перезавантаження — ніби заново народилась. Знялась напруга в спині, тіло стало легким, а голова — ясною.' },
  { name: 'Lesya C.', lang: 'EN', ago: { uk: '6 міс. тому', ru: '6 мес. назад', es: 'hace 6 meses', en: '6 months ago' },
    text: 'There’s something truly special about their touch. I left the studio feeling completely renewed and relaxed. Thank you so much!' },
  { name: 'Dmitry Z.', lang: 'UA', ago: { uk: '10 міс. тому', ru: '10 мес. назад', es: 'hace 10 meses', en: '10 months ago' },
    text: 'Спробував масаж в чотири руки, і це був дійсно вражаючий досвід. Окрім масажу дуже сподобалась атмосфера і підхід до клієнта.' },
  { name: 'Antonina G.', lang: 'ES', ago: { uk: '10 міс. тому', ru: '10 мес. назад', es: 'hace 10 meses', en: '10 months ago' },
    text: 'Una experiencia muy especial, unos especialistas de los grandes. Hacía tiempo que buscaba algo especial, con mucha experiencia e interés.' },
  { name: 'Алла Р.', lang: 'UA', ago: { uk: '10 міс. тому', ru: '10 мес. назад', es: 'hace 10 meses', en: '10 months ago' },
    text: 'Була на масажі обличчя і декольте. Відчуття якоїсь паралельної реальності поза часом, повний релакс. Дуже приємна атмосфера і дуже делікатна майстер Марина.' },
  { name: 'Lara B.', lang: 'UA', ago: { uk: '10 міс. тому', ru: '10 мес. назад', es: 'hace 10 meses', en: '10 months ago' },
    text: 'В мене фізична праця, і навантаження йде саме на спину. Після Марининих чудових рук на ранок прокинулася, мов нова, і вже два дні після масажу не відчуваю втоми, як раніше.' },
  { name: 'Vera A.', lang: 'RU', ago: { uk: '2 міс. тому', ru: '2 мес. назад', es: 'hace 2 meses', en: '2 months ago' },
    text: 'Была на массаже у Марины, очень понравился массаж, обстановка и уютный кабинет. Марина очень дружелюбная и приятная женщина. Рекомендую!' },
  { name: 'Alina Z.', lang: 'UA', ago: { uk: '10 міс. тому', ru: '10 мес. назад', es: 'hace 10 meses', en: '10 months ago' },
    text: 'Якщо хочеш розслабитися, підтягнути шкіру обличчя — вам до Марини. Якщо хочете корисного масажу — вам до Івана. Чудова робота масажистів!' },
  { name: 'Svetlana B.', lang: 'EN', ago: { uk: '9 міс. тому', ru: '9 мес. назад', es: 'hace 9 meses', en: '9 months ago' },
    text: 'Excellent massage! Very relaxing and restorative. Really enjoyed it, highly recommend!' },
  { name: 'Vero K.', lang: 'RU', ago: { uk: '4 міс. тому', ru: '4 мес. назад', es: 'hace 4 meses', en: '4 months ago' },
    text: 'Отличный массаж и расслабляющая атмосфера, спасибо вам огромное!' },
];

// Photo annotations for the "where does it hurt" map (percent of the image box).
export const zones = [
  { id: 'head', img: 'face', dot: { x: 50, y: 36 }, service: 'face', masters: 'marina' },
  { id: 'neck', img: 'marina-back', dot: { x: 77, y: 70 }, service: 'neck', masters: 'both' },
  { id: 'shoulders', img: 'hands-back', dot: { x: 40, y: 72 }, service: 'deep', masters: 'ivan' },
  { id: 'lowback', img: 'back-oil', dot: { x: 55, y: 66 }, service: 'therapeutic', masters: 'ivan' },
  { id: 'legs', img: 'four-hands-feet', dot: { x: 33, y: 82 }, service: 'feet', masters: 'both' },
  { id: 'stress', img: 'four-hands-back', dot: { x: 63, y: 74 }, service: 'four', masters: 'both' },
];
