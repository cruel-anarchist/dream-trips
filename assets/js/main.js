document.addEventListener('DOMContentLoaded', () => {
  const mainBtns       = document.querySelectorAll('#main-filters > .filter-item-wrapper > .filter-item');
  const subBtns        = document.querySelectorAll('.has-dropdown .dropdown .filter-item');
  const cardsContainer = document.getElementById('cards-container');

  // 1) Загрузить карточки из внешнего файла
  async function loadCards() {
    const resp = await fetch('events-cards.html');
    const html = await resp.text();
    cardsContainer.innerHTML = html;
    initFiltering();
  }

  // 2) Повесить логику фильтра
  function initFiltering() {
    const cards = document.querySelectorAll('#cards-container .service-card');

    // показывает все карточки
    function showAll() {
      cards.forEach(c => c.style.display = 'flex');
    }

    // фильтрует по data-type
    function filterCards(filter) {
      if (filter === 'all') {
        return showAll();
      }
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

        const filter = btn.dataset.filter;
        if (filter === 'pvd') {
          // активируем первый subBtn («Все ПВД»)
          subBtns.forEach(b => b.classList.remove('active'));
          subBtns[0].classList.add('active');
          filterCards('allpvd');
        } else {
          filterCards(filter);
        }
      });
    });

    // sub‑кнопки в dropdown
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
