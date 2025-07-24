document.addEventListener('DOMContentLoaded', () => {
  const mainBtns = document.querySelectorAll('#main-filters .filter-item');
  const subBtns  = document.querySelectorAll('#pvd-filters .filter-item');
  const subbar   = document.getElementById('pvd-filters');
  const cards    = document.querySelectorAll('#cards-container .service-card');

  function clearActive(btns) {
    btns.forEach(b => b.classList.remove('active'));
  }

  function filterCards(category, sub = null) {
    cards.forEach(card => {
      const cat = card.dataset.category;
      const sb  = card.dataset.sub || null;
      let visible = false;

      if (category === 'all') {
        visible = true;
      } else if (category === 'big') {
        visible = cat === 'big';
      } else if (category === 'pvd') {
        if (!sub || sub === 'allpvd') {
          visible = cat === 'pvd';
        } else {
          visible = cat === 'pvd' && sb === sub;
        }
      }

      card.style.display = visible ? 'flex' : 'none';
    });
  }

  // Основные кнопки
  mainBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clearActive(mainBtns);
      btn.classList.add('active');

      if (btn.dataset.filter === 'pvd') {
        subbar.style.display = 'flex';
        clearActive(subBtns);
        subBtns[0].classList.add('active');
        filterCards('pvd', 'allpvd');
      } else {
        subbar.style.display = 'none';
        filterCards(btn.dataset.filter);
      }
    });
  });

  // Подфильтры ПВД
  subBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clearActive(subBtns);
      btn.classList.add('active');
      filterCards('pvd', btn.dataset.filter);
    });
  });

  // По умолчанию — всё
  filterCards('all');
});
