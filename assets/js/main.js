document.addEventListener('DOMContentLoaded', () => {
  const mainBtns = document.querySelectorAll('#main-filters .filter-item');
  const subBtns  = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const sections = document.querySelectorAll('.category-section');
  const swipers  = {};

  const groupMap = {
    all:    ['hike','raft','big'],
    allpvd: ['hike','raft'],
    hike:   ['hike'],
    raft:   ['raft'],
    big:    ['big']
  };

  async function loadCards() {
    const tmplResp = await fetch('../events-cards.html');
    const tmplHtml = await tmplResp.text();
    const tmpDiv   = document.createElement('div');
    tmpDiv.innerHTML = tmplHtml;
    const template = tmpDiv.querySelector('#event-template');

    const dataResp = await fetch('../events.json');
    const events   = await dataResp.json();

    // Для каждой группы очищаем слайды
    sections.forEach(sec => {
      const wr = sec.querySelector('.swiper-wrapper');
      wr.innerHTML = '';
      const grp = sec.dataset.group;
      // добавляем события этой группы
      events.forEach(evt => {
        if (evt.type.includes(grp)) {
          const clone = template.content.cloneNode(true).querySelector('div');
          clone.classList.add('swiper-slide');
          clone.dataset.type = evt.type.join(' ');
          // заполнить clone как ранее (img, title, desc, program, meta)
          const img = clone.querySelector('img'); img.src = evt.img; img.alt = evt.alt;
          clone.querySelector('.trip-title').textContent = evt.title;
          clone.querySelector('.trip-desc').textContent = evt.desc;
          // date
          const dateEl = clone.querySelector('.trip-date');
          if (evt.date) dateEl.innerHTML = evt.date;
          else dateEl.remove();
          // program
          const prog = clone.querySelector('.trip-program');
          if (evt.program) evt.program.forEach(i=>{let li=document.createElement('li');li.textContent=i;prog.appendChild(li);} ); else prog.remove();
          // meta
          const meta = clone.querySelector('.trip-meta');
          const parts = [];
          if (evt.km) parts.push(`Километраж: <b>${evt.km}</b>`);
          if (evt.level) parts.push(`Сложность: <b>${evt.level}</b>`);
          if (evt.price) parts.push(`Стоимость: <span class=\"trip-price\">${evt.price}</span>`);
          if (parts.length) meta.innerHTML = parts.join('<br>'); else meta.remove();

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
      if (swipers[grp]) swipers[grp].destroy(true,true);
      swipers[grp] = new Swiper(el, {
        slidesPerView: 3,
        spaceBetween: 16,
        navigation: {
          nextEl: el.querySelector('.swiper-button-next'),
          prevEl: el.querySelector('.swiper-button-prev'),
        },
        pagination: {el: el.querySelector('.swiper-pagination'), clickable: true},
        breakpoints: {0:{slidesPerView:1},640:{slidesPerView:2},1024:{slidesPerView:3}}
      });
    });
  }

  function initFiltering() {
    function apply(filter) {
      const show = groupMap[filter] || [];
      sections.forEach(sec => {
        const grp = sec.dataset.group;
        if (show.includes(grp)) {
          sec.style.display = '';
          swipers[grp].update();
          swipers[grp].slideTo(0);
        } else sec.style.display = 'none';
      });
    }

    mainBtns.forEach(btn => btn.addEventListener('click', () => {
      mainBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      // сброс подфильтров
      subBtns.forEach(b=>b.classList.remove('active'));
      apply(btn.dataset.filter);
    }));

    subBtns.forEach(btn => btn.addEventListener('click', () => {
      subBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      mainBtns.forEach(b=> b.dataset.filter==='pvd'? b.classList.add('active') : b.classList.remove('active'));
      apply(btn.dataset.filter);
    }));

    // стартовое состояние
    apply('all');
  }

  loadCards();
});
