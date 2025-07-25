// main.js
document.addEventListener('DOMContentLoaded', () => {
  const mainBtns       = document.querySelectorAll('#main-filters .filter-item');
  const subBtns        = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const cardsContainer = document.getElementById('cards-container');
  let allEventsSwiper;

  // 1) Загрузить карточки
  async function loadCards() {
    const resp = await fetch('events-cards.html');
    const html = await resp.text();
    cardsContainer.innerHTML = html;

    // Добавляем всем карточкам класс swiper-slide
    cardsContainer
      .querySelectorAll('.service-card, .trip-card')
      .forEach(card => card.classList.add('swiper-slide'));

    initFiltering();
    initSwiper();
  }

  // 2) Инициализация Swiper
  function initSwiper() {
    if (allEventsSwiper) {
      allEventsSwiper.destroy(true, true);
    }
    allEventsSwiper = new Swiper('.all-events-swiper', {
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

  // 3) Настроить фильтрацию
  function initFiltering() {
    const cards = document.querySelectorAll('#cards-container .service-card, #cards-container .trip-card');

    function showAll() {
      cards.forEach(c => c.style.display = '');
    }

    function filterCards(filter) {
      if (filter === 'all') {
        showAll();
      } else {
        cards.forEach(card => {
          const types = card.dataset.type.split(' ');
          card.style.display = types.includes(filter) ? '' : 'none';
        });
      }
      // Обновляем слайдер и сбрасываем к началу
      setTimeout(() => {
        allEventsSwiper.update();
        allEventsSwiper.slideTo(0);
      }, 0);
    }

    // Главные фильтры
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (f === 'pvd') {
          subBtns.forEach(b => b.classList.remove('active'));
          subBtns[0].classList.add('active');
          filterCards('allpvd');
        } else {
          filterCards(f);
        }
      });
    });

    // Подфильтры
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset-filter || btn.dataset.filter;
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        mainBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'pvd'));
        filterCards(f);
      });
    });

    // стартовое состояние — показать всё
    showAll();
  }

  loadCards();
});
