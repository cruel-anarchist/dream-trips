document.addEventListener('DOMContentLoaded', () => {
  const mainBtns  = document.querySelectorAll('#main-filters .filter-item');
  const subBtns   = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const container = document.getElementById('cards-container');
  let swiper;

  async function loadCards() {
    // 1) Шаблон
    const tmplResp = await fetch('../events-cards.html');
    const tmplHtml = await tmplResp.text();
    const tmpDiv   = document.createElement('div');
    tmpDiv.innerHTML = tmplHtml;
    const template = tmpDiv.querySelector('#event-template');
    document.body.appendChild(template);

    // 2) Данные
    const dataResp = await fetch('../events.json');
    const events   = await dataResp.json();

    // 3) Рендер
    container.innerHTML = '';
    events.forEach(evt => {
      const clone = template.content.cloneNode(true);
      // вот здесь корневая карточка:
      const card = clone.querySelector('.trip-card');

      // дата (если есть)
      const dateEl = card.querySelector('.trip-date');
      if (evt.date) dateEl.innerHTML = evt.date;
      else dateEl.remove();

      // картинка
      const img = card.querySelector('img');
      img.src = evt.img;
      img.alt = evt.alt;

      // заголовок и описание
      card.querySelector('.trip-title').textContent = evt.title;
      card.querySelector('.trip-desc').textContent  = evt.desc;

      // программа
      const progEl = card.querySelector('.trip-program');
      if (Array.isArray(evt.program)) {
        evt.program.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          progEl.appendChild(li);
        });
      } else {
        progEl.remove();
      }

      // мета: км, уровень, цена
      const metaEl = card.querySelector('.trip-meta');
      const parts = [];
      if (evt.km)    parts.push(`Километраж: <b>${evt.km}</b>`);
      if (evt.level) parts.push(`Сложность: <b>${evt.level}</b>`);
      if (evt.price) parts.push(`Стоимость: <span class="trip-price">${evt.price}</span>`);
      if (parts.length) metaEl.innerHTML = parts.join('<br>');
      else metaEl.remove();

      // сохраняем теги для фильтрации
      card.dataset.type = evt.type.join(' ');

      // обязательно присваиваем swiper-slide,
      // без этого Swiper не увидит ваши слайды
      card.classList.add('swiper-slide');

      container.appendChild(card);
    });

    initFiltering();
    initSwiper();
  }

  function initSwiper() {
    if (swiper) swiper.destroy(true, true);
    swiper = new Swiper('.all-events-swiper', {
      slidesPerView: 3,
      spaceBetween: 16,
      watchSlidesVisibility: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        0:    { slidesPerView: 1 },
        640:  { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  }

  function initFiltering() {
    const cards = () => container.querySelectorAll('.trip-card');

    function showAll() {
      cards().forEach(c => c.style.display = '');
      // после показа всех карточек — сброс слайдера
      swiper.update();
      swiper.slideTo(0);
    }

    function filterCards(filter) {
      if (filter === 'all') return showAll();
      if (filter === 'pvd') filterCards('allpvd');
      else {
        cards().forEach(card => {
          const types = card.dataset.type.split(' ');
          card.style.display = types.includes(filter) ? '' : 'none';
        });
      }
      setTimeout(() => {
        swiper.update();
        swiper.slideTo(0);
      }, 0);
    }

    // навешиваем клики
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterCards(btn.dataset.filter);
      });
    });
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // держим «ПВД» в основном меню
        mainBtns.forEach(b => {
          if (b.dataset.filter === 'pvd') b.classList.add('active');
          else b.classList.remove('active');
        });
        filterCards(btn.dataset.filter);
      });
    });

    // стартовая загрузка — показать всё
    showAll();
  }

  loadCards();
});
