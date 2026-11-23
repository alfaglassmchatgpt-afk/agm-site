const shelves = window.AGMCatalogProduct?.items || [
  {
    id: 'clear', name: 'Обычное прозрачное', heading: 'Прозрачная. Для шкафа.',
    description: 'Привычное прозрачное стекло с лёгким зеленоватым оттенком кромки. Открывает обзор содержимого и сочетается с деревянной мебелью.',
    shape: 'Прямоугольная', edge: 'Полированная', use: 'В шкаф, витрину, стеллаж',
    caption: 'Прямая полка для установки на мебельные полкодержатели.',
    interior: 'Прозрачные полки в деревянном шкафу.'
  },
  {
    id: 'ultra', name: 'Осветлённое', heading: 'Осветлённая. Для ванной.',
    description: 'Нейтральный оттенок помогает сохранить цвет светлой отделки. Скруглённые углы делают форму мягче и удобны для открытого расположения.',
    shape: 'Прямоугольная со скруглениями', edge: 'Полированная', use: 'Под зеркало, в ванную',
    caption: 'Осветлённое стекло с закруглёнными углами.',
    interior: 'Небольшая полка для косметики под зеркалом.'
  },
  {
    id: 'bronze', name: 'Бронза', heading: 'Бронзовая. В угол душевой.',
    description: 'Тёплый оттенок поддерживает камень и бежевую плитку. Угловая форма использует свободное пространство для небольших принадлежностей.',
    shape: 'Угловая, с дуговым краем', edge: 'Полированная', use: 'В душевую, в угол ванной',
    caption: 'Четверть круга из прозрачного бронзового стекла.',
    interior: 'Бронзовая полка на креплениях к двум стенам.'
  },
  {
    id: 'grey', name: 'Серое', heading: 'Серая. Для ниши.',
    description: 'Дымчатое стекло добавляет глубину спокойному интерьеру. Форму можно подстроить под геометрию ниши или изготовить по вашему шаблону.',
    shape: 'Трапеция по шаблону', edge: 'Полированная', use: 'В нишу, открытый стеллаж',
    caption: 'Трапециевидная полка из серого стекла.',
    interior: 'Полка в нише со спокойной серой отделкой.'
  },
  {
    id: 'black', name: 'Чёрное', heading: 'Тёмная. Для прихожей.',
    description: 'Насыщенный тёмный оттенок создаёт выразительный акцент на светлой стене. Полукруглая форма подходит для компактного места под ключи и мелочи.',
    shape: 'Полукруглая', edge: 'Полированная', use: 'На стену в прихожей',
    caption: 'Полукруг из тёмного тонированного стекла.',
    interior: 'Небольшая настенная полка у входа.'
  },
  {
    id: 'satin', name: 'Матовое', heading: 'Матовая. Для открытого хранения.',
    description: 'Сатинированная поверхность рассеивает свет и смягчает вид предметов сквозь стекло. Подходит для светлых ниш и ванной комнаты.',
    shape: 'Прямая со скруглёнными передними углами', edge: 'Полированная', use: 'В ванную, мебельную нишу',
    caption: 'Светлое матовое стекло с обработанными краями.',
    interior: 'Матовая полка в светлой ванной нише.'
  }
];
const nav = document.querySelector('#materials');
const list = document.querySelector('#shelves');
shelves.forEach((item, index) => {
  const link = document.createElement('a');
  link.href = '#' + item.id;
  link.textContent = item.name;
  nav.append(link);
  const article = document.createElement('article');
  article.className = 'shelf';
  article.id = item.id;
  const specimen = makeFigure(item.caption, 0, index, item.preview);
  const application = makeFigure(item.interior, 100, index, item.applicationPreview || item.preview);
  application.className = 'application';
  if (window.AGMCatalogProduct?.kind === 'mirror') {
    const frameLink = document.createElement('a');
    frameLink.className = 'mirror-frame-link';
    frameLink.href = 'https://alfaglass.ru/aluminium/zerkala/';
    frameLink.textContent = 'Нужно зеркало в раме?';
    application.querySelector('figcaption').append(frameLink);
  }
  const copy = document.createElement('section');
  copy.className = 'copy';
  const heading = document.createElement('h2');
  heading.textContent = item.heading;
  const description = document.createElement('p');
  description.textContent = item.description;
  const specs = document.createElement('dl');
  const characteristics = [
    ['Толщина', 'Загружается из каталога'],
    ['Мин. партия', window.AGMCatalogProduct ? 'От 1 штуки' : 'От 3 штук'],
    ['Кромка', 'Полированная — по умолчанию'],
    ['Мин. размер', window.AGMCatalogProduct ? (item.preset.shape==='circle'?'Ø 300 мм':(item.preset.shape==='rectangle'?'300 × 300 мм':item.preset.shape==='arch'?'400 × 800 мм':'500 × 800 мм')) : '180 × 400 мм'],
    [window.AGMCatalogProduct ? 'Круглое зеркало' : 'Круглая полка', window.AGMCatalogProduct ? 'Минимальный диаметр — 300 мм' : 'Минимальный диаметр — 300 мм'],
    ['Отверстия и тех. вырезы', 'По запросу'],
    ['Форма на фото', item.shape],
    ['Применение', item.use]
  ];
  characteristics.forEach(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value;
    row.append(term, detail);
    specs.append(row);
  });
  const shapeNote = document.createElement('p');
  shapeNote.className = 'shape-note';
  shapeNote.textContent = (window.AGMCatalogProduct ? 'Форма условная. Изготовим зеркало по вашим размерам. Оттенок и рисунок согласуем по образцу.' : 'Форма на изображении условная. Изготовим полку другой формы по вашему эскизу.');
  copy.append(heading, description, specs, shapeNote);
  article.append(specimen, copy, application);
  list.append(article);
});
function makeFigure(caption, x, row, preview) {
  const figure = document.createElement('figure');
  const scene = document.createElement(preview?.standalone?'img':'div');
  scene.className = 'scene';
  scene.style.backgroundPosition = x + '% ' + row * 20 + '%';
  if(preview?.standalone){scene.src=preview.url;scene.alt=caption;scene.loading='lazy';scene.className='scene standalone-scene';}
  else if(preview){scene.style.backgroundImage=`url(${preview.url})`;scene.style.backgroundSize=preview.size;scene.style.backgroundPosition=x+'% '+preview.position.split(' ')[1];}
  scene.setAttribute('role', 'img');
  scene.setAttribute('aria-label', caption);
  const label = document.createElement('figcaption');
  label.textContent = caption;
  figure.append(scene, label);
  return figure;
}
