document.addEventListener('DOMContentLoaded', () => {
  const mainBtns = document.querySelectorAll('#main-filters .filter-item');
  const subBtns  = document.querySelectorAll('#pvd-filters .filter-item');
  const subbar   = document.getElementById('pvd-filters');
  const cards    = document.querySelectorAll('.service-card');

  function filterCards(filter) {
    cards.forEach(card => {
      const types = card.dataset.type.split(' ');
      card.style.display = types.includes(filter) ? 'flex' : 'none';
    });
  }

  mainBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mainBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.filter === 'pvd') {
        subbar.style.display = 'flex';
        filterCards(subBtns[0].dataset.filter);
      } else {
        subbar.style.display = 'none';
        filterCards(btn.dataset.filter);
      }
    });
  });

  subBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards(btn.dataset.filter);
    });
  });

  // Изначальный показ — все
  filterCards('all');
});
