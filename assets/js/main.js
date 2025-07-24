document.addEventListener('DOMContentLoaded', () => {
  const mainWrappers   = document.querySelectorAll('#main-filters .filter-item-wrapper');
  const mainBtns       = document.querySelectorAll('#main-filters .filter-item');
  const subBtns        = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const cardsContainer = document.getElementById('cards-container');

  // 1) Загрузка карточек из внешнего файла
  async function loadCards() {
    const resp = await fetch('events-cards.html');
    const html = await resp.text();
    cardsContainer.innerHTML = html;
    initFiltering();
  }

  // 2) Инициализируем логику фильтрации
  function initFiltering() {
    const cards = document.querySelectorAll('#cards-container .service-card');

    function showAll() {
      cards.forEach(c => c.style.display = 'flex');
    }

    function filterCards(filter) {
      if (filter === 'all') return showAll();
      cards.forEach(card => {
        const types = card.dataset.type.split(' ');
        card.style.display = types.includes(filter) ? 'flex' : 'none';
      });
    }

    // Главные кнопки
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        if (f === 'pvd') {
          subBtns.forEach(b => b.classList.remove('active'));
          subBtns[0].classList.add('active');
          filterCards('allpvd');
        } else {
          filterCards(f);
        }
      });
    });

    // Суб‑кнопки
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterCards(btn.dataset.filter);
      });
    });

    // По умолчанию — показать все
    showAll();
  }

  loadCards();
});
