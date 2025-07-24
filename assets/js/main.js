document.addEventListener('DOMContentLoaded', () => {
  const mainBtns       = document.querySelectorAll('#main-filters .filter-item');
  const subBtns        = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const cardsContainer = document.getElementById('cards-container');

  // 1) Загрузить карточки
  async function loadCards() {
    const resp = await fetch('events-cards.html');
    const html = await resp.text();
    cardsContainer.innerHTML = html;
    initFiltering();
  }

  // 2) Настроить фильтрацию
  function initFiltering() {
    const cards = document.querySelectorAll('#cards-container .service-card');

    function showAll() {
      cards.forEach(c => c.style.display = 'flex');
    }

    function filterCards(filter) {
      if (filter === 'all') {
        return showAll();
      }
      if (filter === 'allpvd') {
        // показываем все, у кого в data-type есть 'pvd'
        cards.forEach(card => {
          const types = card.dataset.type.split(' ');
          card.style.display = types.includes('pvd') ? 'flex' : 'none';
        });
        return;
      }
      cards.forEach(card => {
        const types = card.dataset.type.split(' ');
        card.style.display = types.includes(filter) ? 'flex' : 'none';
      });
    }

    // Главные фильтры
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;

        // подсветка главного меню
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (f === 'pvd') {
          // при выборе ПВД — активируем «Все ПВД» в подменю
          subBtns.forEach(b => b.classList.remove('active'));
          subBtns[0].classList.add('active');
          filterCards('allpvd');
        } else {
          filterCards(f);
        }
      });
    });

    // Подфильтры
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;

        // подсветка суб‑меню
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // **и** обязательно оставить “ПВД” в главном меню активным
        mainBtns.forEach(b => {
          if (b.dataset.filter === 'pvd') {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });

        // фильтруем по суб‑меню
        filterCards(f);
      });
    });

    // стартовое состояние — показать всё
    showAll();
  }

  loadCards();
});
