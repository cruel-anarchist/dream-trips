document.addEventListener('DOMContentLoaded', () => {
  // Селекторы кнопок фильтров и секций
  const mainBtns  = document.querySelectorAll('#main-filters .filter-item');
  const subBtns   = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const sections  = document.querySelectorAll('.category-section');
  const sliders   = {};

  // Определяем наборы групп для каждого фильтра
  const groupMap = {
    all:    ['hike', 'raft', 'big'],
    allpvd: ['hike', 'raft'],
    hike:   ['hike'],
    raft:   ['raft'],
    big:    ['big']
  };

  // Загрузка шаблона и данных, заполнение секций
  async function loadCards() {
    // Загружаем шаблон карточки
    const tmplResp = await fetch('../events-cards.html');
    const tmplHtml = await tmplResp.text();
    const tmpDiv   = document.createElement('div');
    tmpDiv.innerHTML = tmplHtml;
    const template = tmpDiv.querySelector('#event-template');

    // Загружаем JSON с событиями
    const dataResp = await fetch('../events.json');
    const events   = await dataResp.json();

    // Для каждой категории вставляем соответствующие карточки
    sections.forEach(sec => {
      const container = sec.querySelector('.category-swiper');
      container.innerHTML = '';  // очищаем прошлые слайды
      const grp = sec.dataset.group;

      events.forEach(evt => {
        if (evt.type.includes(grp)) {
          const slide = template.content.cloneNode(true).querySelector('div');
          slide.classList.add('keen-slider__slide');
          slide.dataset.type = evt.type.join(' ');

          // наполнение содержимого
          const img = slide.querySelector('img');
          img.src = evt.img;
          img.alt = evt.alt;
          slide.querySelector('.trip-title').textContent = evt.title;
          slide.querySelector('.trip-desc').textContent  = evt.desc;

          const dateEl = slide.querySelector('.trip-date');
          if (evt.date) dateEl.innerHTML = evt.date;
          else dateEl.remove();

          const prog = slide.querySelector('.trip-program');
          if (Array.isArray(evt.program)) {
            evt.program.forEach(item => {
              const li = document.createElement('li');
              li.textContent = item;
              prog.appendChild(li);
            });
          } else prog.remove();

          const meta = slide.querySelector('.trip-meta');
          const parts = [];
          if (evt.km)    parts.push(`Километраж: <b>${evt.km}</b>`);
          if (evt.level) parts.push(`Сложность: <b>${evt.level}</b>`);
          if (evt.price) parts.push(`Стоимость: <span class="trip-price">${evt.price}</span>`);
          if (parts.length) meta.innerHTML = parts.join('<br>');
          else meta.remove();

          container.appendChild(slide);
        }
      });
    });

    initSliders();
    initFiltering();
  }

  // Инициализация Keen Slider для каждой секции
  function initSliders() {
    sections.forEach(sec => {
      const grp = sec.dataset.group;
      const el  = sec.querySelector('.category-swiper');

      // если уже был — уничтожаем
      if (sliders[grp]) {
        sliders[grp].destroy();
      }

      // создаём новый
      const slider = new KeenSlider(el, {
        loop: false,
        spacing: 16,
        slides: {
          perView: 3,
          breakpoints: {
            '(max-width: 768px)': {
              perView: 1,
              spacing: 16
            },
            '(min-width: 769px) and (max-width: 1023px)': {
              perView: 2,
              spacing: 16
            },
            '(min-width: 1024px)': {
              perView: 3,
              spacing: 16
            }
          }
        }
      });

      // навигация стрелками из DOM
      const prev = sec.querySelector('.arrow-prev');
      const next = sec.querySelector('.arrow-next');
      prev.addEventListener('click', () => slider.prev());
      next.addEventListener('click', () => slider.next());

      sliders[grp] = slider;
    });
  }

  // Настройка фильтрации секций
  function initFiltering() {
    // Применение фильтра по ключу
    function apply(filter) {
      const showGroups = groupMap[filter] || [];
      sections.forEach(sec => {
        const grp = sec.dataset.group;
        if (showGroups.includes(grp)) {
          sec.style.display = '';
          // при показе сбрасываем на первый слайд
          sliders[grp].update();
          sliders[grp].moveToIdx(0);
        } else {
          sec.style.display = 'none';
        }
      });
    }

    // Клик по основным кнопкам
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.filter === 'pvd') {
          subBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
          apply('allpvd');
        } else {
          subBtns.forEach(b => b.classList.remove('active'));
          apply(btn.dataset.filter);
        }
      });
    });

    // Клик по подменю «ПВД»
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

    // стартовое состояние — «Все направления»
    mainBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    subBtns.forEach(b => b.classList.remove('active'));
    apply('all');
  }

  loadCards();
});
