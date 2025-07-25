// main.js
document.addEventListener('DOMContentLoaded', () => {
  const mainBtns   = document.querySelectorAll('#main-filters .filter-item');
  const subBtns    = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const sections   = document.querySelectorAll('.category-section');
  const wrappers   = {};  // контейнеры swiper-wrapper
  const swipers    = {};  // экземпляры Swiper
  const groupsMap  = {
    all:    ['hike','raft','big'],
    allpvd: ['hike','raft'],
    hike:   ['hike'],
    raft:   ['raft'],
    big:    ['big']
  };

  // Найти все обёртки для каждого group
  sections.forEach(sec => {
    const g = sec.dataset.group;
    wrappers[g] = sec.querySelector('.swiper-wrapper');
  });

  // Загрузка и распределение карточек
  async function loadCards() {
    const resp = await fetch('events-cards.html');
    const text = await resp.text();
    const doc  = new DOMParser().parseFromString(text, 'text/html');
    const cards = doc.querySelectorAll('.service-card, .trip-card');

    // очистить каждый wrapper
    Object.values(wrappers).forEach(w => w.innerHTML = '');

    // для каждой карточки клонируем в нужные группы
    cards.forEach(c => {
      const types = c.dataset.type.split(' ');
      Object.keys(wrappers).forEach(g => {
        if (types.includes(g)) {
          const clone = c.cloneNode(true);
          clone.classList.add('swiper-slide');
          wrappers[g].appendChild(clone);
        }
      });
    });

    initSwipers();
    applyFilter('all');
    initFiltering();
  }

  // Создать или пересоздать все три слайдера
  function initSwipers() {
    Object.keys(wrappers).forEach(g => {
      if (swipers[g]) swipers[g].destroy(true, true);
      const el = document.querySelector(`.category-swiper[data-group="${g}"]`);
      swipers[g] = new Swiper(el, {
        slidesPerView: 3,
        spaceBetween: 16,
        watchSlidesVisibility: true,
        navigation: {
          nextEl: el.querySelector('.swiper-button-next'),
          prevEl: el.querySelector('.swiper-button-prev'),
        },
        pagination: {
          el: el.querySelector('.swiper-pagination'),
          clickable: true,
        },
        breakpoints: {
          0:    { slidesPerView: 1 },
          640:  { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
      });
    });
  }

  // Фильтры: главные и подфильтры
  function initFiltering() {
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (f === 'pvd') {
          subBtns.forEach(b => b.classList.remove('active'));
          subBtns[0].classList.add('active');
          applyFilter('allpvd');
        } else {
          applyFilter(f);
        }
      });
    });
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mainBtns.forEach(b => b.dataset.filter === 'pvd'
          ? b.classList.add('active')
          : b.classList.remove('active')
        );
        applyFilter(f);
      });
    });
  }

  // Показать/скрыть нужные секции и сбросить слайдеры
  function applyFilter(filter) {
    const showGroups = groupsMap[filter] || [];
    sections.forEach(sec => {
      const g = sec.dataset.group;
      if (showGroups.includes(g)) {
        sec.style.display = 'block';
        swipers[g].update();
        swipers[g].slideTo(0);
      } else {
        sec.style.display = 'none';
      }
    });
  }

  loadCards();
});
