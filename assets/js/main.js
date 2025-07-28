document.addEventListener('DOMContentLoaded', () => {
  const mainBtns = document.querySelectorAll('#main-filters .filter-item');
  const subBtns  = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const sections = document.querySelectorAll('.category-section');
  const sliders  = {};

  const groupMap = {
    all:    ['hike','raft','big'],
    allpvd: ['hike','raft'],
    hike:   ['hike'],
    raft:   ['raft'],
    big:    ['big']
  };

  async function loadCards() {
    // загружаем шаблон
    const html = await (await fetch('../events-cards.html')).text();
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const template = tmp.querySelector('#event-template');

    // данные
    const events = await (await fetch('../events.json')).json();

    // наполняем секции
    sections.forEach(sec => {
      const container = sec.querySelector('.category-swiper');
      container.innerHTML = '';
      const grp = sec.dataset.group;

      events.forEach(evt => {
        if (!evt.type.includes(grp)) return;
        // клонируем
        const slide = template.content.cloneNode(true).querySelector('div');
        slide.classList.add('tns-item');
        slide.dataset.type = evt.type.join(' ');

        // наполняем содержимое карточки
        const img = slide.querySelector('img');
        img.src = evt.img; img.alt = evt.alt;
        slide.querySelector('.trip-title').textContent = evt.title;
        slide.querySelector('.trip-desc').textContent  = evt.desc;

        const dateEl = slide.querySelector('.trip-date');
        evt.date ? dateEl.innerHTML = evt.date : dateEl.remove();

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
        parts.length ? meta.innerHTML = parts.join('<br>') : meta.remove();

        container.appendChild(slide);
      });
    });

    initSliders();
    initFiltering();
  }

  function initSliders() {
    sections.forEach(sec => {
      const grp = sec.dataset.group;
      const selector = `#slider-${grp}`;
      // удаляем старый, если есть
      if (sliders[grp]) sliders[grp].destroy();

      sliders[grp] = tns({
        container: selector,
        items: 3,
        gutter: 16,
        edgePadding: 16,
        nav: false,
        controls: true,
        controlsText: ['‹','›'],
        responsive: {
          0:    { items: 1, gutter: 16, edgePadding: 16 },
          768:  { items: 3, gutter: 16, edgePadding: 0 }
        }
      });
    });
  }

  function initFiltering() {
    const apply = filter => {
      const show = groupMap[filter] || [];
      sections.forEach(sec => {
        const grp = sec.dataset.group;
        if (show.includes(grp)) {
          sec.style.display = '';
          sliders[grp].refresh();
          sliders[grp].goTo(0);
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
          apply('allpvd');
        } else {
          subBtns.forEach(b=>b.classList.remove('active'));
          apply(btn.dataset.filter);
        }
      });
    });

    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        mainBtns.forEach(b => b.classList.toggle('active', b.dataset.filter==='pvd'));
        apply(btn.dataset.filter);
      });
    });

    // стартовое
    mainBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    subBtns.forEach(b=>b.classList.remove('active'));
    apply('all');
  }

  loadCards();
});
