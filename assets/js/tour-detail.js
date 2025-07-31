document.addEventListener('DOMContentLoaded', async () => { 
  const params = new URLSearchParams(window.location.search);
  const tourId = params.get('id');

  if (!tourId) {
    document.body.innerHTML = '<h2>Тур не найден</h2>';
    return;
  }

  try {
-    const resp = await fetch('events.json');
-    const tours = await resp.json();
+    const resp = await fetch('events.json');
+    const payload = await resp.json();
+    // Данные теперь находятся в payload.data
+    const tours = Array.isArray(payload.data) ? payload.data : [];
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
    // очистим старые
    prog.innerHTML = '';
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

    // Подставляем tourId в скрытое поле формы записи
    const bookingForm = document.getElementById('booking-form');
    const tourInput   = document.getElementById('form-tour-id');
    if (tourInput) tourInput.value = tourId;

    // Динамика полей участников (если есть на странице)
    const countSelect     = document.getElementById('participants-count');
    const fieldsContainer = document.getElementById('participants-fields');
    if (countSelect && fieldsContainer) {
      countSelect.addEventListener('change', () => {
        const count = parseInt(countSelect.value, 10);

        // Очищаем все, кроме первого блока
        fieldsContainer
          .querySelectorAll('.participant')
          .forEach(el => {
            if (el.dataset.index !== '1') el.remove();
          });

        // Добавляем дополнительные
        for (let i = 2; i <= count; i++) {
          const div = document.createElement('div');
          div.className = 'participant';
          div.dataset.index = i;
          div.innerHTML = `
            <input type="text"  name="name[]"  placeholder="Имя участника ${i}" required />
            <input type="email" name="email[]" placeholder="E‑mail участника ${i}" required />
            <input type="tel"   name="phone[]" placeholder="Телефон участника ${i}" required />
          `;
          fieldsContainer.appendChild(div);
        }
      });
    }

  } catch (err) {
    document.body.innerHTML = '<h2>Ошибка загрузки данных</h2>';
    console.error(err);
  }
});
