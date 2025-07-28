document.addEventListener('DOMContentLoaded', () => {
  const mainBtns  = document.querySelectorAll('#main-filters .filter-item');
  const subBtns   = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const sections  = document.querySelectorAll('.category-section');
  const swipers   = {};

  // Сопоставление фильтров группам
  const groupMap = {
    all:    ['hike','raft','big'],
    allpvd: ['hike','raft'],
    hike:   ['hike'],
    raft:   ['raft'],
    big:    ['big']
  };

  // Загрузка карточек и инициализация
  async function loadCards() {
    const tmplResp = await fetch('../events-cards.html');
    const tmplHtml = await tmplResp.text();
    const tmpDiv   = document.createElement('div');
    tmpDiv.innerHTML = tmplHtml;
    const template = tmpDiv.querySelector('#event-template');

    const dataResp = await fetch('../events.json');
    const events   = await dataResp.json();

    sections.forEach(sec => {
      const wr  = sec.querySelector('.swiper-wrapper');
      const grp = sec.dataset.group;
      wr.innerHTML = '';

      events.forEach(evt => {
        if (evt.type.includes(grp)) {
          const clone = template.content.cloneNode(true).querySelector('div');
          clone.classList.add('swiper-slide');

          // Заполнение данных карточки
          const img = clone.querySelector('img');
          img.src = evt.img;
          img.alt = evt.alt;
          // Заглушка если изображение не найдено
          img.onerror = () => { img.src = 'assets/img/placeholder.jpg'; };

          clone.querySelector('.trip-title').textContent = evt.title;
          clone.querySelector('.trip-desc').textContent  = evt.desc;
          const dateEl = clone.querySelector('.trip-date');
          if (evt.date) dateEl.textContent = evt.date;
          else dateEl.remove();

          const prog = clone.querySelector('.trip-program');
          if (Array.isArray(evt.program)) {
            evt.program.forEach(item => {
              const li = document.createElement('li');
              li.textContent = item;
              prog.appendChild(li);
            });
          } else prog.remove();

          const meta = clone.querySelector('.trip-meta');
          const parts = [];
          if (evt.km)    parts.push(`Километраж: <b>${evt.km}</b>`);
          if (evt.level) parts.push(`Сложность: <b>${evt.level}</b>`);
          if (evt.price) parts.push(`Стоимость: <span class="trip-price">${evt.price}</span>`);
          if (parts.length) meta.innerHTML = parts.join('<br>');
          else meta.remove();

          wr.appendChild(clone);
        }
      });
    });

    initSwipers();
    initFiltering();
  }

  // Инициализация Swiper v11
  function initSwipers() {
    sections.forEach(sec => {
      const grp = sec.dataset.group;
      const el  = sec.querySelector('.swiper');

      // Удаление старого экземпляра
      if (swipers[grp]) swipers[grp].destroy(true, true);

      // Создание нового
      swipers[grp] = new Swiper(el, {
        navigation: {
          prevEl: el.querySelector('.swiper-button-prev'),
          nextEl: el.querySelector('.swiper-button-next')
        },
        pagination: {
          el: el.querySelector('.swiper-pagination'),
          clickable: true
        },
        spaceBetween: 16,
        breakpoints: {
          0:    { slidesPerView: 1 },
          768:  { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        },
        observer: true,
        observeParents: true
      });
    });
  }

  // Настройка фильтров
  function initFiltering() {
    const applyFilter = filter => {
      const showGroups = groupMap[filter] || [];
      sections.forEach(sec => {
        const grp = sec.dataset.group;
        if (showGroups.includes(grp)) {
          sec.style.display = '';
          swipers[grp].update();
          swipers[grp].slideTo(0);
        } else {
          sec.style.display = 'none';
        }
      });
    };

    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.filter === 'pvd') {
          subBtns.forEach((b,i) => b.classList.toggle('active', i===0));
          applyFilter('allpvd');
        } else {
          subBtns.forEach(b => b.classList.remove('active'));
          applyFilter(btn.dataset.filter);
        }
      });
    });

    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mainBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'pvd'));
        applyFilter(btn.dataset.filter);
      });
    });

    // Стартовый фильтр
    mainBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    subBtns.forEach(b => b.classList.remove('active'));
    applyFilter('all');
  }

  loadCards();
});
