document.addEventListener('DOMContentLoaded', async () => {
  // 1. Загрузка карточек
  const resp = await fetch('events-cards.html');
  const html  = await resp.text();
  const tmp   = document.createElement('div');
  tmp.innerHTML = html;
  // Берём именно внутренности #cards-container
  const cardsHtml = tmp.querySelector('#cards-container').innerHTML;
  document.getElementById('cards-container').innerHTML = cardsHtml;

  // 2. Инициализируем фильтры
  initFilters();
});

function initFilters() {
  const mainBtns = document.querySelectorAll('#main-filters .filter-item');
  const subBtns  = document.querySelectorAll('#pvd-filters .filter-item');
  const subbar   = document.getElementById('pvd-filters');
  const cards    = document.querySelectorAll('#cards-container .service-card');

  function filterCards(filter) {
    cards.forEach(card => {
      // категория и (для PVD) субкатегория лежат в data-*
      const cat = card.dataset.category;
      const sub = card.dataset.sub; 
      let ok = false;
      if (filter === 'all') ok = true;
      else if (filter === 'pvd') ok = (cat === 'pvd');
      else if (filter === 'big') ok = (cat === 'big');
      else if (filter === 'allpvd') ok = (cat === 'pvd');
      else ok = (sub === filter);
      card.style.display = ok ? 'flex' : 'none';
    });
  }

  // основная панель
  mainBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mainBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.filter === 'pvd') {
        subbar.style.display = 'flex';
        filterCards('allpvd');
      } else {
        subbar.style.display = 'none';
        filterCards(btn.dataset.filter);
      }
    });
  });

  // под‑панель PVD
  subBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards(btn.dataset.filter);
    });
  });

  // показываем всё по умолчанию
  filterCards('all');
}
