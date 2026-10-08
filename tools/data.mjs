// Facts shared by every language: contacts, services, prices, reviews.
// PRICES: put a number in EUR instead of null (e.g. price: 70) and run `node tools/build.mjs`.
// The site then shows the price next to the service and in the booking summary.

export const site = {
  url: 'https://ivanmarinalevant.vercel.app', // production URL (canonical, hreflang, OG)
  instagram: 'https://www.instagram.com/ivan.marina.levant/',
  instagramHandle: '@ivan.marina.levant',
  phones: {
    ivan: { display: '+34 613 728 778', wa: '34613728778', tel: '+34613728778' },
    marina: { display: '+34 613 296 874', wa: '34613296874', tel: '+34613296874' },
  },
  address: 'Carrer de Molina de Segura, 2, L’Olivereta, 46018 València',
  street: 'Carrer de Molina de Segura, 2',
  postal: '46018',
  metro: 'Av. del Cid',
  maps: 'https://www.google.com/maps/search/?api=1&query=Levant+Massage+by+Marina+%26+Ivan+Carrer+de+Molina+de+Segura+2+Valencia',
  mapsEmbed: 'https://www.google.com/maps?q=Carrer+de+Molina+de+Segura+2,+46018+Val%C3%A8ncia&output=embed',
  reviewsUrl: 'https://www.google.com/maps/search/?api=1&query=Levant+Massage+by+Marina+%26+Ivan+Valencia',
  geo: { lat: 39.4698, lng: -0.3986 },
  hours: { open: '10:00', close: '20:00' }, // every day
  rating: { value: '5,0', valueDot: '5.0', count: 22 },
};

// masters: who can do it ('both' = the four-hands duo). durations in minutes (approximate, to confirm).
export const services = [
  { id: 'four', masters: ['both'], durations: [90], price: null, signature: true },
  { id: 'therapeutic', masters: ['ivan', 'marina'], durations: [60, 90], price: null },
  { id: 'deep', masters: ['ivan'], durations: [60, 90], price: null },
  { id: 'face', masters: ['marina'], durations: [60], price: null },
  { id: 'neck', masters: ['ivan', 'marina'], durations: [40], price: null },
  { id: 'yoga', masters: ['ivan'], durations: [60, 90], price: null },
  { id: 'feet', masters: ['ivan', 'marina'], durations: [45], price: null },
  { id: 'manual', masters: ['ivan'], durations: [60], price: null },
  { id: 'consult', masters: ['ivan', 'marina'], durations: [20], price: 0 },
];

// Where it hurts: photo, who leads, which service to preselect.
export const zones = [
  { id: 'neck', img: 'ivan-back', service: 'neck', master: 'any' },
  { id: 'lowback', img: 'back-oil', service: 'therapeutic', master: 'ivan' },
  { id: 'head', img: 'face', service: 'face', master: 'marina' },
  { id: 'shoulders', img: 'tattoo-hands', service: 'deep', master: 'ivan' },
  { id: 'legs', img: 'four-hands-feet', service: 'feet', master: 'any' },
  { id: 'stress', img: 'four-hands-back', service: 'four', master: 'both' },
];

// Real Google reviews, in the language they were written in.
export const reviews = [
  { name: 'Daria S.', lang: 'ru', ago: 3,
    text: 'Огромное спасибо Марине и Ивану! Они буквально спасли меня от сильной боли в плече и руке. Из-за защемления боль отдавала даже в сердце. После проведённого массажа уже на следующий день…' },
  { name: 'Аріна Г.', lang: 'uk', ago: 9,
    text: '…Ти не можеш ментально слідкувати за двома людьми, тому розслабляєшся все одно. Це дуже командна і якісна робота! У Марини дуже ніжні руки, у Івана мужні й сильні, відчувається досвід.' },
  { name: 'Liz P.', lang: 'es', ago: 5,
    text: 'Para mí fue una suerte conocer a Ivan y Marina. De sus sesiones salgo totalmente renovada. Se nota la mejoría desde el primer día. 100% recomendable.' },
  { name: 'Hollow', lang: 'en', ago: 6,
    text: 'They really helped me with neck pain, so I can sleep much better now. I’m extremely grateful and highly recommend them.' },
  { name: 'Lara B.', lang: 'uk', ago: 10,
    text: 'В мене фізична праця, і навантаження йде саме на спину. Після Марининих чудових рук на ранок прокинулася, мов нова, і вже два дні не відчуваю втоми, як раніше.' },
  { name: 'Наталя Б.', lang: 'uk', ago: 11,
    text: 'В захваті від масажу в чотири руки. Я ніби розчинилася на кушетці. Все продумано до дрібниць: рушничок, музика, аромат, засоби особистої гігієни.' },
  { name: 'Lesya C.', lang: 'en', ago: 6,
    text: 'There’s something truly special about their touch. I left the studio feeling completely renewed and relaxed. Thank you so much!' },
  { name: 'Регина П.', lang: 'ru', ago: 10,
    text: 'Мариночка, благодарю за чудесный массаж. Люблю профессионалов своего дела: красота, уют, комфорт и сервис на высшем уровне.' },
  { name: 'Наталя К.', lang: 'uk', ago: 7,
    text: 'Після сеансу відчуття повного перезавантаження. Знялась напруга в спині, тіло стало легким, а голова ясною.' },
  { name: 'Antonina G.', lang: 'es', ago: 10,
    text: 'Una experiencia muy especial, unos especialistas de los grandes. Hacía tiempo que buscaba algo especial, con mucha experiencia e interés.' },
  { name: 'Dmitry Z.', lang: 'uk', ago: 10,
    text: 'Спробував масаж в чотири руки, і це був дійсно вражаючий досвід. Окрім масажу дуже сподобалась атмосфера і підхід до клієнта.' },
  { name: 'Алла Р.', lang: 'uk', ago: 10,
    text: 'Була на масажі обличчя і декольте. Відчуття паралельної реальності поза часом, повний релакс. Дуже делікатна майстер Марина.' },
  { name: 'Vera A.', lang: 'ru', ago: 2,
    text: 'Была на массаже у Марины, очень понравился массаж, обстановка и уютный кабинет. Марина очень дружелюбная и приятная женщина. Рекомендую!' },
  { name: 'Alina Z.', lang: 'uk', ago: 10,
    text: 'Якщо хочеш розслабитися і підтягнути шкіру обличчя, вам до Марини. Якщо хочете корисного масажу, вам до Івана. Чудова робота масажистів!' },
  { name: 'Svetlana B.', lang: 'en', ago: 9,
    text: 'Excellent massage! Very relaxing and restorative. Really enjoyed it, highly recommend!' },
  { name: 'Vero K.', lang: 'ru', ago: 4,
    text: 'Отличный массаж и расслабляющая атмосфера, спасибо вам огромное!' },
];
