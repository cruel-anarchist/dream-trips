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

  // 2) Настроить фильтрацию и карусель
  function initFiltering() {
    // Функция, которая каждый раз берёт актуальные карточки из DOM
    const getCards = () =>
      Array.from(document.querySelectorAll(
        '#cards-container .service-card, #cards-container .trip-card'
      ));

    // Если >3 видимых — включаем режим «карусели»
    function updateCarousel() {
      const visible = getCards().filter(c => c.style.display !== 'none').length;
      cardsContainer.classList.toggle('carousel', visible > 3);
    }

    function showAll() {
      getCards().forEach(c => c.style.display = '');
      updateCarousel();
    }

    function filterCards(filter) {
      if (filter === 'all') {
        return showAll();
      }
      getCards().forEach(card => {
        const types = card.dataset.type.split(' ');
        card.style.display = types.includes(filter) ? '' : 'none';
      });
      updateCarousel();
    }

    // === обработчики главных кнопок ===
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (f === 'pvd') {
          // показываем «Все ПВД»
          subBtns.forEach(b => b.classList.remove('active'));
          subBtns[0].classList.add('active');
          filterCards('allpvd');
        } else {
          filterCards(f);
        }
      });
    });

    // === обработчики подменю ПВД ===
    subBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // держим «ПВД» активным в главном меню
        mainBtns.forEach(b =>
          b.dataset.filter === 'pvd' ? b.classList.add('active') : b.classList.remove('active')
        );
        filterCards(f);
      });
    });

    // старт
    showAll();
  }

  loadCards();
});
