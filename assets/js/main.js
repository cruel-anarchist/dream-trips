document.addEventListener('DOMContentLoaded', () => {
  const mainBtns       = document.querySelectorAll('#main-filters .filter-item');
  const subBtns        = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const container      = document.getElementById('cards-container');
  const template       = document.getElementById('event-template').content.firstElementChild;
  let swiper;

  // 1) Загрузить данные и отрисовать карточки
  async function loadCards() {
    const resp = await fetch('events.json');
    const data = await resp.json();

    container.innerHTML = '';  // очистить

    data.forEach(evt => {
      const card = template.cloneNode(true);

      // дата
      const dateEl = card.querySelector('.trip-date');
      if (evt.date) {
        dateEl.innerHTML = evt.date;
      } else {
        dateEl.remove();
      }

      // изображение
      const img = card.querySelector('img');
      img.src = evt.img;
      img.alt = evt.alt;

      // title / desc
      card.querySelector('.trip-title').textContent = evt.title;
      card.querySelector('.trip-desc').textContent  = evt.desc;

      // программа
      const progEl = card.querySelector('.trip-program');
      if (evt.program) {
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
      if (parts.length) {
        metaEl.innerHTML = parts.join('<br>');
      } else {
        metaEl.remove();
      }

      // теги
      card.dataset.type = evt.type.join(' ');

      // добавляем в DOM
      container.appendChild(card);
    });

    initFiltering();
    initSwiper();
  }

  // 2) Инициализация Swiper
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

  // 3) Фильтрация
  function initFiltering() {
    const cards = () => container.querySelectorAll('.trip-card');

    function showAll() {
      cards().forEach(c => c.style.display = '');
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
        mainBtns.forEach(b =>
          b.dataset.filter === 'pvd'
            ? b.classList.add('active')
            : b.classList.remove('active')
        );
        filterCards(btn.dataset.filter);
      });
    });
  }

  loadCards();
});
