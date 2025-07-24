document.addEventListener('DOMContentLoaded', () => {
  const mainBtns = document.querySelectorAll('#main-filters > .filter-item-wrapper > .filter-item');
  const subBtns  = document.querySelectorAll('#pvd-filters .filter-item');
  const cardsContainer = document.getElementById('cards-container');

  // 1) Подтягиваем карточки из external файла
  async function loadCards() {
    const resp = await fetch('events-cards.html');
    const html = await resp.text();
    // помещаем внутрь контейнера
    cardsContainer.innerHTML = html;
    initFiltering(); // привязываем фильтры
  }

  // 2) Инициализация логики фильтрации уже загруженных .service-card
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

    // главные кнопки
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // если это ПВД — показываем dropdown и показываем allpvd
        const filter = btn.dataset.filter;
        if (filter === 'pvd') {
          // активируем в субфильтрах first
          subBtns.forEach(b => b.classList.remove('active'));
          subBtns[0].classList.add('active');
          filterCards('allpvd');
        } else {
          filterCards(filter);
        }
      });
    });

    // кнопки субфильтров
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterCards(btn.dataset.filter);
      });
    });

    // стартовый показ всех
    showAll();
  }

  loadCards();
});
