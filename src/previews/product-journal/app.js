const pages = [
  {tab:'Полки',title:'Лёгкость, которая держит вещи',kicker:'Стеклянные полки на заказ',image:0,label:'Полки в шкафу',caption:'Прозрачные полки сохраняют свет и открывают вид на любимые вещи.',
    intro:'Ещё одна полка в шкаф, место для косметики в ванной или небольшая полка в душевой. Подберите стекло и форму под пространство, которое у вас уже есть.',
    uses:'Шкафы и витрины, ванная комната, душевая, открытые ниши.',
    supply:'Отдельная полка или комплект по вашим размерам. Отверстия и вырезы — по схеме крепления.',
    specs:[['Материал','Прозрачное, осветлённое, матовое или тонированное стекло'],['Форма','Прямоугольная, угловая, фигурная'],['Кромка','Обработка открытых краёв; толщина и опоры — по нагрузке']],
    link:'https://alfaglass.ru/materialy/'},
  {tab:'Зеркала',title:'Больше света. Больше пространства.',kicker:'Зеркала по размеру',image:1,label:'Зеркало в прихожей',caption:'Обычное зеркало в полный рост с аккуратной открытой кромкой.',
    intro:'Зеркало под размер стены, тумбы или ниши. Лаконичная форма впишется в домашний интерьер, а несколько полотен помогут оформить зеркальную стену студии.',
    uses:'Прихожая, ванная, гардеробная, балетная студия и домашний зал.',
    supply:'Одно полотно или комплект для зеркальной стены. Крепление и разбивку на полотна согласуем по месту.',
    specs:[['Материал','Обычное или осветлённое зеркало'],['Размер','Индивидуальный, по замеру или эскизу'],['Обработка','Полированная кромка, фацет, отверстия по проекту']],
    link:'https://alfaglass.ru/materialy/zerkalo-serebro/'},
  {tab:'Столешницы',title:'Стекло на вашей мебели',kicker:'Столешницы и защитные накладки',image:2,label:'Стеклянная столешница',caption:'Прозрачная поверхность подчёркивает форму основания стола.',
    intro:'Столешница для нового стола или накладка на любимый комод. Стекло помогает сохранить вид мебели и подобрать нужный оттенок поверхности.',
    uses:'Обеденный и журнальный стол, тумба, комод, рабочая поверхность ресепшн.',
    supply:'Готовая деталь по размеру или шаблону. Вырезы, скругления и отверстия согласуем с конструкцией основания.',
    specs:[['Материал','Прозрачное, осветлённое, тонированное; другие исполнения — по проекту'],['Форма','Прямоугольная, круглая или по вашему шаблону'],['Толщина','Подбирается по опорам, размеру и назначению']],
    link:'https://alfaglass.ru/materialy/'},
  {tab:'Зеркальная плитка',title:'Отражения складываются в рисунок',kicker:'Зеркальная плитка с фацетом',image:3,label:'Панно из зеркальных элементов',caption:'Бронзовые отражения и небольшие грани создают тёплый акцент на стене.',
    intro:'Соберите собственное панно из зеркальных элементов. Оттенок, пропорции и раскладка задают характер всей композиции.',
    uses:'Стена над консолью, ниша, декоративное панно, мебельные вставки.',
    supply:'Комплект одинаковых элементов или набор по согласованной раскладке. Визуализация показывает идею применения.',
    specs:[['Пример формата','500 × 100 мм'],['Фацет','Ширина 5 мм; исполнение согласуется'],['Оттенки','Серебро, бронза, серое, золотое, розовое, радужное — по каталогу']],
    link:'https://alfaglass.ru/materialy/tonirovannye-zerkala/'},
  {tab:'УФ-склейка',title:'В центре внимания — ваш предмет',kicker:'Колпаки, витрины и подставки',image:4,label:'Стеклянный демонстрационный колпак',caption:'Прозрачный колпак даёт рассмотреть предмет с разных сторон.',
    intro:'Коллекционная модель, украшения или предмет дизайна получают своё место. Соединённые стеклянные детали образуют лаконичную прозрачную конструкцию.',
    uses:'Домашние коллекции, торговые витрины, выставки и презентация изделий.',
    supply:'Склеенное изделие по согласованному эскизу. Основание, доступ внутрь и комплектность указываются в заявке.',
    specs:[['Материал','Прозрачное или осветлённое стекло'],['Соединение','УФ-склейка подготовленных деталей'],['Размеры','Габариты и толщина согласуются по конструкции']],
    link:'https://alfaglass.ru/materialy/'}
];
let current = 0;
const book = document.querySelector('#book');
const contents = document.querySelector('#contents');
pages.forEach((page,index) => {
  const button = document.createElement('button');
  button.textContent = page.tab;
  button.addEventListener('click', () => showPage(index));
  contents.append(button);
});
function showPage(index, animate = true) {
  if(index < 0 || index >= pages.length) return;
  const backwards = index < current;
  current = index;
  const page = pages[index];
  for(const field of ['title','kicker','intro','uses','supply','caption']) {
    document.getElementById(field).textContent = page[field];
  }
  document.querySelector('#imageLabel').textContent = page.label;
  const photo = document.querySelector('#photo');
  photo.style.backgroundPosition = `${(page.image % 3) * 50}% ${Math.floor(page.image / 3) * 100}%`;
  photo.setAttribute('aria-label',page.label);
  document.querySelector('#specs').replaceChildren(...page.specs.map(([label,value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value;
    row.append(term,detail);
    return row;
  }));
  document.querySelector('#cta').href = page.link;
  document.querySelector('#leftNumber').textContent = String(index*2+1).padStart(2,'0');
  document.querySelector('#rightNumber').textContent = String(index*2+2).padStart(2,'0');
  document.querySelector('#status').textContent = `Разворот ${index+1} из ${pages.length}`;
  document.querySelector('#prev').disabled = index === 0;
  document.querySelector('#next').disabled = index === pages.length-1;
  [...contents.children].forEach((button,i) => button.setAttribute('aria-current',String(i===index)));
  book.classList.remove('turn-prev','turn-next');
  if(animate) {
    void book.offsetWidth;
    book.classList.add(backwards ? 'turn-prev' : 'turn-next');
  }
}
document.querySelector('#prev').addEventListener('click',()=>showPage(current-1));
document.querySelector('#next').addEventListener('click',()=>showPage(current+1));
document.addEventListener('keydown',event=>{
  if(event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if(event.key==='ArrowRight') { event.preventDefault(); showPage(current+1); }
  if(event.key==='ArrowLeft') { event.preventDefault(); showPage(current-1); }
});
let touchStart;
book.addEventListener('touchstart',event=>{
  touchStart = {x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};
},{passive:true});
book.addEventListener('touchend',event=>{
  if(!touchStart) return;
  const dx = event.changedTouches[0].clientX-touchStart.x;
  const dy = event.changedTouches[0].clientY-touchStart.y;
  if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.5) showPage(current+(dx<0?1:-1));
  touchStart = null;
},{passive:true});
showPage(0,false);
