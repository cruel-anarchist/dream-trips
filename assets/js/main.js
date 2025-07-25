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
    // берём все service- и trip-карточки
    const cards = Array.from(
      document.querySelectorAll('#cards-container .service-card, #cards-container .trip-card')
    );

    // переключение в режим «карусели», если >3 видимых
    function updateCarousel() {
      const visibleCount = cards.filter(c => c.style.display !== 'none').length;
      cardsContainer.classList.toggle('carousel', visibleCount > 3);
    }

    function showAll() {
      cards.forEach(c => c.style.display = '');
      updateCarousel();
    }

    function filterCards(filter) {
      if (filter === 'all') {
        return showAll();
      }
      cards.forEach(card => {
        const types = card.dataset.type.split(' ');
        card.style.display = types.includes(filter) ? '' : 'none';
      });
      updateCarousel();
    }

    // Главные фильтры
    mainBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        mainBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (f === 'pvd') {
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
        subBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        mainBtns.forEach(b => {
          if (b.dataset.filter === 'pvd') b.classList.add('active');
          else b.classList.remove('active');
        });

        filterCards(f);
      });
    });

    // стартовое состояние — показать всё
    showAll();
  }

  loadCards();
});
