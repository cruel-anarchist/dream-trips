document.addEventListener('DOMContentLoaded', () => {
  const mainBtns  = document.querySelectorAll('#main-filters .filter-item');
  const subBtns   = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const sections  = document.querySelectorAll('.category-section');
  const swipers   = {};

  // Какие группы показывать для каждого фильтра
  const groupMap = {
    all:    ['hike','raft','big'],
    allpvd: ['hike','raft'],
    hike:   ['hike'],
    raft:   ['raft'],
    big:    ['big']
  };

  async function loadCards() {
    // Шаблон карточек
    const tmplResp = await fetch('../events-cards.html');
    const tmplHtml = await tmplResp.text();
    const tmpDiv   = document.createElement('div');
    tmpDiv.innerHTML = tmplHtml;
    const template = tmpDiv.querySelector('#event-template');

    // Данные
    const dataResp = await fetch('../events.json');
    const events   = await dataResp.json();

    // Вставляем карточки в секции
    sections.forEach(sec => {
      const wr  = sec.querySelector('.swiper-wrapper');
      const grp = sec.dataset.group;
      wr.innerHTML = '';

      events.forEach(evt => {
        if (evt.type.includes(grp)) {
          const clone = template.content.cloneNode(true).querySelector('div');
          clone.classList.add('swiper-slide');
          clone.dataset.type = evt.type.join(' ');

          // Картинка
          const img = clone.querySelector('img');
          img.src = evt.img;
          img.alt = evt.alt;

          // Заголовок и описание
          clone.querySelector('.trip-title').textContent = evt.title;
          clone.querySelector('.trip-desc').textContent  = evt.desc;

          // Дата
          const dateEl = clone.querySelector('.trip-date');
          if (evt.date) dateEl.textContent = evt.date;
          else dateEl.remove();

          // Программа
          const prog = clone.querySelector('.trip-program');
          if (Array.isArray(evt.program)) {
            evt.program.forEach(item => {
              const li = document.createElement('li');
              li.textContent = item;
              prog.appendChild(li);
            });
          } else prog.remove();

          // Мета (км, сложность, цена)
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

      // Уничтожаем старый инстанс
      if (swipers[grp]) {
        swipers[grp].destroy(true, true);
      }

      // Создаём новый
      const swiper = swipers[grp] = new Swiper(el, {
        // Навигация
        navigation: {
          prevEl: el.querySelector('.swiper-button-prev'),
          nextEl: el.querySelector('.swiper-button-next'),
        },
        // Пагинация
        pagination: {
          el: el.querySelector('.swiper-pagination'),
          clickable: true,
        },
        // Отступы между слайдами
        spaceBetween: 16,
        // Точка отсчёта – 1 слайд
        slidesPerView: 1,
        // Брейкпоинты: до 767px – 1, 768–1023 – 2, от 1024 – 3
        breakpoints: {
          0:   { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024:{ slidesPerView: 3 },
        },
        // Авто‑обновление при изменении DOM
        observer: true,
        observeParents: true,
        // Захват тач‑событий именно на wrapper
        touchEventsTarget: 'wrapper',
      });

      // Пересчитываем после загрузки картинок
      swiper.on('imagesReady', () => {
        swiper.update();
      });
    });
  }

  function initFiltering() {
    // Показ/скрытие секций по фильтру
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

    // Клики по главным кнопкам
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.filter === 'pvd') {
          subBtns.forEach((b,i) => b.classList.toggle('active', i === 0));
          apply('allpvd');
        } else {
          subBtns.forEach(b => b.classList.remove('active'));
          apply(btn.dataset.filter);
        }
      });
    });

    // Клики по подменю ПВД
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        mainBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.filter === 'pvd');
        });
        apply(btn.dataset.filter);
      });
    });

    // Стартовый фильтр
    mainBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    subBtns.forEach(b => b.classList.remove('active'));
    apply('all');
  }

  // Запуск
  loadCards();
});
