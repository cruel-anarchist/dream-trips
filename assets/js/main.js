document.addEventListener('DOMContentLoaded', () => {
  // Селекторы кнопок фильтров и секций
  const mainBtns = document.querySelectorAll('#main-filters .filter-item');
  const subBtns  = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const sections = document.querySelectorAll('.category-section');

  // Наборы групп для каждого фильтра
  const groupMap = {
    all:    ['hike', 'raft', 'big'],
    allpvd: ['hike', 'raft'],
    hike:   ['hike'],
    raft:   ['raft'],
    big:    ['big']
  };

  // Загрузка шаблона и данных, заполнение секций
  async function loadCards() {
    // Шаблон карточки
    const tmplResp  = await fetch('../events-cards.html');
    const tmplHtml  = await tmplResp.text();
    const tmpDiv    = document.createElement('div');
    tmpDiv.innerHTML = tmplHtml;
    const template  = tmpDiv.querySelector('#event-template');

    // Данные из JSON
    const dataResp = await fetch('../events.json');
    const events   = await dataResp.json();

    // Заполняем каждую секцию
    sections.forEach(sec => {
      const container = sec.querySelector('.category-swiper');
      container.innerHTML = '';  // очищаем
      const grp = sec.dataset.group;

      events.forEach(evt => {
        if (evt.type.includes(grp)) {
          // Клонируем шаблон и наполняем данные
          const slide = template.content.cloneNode(true).querySelector('div');
          slide.classList.add('keen-slider__slide');
          slide.dataset.type = evt.type.join(' ');

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

    initFiltering();
  }

  // Настройка фильтрации секций
  function initFiltering() {
    function apply(filter) {
      const showGroups = groupMap[filter] || [];
      sections.forEach(sec => {
        const grp = sec.dataset.group;
        if (showGroups.includes(grp)) {
          sec.style.display = '';
          // при показе заново пересобрать и сбросить в начало
          const keen = sec.querySelector('.category-swiper').keen;
          keen.update();
          keen.moveToIdx(0);
        } else {
          sec.style.display = 'none';
        }
      });
    }

    // Основные кнопки
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.filter === 'pvd') {
          subBtns.forEach((b,i) => b.classList.toggle('active', i===0));
          apply('allpvd');
        } else {
          subBtns.forEach(b => b.classList.remove('active'));
          apply(btn.dataset.filter);
        }
      });
    });

    // Подменю ПВД
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mainBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.filter==='pvd');
        });
        apply(btn.dataset.filter);
      });
    });

    // Стартовое состояние
    mainBtns.forEach(b=>b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    subBtns.forEach(b=>b.classList.remove('active'));
    apply('all');
  }

  loadCards();
});
