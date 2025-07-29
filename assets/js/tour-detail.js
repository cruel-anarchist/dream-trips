document.addEventListener('DOMContentLoaded', async () => { 
  const params = new URLSearchParams(window.location.search);
  const tourId = params.get('id');

  if (!tourId) {
    document.body.innerHTML = '<h2>Тур не найден</h2>';
    return;
  }

  try {
    const resp = await fetch('events.json');
    const tours = await resp.json();
    const tour = tours.find(t => (t.link || '').includes(tourId));

    if (!tour) {
      document.body.innerHTML = '<h2>Такой тур не найден</h2>';
      return;
    }

    // Заполнение контента
    const img = document.querySelector('.trip-img');
    img.src = tour.img;
    img.alt = tour.alt || tour.title;
    // === ЗАГЛУШКА ===
    img.onerror = () => {
      img.src = 'assets/img/placeholder.jpg';
      img.alt = 'Изображение недоступно';
    };

    document.querySelector('.trip-title').textContent = tour.title;
    document.querySelector('.trip-date').textContent = tour.date;
    document.querySelector('.trip-desc').textContent = tour.desc;

    const prog = document.querySelector('.trip-program');
    if (Array.isArray(tour.program)) {
      tour.program.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        prog.appendChild(li);
      });
    }

    const meta = document.querySelector('.trip-meta');
    const parts = [];
    if (tour.km)    parts.push(`Километраж: <strong>${tour.km}</strong>`);
    if (tour.level) parts.push(`Сложность: <strong>${tour.level}</strong>`);
    if (tour.price) parts.push(`Стоимость: <span class="trip-price">${tour.price}</span>`);
    meta.innerHTML = parts.join('<br>');

  } catch (err) {
    document.body.innerHTML = '<h2>Ошибка загрузки данных</h2>';
    console.error(err);
  }
});
