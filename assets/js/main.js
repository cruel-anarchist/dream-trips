document.addEventListener('DOMContentLoaded', () => {
  const mainBtns  = document.querySelectorAll('#main-filters .filter-item');
  const subBtns   = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const sections  = document.querySelectorAll('.category-section');
  const swipers   = {};

  // Определяем, какие группы показывать при каждом фильтре
  const groupMap = {
    all:    ['hike','raft','big'],
    allpvd: ['hike','raft'],
    hike:   ['hike'],
    raft:   ['raft'],
    big:    ['big']
  };

  async function loadCards() {
    // грузим шаблон карточки
    const tmplResp = await fetch('../events-cards.html');
    const tmplHtml = await tmplResp.text();
    const tmpDiv   = document.createElement('div');
    tmpDiv.innerHTML = tmplHtml;
    const template = tmpDiv.querySelector('#event-template');

    // грузим данные
    const dataResp = await fetch('../events.json');
    const events   = await dataResp.json();

    // очищаем каждый слайдер и вставляем карточки своей категории
    sections.forEach(sec => {
      const wr  = sec.querySelector('.swiper-wrapper');
      const grp = sec.dataset.group;
      wr.innerHTML = '';
      events.forEach(evt => {
        if (evt.type.includes(grp)) {
          const clone = template.content.cloneNode(true).querySelector('div');
          clone.classList.add('swiper-slide');
          clone.dataset.type = evt.type.join(' ');
          // img
          const img = clone.querySelector('img');
          img.src = evt.img;
          img.alt = evt.alt;
          // title & desc
          clone.querySelector('.trip-title').textContent = evt.title;
          clone.querySelector('.trip-desc').textContent  = evt.desc;
          // date
          const dateEl = clone.querySelector('.trip-date');
          if (evt.date) dateEl.innerHTML = evt.date;
          else dateEl.remove();
          // program
          const prog = clone.querySelector('.trip-program');
          if (Array.isArray(evt.program)) {
            evt.program.forEach(item => {
              const li = document.createElement('li');
              li.textContent = item;
              prog.appendChild(li);
            });
          } else prog.remove();
          // meta (km, level, price)
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

  function initSwipers() {
    sections.forEach(sec => {
      const grp = sec.dataset.group;
      const el  = sec.querySelector('.category-swiper');
      if (swipers[grp]) swipers[grp].destroy(true, true);
      swipers[grp] = new Swiper(el, {
        slidesPerView: 3,
        spaceBetween: 16,
        navigation: {
          prevEl: el.querySelector('.swiper-button-prev'),
          nextEl: el.querySelector('.swiper-button-next'),
        },
        pagination: {
          el: el.querySelector('.swiper-pagination'),
          clickable: true
        },
        breakpoints: {
          0:    { slidesPerView: 1, centeredSlides: true,  spaceBetween: 16 },
          640:  { slidesPerView: 2, centeredSlides: false, spaceBetween: 16 },
          1024: { slidesPerView: 3, centeredSlides: false, spaceBetween: 16 }
        }
      });
    });
  }

  function initFiltering() {
    // Применяет конкретный фильтр: показывает/скрывает секции
    function apply(filter) {
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
    }

    // Клик по кнопкам основного меню
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // подсветка
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // сброс подменю к «Все ПВД»
        if (btn.dataset.filter === 'pvd') {
          subBtns.forEach((b,i) => {
            b.classList.toggle('active', i === 0);
          });
          apply('allpvd');
        } else {
          subBtns.forEach(b => b.classList.remove('active'));
          apply(btn.dataset.filter);
        }
      });
    });

    // Клик по подменю ПВД
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // подсветка
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // держим ПВД в основном меню
        mainBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.filter === 'pvd');
        });
        apply(btn.dataset.filter);
      });
    });

    // стартовый показ
    mainBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    subBtns.forEach(b => b.classList.remove('active'));
    apply('all');
  }

  loadCards();
});
