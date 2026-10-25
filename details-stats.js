const AppStorage = {

loadLibrary() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return null;
      return parsed.map(b => this.sanitizeBook(b));
    } catch (e) {
      console.error('Помилка читання LocalStorage:', e);
      return null;
    }
  },

  saveLibrary(books) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      window.dispatchEvent(new CustomEvent('booknest:library-updated'));
      return true;
    } catch (e) {
      console.error('Помилка запису в LocalStorage:', e);
      alert('Не вдалося зберегти зміни: переповнене сховище браузера.');
      return false;
    }
  },

  updateBook(id, fields) {
    const idx = library.findIndex(b => b.id === id);
    if (idx === -1) return false;

    const book = library[idx];
    const updated = { ...book, ...fields };


    if (fields.status) {
      if (fields.status === 'reading' && !updated.startDate) {
        updated.startDate = new Date().toISOString().split('T')[0];
      }
      if (fields.status === 'finished') {
        if (!updated.finishedDate) {
          updated.finishedDate = new Date().toISOString().split('T')[0];
        }
        if (updated.totalPages > 0) {
          updated.currentPage = updated.totalPages;
        }
      }
    }

    if (typeof updated.currentPage === 'number' && typeof updated.totalPages === 'number' && updated.totalPages > 0) {
      if (updated.currentPage > updated.totalPages) {
        updated.currentPage = updated.totalPages;
      }
    }

    library[idx] = updated;
    this.saveLibrary(library);
    return true;
  },

  deleteBook(id) {
    library = library.filter(b => b.id !== id);
    this.saveLibrary(library);
  },

  sanitizeBook(b) {
    return {
      id: b.id || 'book-' + Date.now() + Math.random().toString(36).substr(2, 4),
      googleId: b.googleId || null,
      title: String(b.title || 'Без назви').trim(),
      author: String(b.author || 'Невідомий автор').trim(),
      genre: String(b.genre || 'Загальне').trim(),
      year: parseInt(b.year, 10) || null,
      totalPages: parseInt(b.totalPages, 10) || 0,
      currentPage: parseInt(b.currentPage, 10) || 0,
      status: ['reading', 'finished', 'wishlist'].includes(b.status) ? b.status : 'wishlist',
      rating: Math.min(5, Math.max(0, parseInt(b.rating, 10) || 0)),
      review: String(b.review || '').trim(),
      startDate: b.startDate || null,
      finishedDate: b.finishedDate || null,
      coverUrl: b.coverUrl || '',
      description: String(b.description || '').trim(),
      addedDate: b.addedDate || new Date().toISOString().split('T')[0]
    };
  }
};

let currentDetailId = null;

function renderAdvancedBookDetail(id) {
  const book = library.find(b => b.id === id);
  if (!book) return;

  currentDetailId = id;
  const container = document.getElementById('advBookDetailContainer');
  const titleHeader = document.getElementById('advDetailHeaderTitle');
  if (titleHeader) titleHeader.textContent = book.title;

  const statusLabels = {
    reading: 'Читаю зараз',
    finished: 'Прочитано',
    wishlist: 'Хочу прочитати'
  };

  const hasPages = typeof book.totalPages === 'number' && book.totalPages > 0;
  const percent = hasPages ? Math.min(100, Math.round(((book.currentPage || 0) / book.totalPages) * 100)) : null;

  container.innerHTML = `
    <div class="adv-detail-layout">
      <div class="adv-cover-column">
        <img src="${book.coverUrl || getDefaultCover(book.title)}" alt="${escapeHtml(book.title)}" class="adv-detail-cover">
        <div class="adv-chips-row">
          <span class="adv-chip">🏷️ ${escapeHtml(book.genre || 'Загальне')}</span>
          <span class="adv-chip">📅 ${book.year || 'Рік невідомий'}</span>
          <span class="adv-chip">📄 ${hasPages ? book.totalPages + ' стор.' : 'Сторінки не вказані'}</span>
        </div>
      </div>

      <div class="adv-meta-column">
        <div class="adv-title-group">
          <h2>${escapeHtml(book.title)}</h2>
          <div class="adv-author-text">${escapeHtml(book.author)}</div>
        </div>

        <div class="adv-interactive-box">
          <div class="adv-form-row">
            <div class="adv-field">
              <label>Статус книги:</label>
              <select id="advBookStatusSelect">
                <option value="reading" ${book.status === 'reading' ? 'selected' : ''}>Читаю</option>
                <option value="finished" ${book.status === 'finished' ? 'selected' : ''}>Прочитано</option>
                <option value="wishlist" ${book.status === 'wishlist' ? 'selected' : ''}>Хочу прочитати</option>
              </select>
            </div>
            <div class="adv-field">
              <label>Особистий рейтинг:</label>
              <div class="adv-rating-group">
                <div class="adv-stars-interactive" id="advStarsContainer">
                  ${[1, 2, 3, 4, 5].map(star => `
                    <button type="button" class="adv-star-btn ${star <= (book.rating || 0) ? 'active' : ''}" data-star="${star}">★</button>
                  `).join('')}
                </div>
                <span id="advRatingText" style="font-size: 13px; font-weight: 600; color: var(--color-star);">${book.rating ? book.rating + ' / 5' : 'Без оцінки'}</span>
              </div>
            </div>
          </div>

          <div class="adv-form-row">
            <div class="adv-field">
              <label>Дата початку читання:</label>
              <input type="date" id="advStartDateInput" value="${book.startDate || ''}">
            </div>
            <div class="adv-field">
              <label>Дата завершення:</label>
              <input type="date" id="advFinishedDateInput" value="${book.finishedDate || ''}">
            </div>
          </div>

          <div class="adv-progress-container">
            <div class="adv-progress-header">
              <span>Прочитано: <strong>${book.currentPage || 0}</strong> з <strong>${hasPages ? book.totalPages : '?'}</strong> стор.</span>
              ${percent !== null ? `<span>Прогрес: <strong>${percent}%</strong></span>` : ''}
            </div>
            ${percent !== null ? `
              <div class="progress-bar-bg" style="height: 8px;">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
              </div>
            ` : ''}
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
              <input type="number" id="advCurrentPageInput" min="0" ${hasPages ? `max="${book.totalPages}"` : ''} value="${book.currentPage || 0}" style="width: 110px; padding: 6px 10px;">
              <button type="button" class="btn-sm-action" id="advSaveProgressBtn">Оновити сторінку</button>
            </div>
            <span id="advPageError" style="font-size: 11px; color: #dc3545; display: none;">Кількість прочитаних сторінок не може перевищувати ${book.totalPages}!</span>
          </div>
        </div>

        <div class="adv-review-area">
          <label style="font-size: 13px; font-weight: 600;">Власний відгук та враження:</label>
          <textarea id="advReviewTextarea" rows="3" placeholder="Напишіть ваші враження, улюблені цитати чи аналіз...">${escapeHtml(book.review || '')}</textarea>
          <div class="adv-review-actions">
            ${book.review ? `<button type="button" class="btn-sm-action danger" id="advDeleteReviewBtn">Видалити відгук</button>` : ''}
            <button type="button" class="btn-sm-action primary" id="advSaveReviewBtn">Зберегти відгук</button>
          </div>
        </div>

        ${book.description ? `
          <div class="adv-book-description">
            <strong>Анотація книги:</strong>
            <p style="margin-top: 4px;">${escapeHtml(book.description)}</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  bindAdvancedDetailEvents(book);
}

function bindAdvancedDetailEvents(book) {
  const statusSelect = document.getElementById('advBookStatusSelect');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      const nextStatus = e.target.value;
      AppStorage.updateBook(book.id, { status: nextStatus });
      renderAdvancedBookDetail(book.id);
    });
  }

  const startInput = document.getElementById('advStartDateInput');
  if (startInput) {
    startInput.addEventListener('change', (e) => {
      AppStorage.updateBook(book.id, { startDate: e.target.value || null });
    });
  }

  const finishedInput = document.getElementById('advFinishedDateInput');
  if (finishedInput) {
    finishedInput.addEventListener('change', (e) => {
      AppStorage.updateBook(book.id, { finishedDate: e.target.value || null });
    });
  }

  
  const pageInput = document.getElementById('advCurrentPageInput');
  const pageBtn = document.getElementById('advSaveProgressBtn');
  const pageErr = document.getElementById('advPageError');

  if (pageBtn && pageInput) {
    pageBtn.addEventListener('click', () => {
      const val = parseInt(pageInput.value, 10);
      if (isNaN(val) || val < 0) return;

      if (book.totalPages > 0 && val > book.totalPages) {
        if (pageErr) pageErr.style.display = 'block';
        return;
      }

      if (pageErr) pageErr.style.display = 'none';

      const updateData = { currentPage: val };
      if (book.totalPages > 0 && val >= book.totalPages) {
        updateData.status = 'finished';
      }
      AppStorage.updateBook(book.id, updateData);
      renderAdvancedBookDetail(book.id);
    });
  }

  const stars = document.querySelectorAll('#advStarsContainer .adv-star-btn');
  stars.forEach(btn => {
    btn.addEventListener('click', () => {
      const ratingVal = parseInt(btn.dataset.star, 10);
      AppStorage.updateBook(book.id, { rating: ratingVal });
      renderAdvancedBookDetail(book.id);
    });
  });

  const reviewBtn = document.getElementById('advSaveReviewBtn');
  const reviewArea = document.getElementById('advReviewTextarea');
  if (reviewBtn && reviewArea) {
    reviewBtn.addEventListener('click', () => {
      AppStorage.updateBook(book.id, { review: reviewArea.value.trim() });
      renderAdvancedBookDetail(book.id);
    });
  }

  const delReviewBtn = document.getElementById('advDeleteReviewBtn');
  if (delReviewBtn) {
    delReviewBtn.addEventListener('click', () => {
      if (confirm('Видалити ваш текстовий відгук?')) {
        AppStorage.updateBook(book.id, { review: '' });
        renderAdvancedBookDetail(book.id);
      }
    });
  }
}


window.openBookDetail = function(id) {
  const modal = document.getElementById('bookDetailModal');
  if (!modal) return;
  renderAdvancedBookDetail(id);
  modal.classList.add('active');
};

let statsSelectedPeriod = 'year';
let statsDetailChart = null;

function calculateDetailedStats(period) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const finishedBooksAllTime = library.filter(b => b.status === 'finished');

  const filtered = finishedBooksAllTime.filter(b => {
    if (!b.finishedDate) return period === 'all';
    const finishDate = new Date(b.finishedDate);
    if (isNaN(finishDate.getTime())) return period === 'all';

    if (period === 'month') {
      return finishDate.getFullYear() === currentYear && finishDate.getMonth() === currentMonth;
    } else if (period === 'year') {
      return finishDate.getFullYear() === currentYear;
    }
    return true;
  });

  const totalFinishedPeriod = filtered.length;

  const totalPagesRead = filtered.reduce((acc, b) => acc + (b.totalPages || b.currentPage || 0), 0);

  const ratedBooks = filtered.filter(b => (b.rating || 0) > 0);
  const avgRating = ratedBooks.length > 0
    ? (ratedBooks.reduce((acc, b) => acc + b.rating, 0) / ratedBooks.length).toFixed(1)
    : '0.0';

  // Жанри
  const genreCounts = {};
  filtered.forEach(b => {
    const genre = b.genre || 'Інше';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    finishedCount: totalFinishedPeriod,
    pagesCount: totalPagesRead,
    avgRating,
    allTimeFinished: finishedBooksAllTime.length,
    topGenres,
    filteredBooks: filtered
  };
}

function renderStatsSection() {
  const dynamicCount = document.getElementById('statsDynamicFinished');
  const dynamicLabel = document.getElementById('statsDynamicLabel');
  const dynamicPages = document.getElementById('statsDynamicPages');
  const dynamicRating = document.getElementById('statsDynamicRating');
  const allTimeCount = document.getElementById('statsAllTimeFinishedTotal');

  if (!dynamicCount) return;

  const stats = calculateDetailedStats(statsSelectedPeriod);

  const periodLabels = {
    month: 'Прочитано за місяць',
    year: 'Прочитано за рік',
    all: 'Прочитано за весь час'
  };

  dynamicLabel.textContent = periodLabels[statsSelectedPeriod];
  dynamicCount.textContent = stats.finishedCount;
  dynamicPages.textContent = stats.pagesCount;
  dynamicRating.textContent = stats.avgRating;
  allTimeCount.textContent = stats.allTimeFinished;

  renderTopGenres(stats.topGenres, stats.finishedCount);
  renderDetailedMonthlyChart();
  renderFinishedHistoryList();
}

function renderTopGenres(topGenres, total) {
  const container = document.getElementById('statsTopGenresContainer');
  if (!container) return;

  if (topGenres.length === 0) {
    container.innerHTML = '<p class="progress-hint" style="margin-top:10px;">Немає завершених книг за вибраний період.</p>';
    return;
  }

  container.innerHTML = topGenres.map(([genre, count]) => {
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div class="genre-bar-item">
        <div class="genre-bar-info">
          <span class="genre-bar-name">${escapeHtml(genre)}</span>
          <span class="genre-bar-count">${count} ${getNoun(count, 'книга', 'книги', 'книг')} (${percent}%)</span>
        </div>
        <div class="genre-progress-track">
          <div class="genre-progress-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDetailedMonthlyChart() {
  const ctx = document.getElementById('statsDetailedMonthlyChart');
  if (!ctx) return;

  const currentYear = new Date().getFullYear();
  const monthlyCounts = new Array(12).fill(0);

  library.forEach(b => {
    if (b.status === 'finished' && b.finishedDate) {
      const d = new Date(b.finishedDate);
      if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
        monthlyCounts[d.getMonth()]++;
      }
    }
  });

  const monthLabels = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

  if (statsDetailChart) {
    statsDetailChart.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#9a9a9a' : '#6b6b6b';
  const gridColor = isDark ? '#333333' : '#ede2d3';

  statsDetailChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Прочитано книг',
        data: monthlyCounts,
        borderColor: '#2d6b45',
        backgroundColor: 'rgba(45, 107, 69, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#2d6b45',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: textColor },
          grid: { color: gridColor }
        },
        x: {
          ticks: { color: textColor },
          grid: { display: false }
        }
      }
    }
  });
}

function renderFinishedHistoryList() {
  const list = document.getElementById('statsFinishedHistoryList');
  if (!list) return;

  const finishedWithDate = library
    .filter(b => b.status === 'finished' && b.finishedDate)
    .sort((a, b) => new Date(b.finishedDate) - new Date(a.finishedDate));

  if (finishedWithDate.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding: 30px;">
        <div class="empty-state-icon">📖</div>
        <h3>Немає датованих завершених книг</h3>
        <p>Коли ви завершуєте читання книги, встановлюйте дату прочитання, щоб вона відобразилась у хронології.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = finishedWithDate.map(b => `
    <div class="history-item-row" onclick="openBookDetail('${b.id}')">
      <div class="history-item-left">
        <img src="${b.coverUrl || getDefaultCover(b.title)}" alt="${escapeHtml(b.title)}" class="history-thumb">
        <div class="history-titles">
          <h4>${escapeHtml(b.title)}</h4>
          <span>${escapeHtml(b.author)} • ${escapeHtml(b.genre || 'Загальне')}</span>
        </div>
      </div>
      <div class="history-item-right">
        ${renderStarsHTML(b.rating || 0)}
        <span class="history-date-badge">✓ ${b.finishedDate}</span>
      </div>
    </div>
  `).join('');
}

function setupImportExport() {
  const exportBtn = document.getElementById('exportLibraryBtn');
  const importTrigger = document.getElementById('importLibraryTriggerBtn');
  const fileInput = document.getElementById('importJsonFileInput');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        const payload = JSON.stringify(library, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booknest_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('Помилка формування файлу експорту.');
      }
    });
  }

  if (importTrigger && fileInput) {
    importTrigger.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (!Array.isArray(parsed)) {
            throw new Error('Файл має містити список книг (масив JSON).');
          }

          // Валідація елементів
          const validated = [];
          for (let item of parsed) {
            if (!item.title || typeof item.title !== 'string') {
              throw new Error('Усі книги в файлі повинні мати обов’язкове текстове поле "title".');
            }
            validated.push(AppStorage.sanitizeBook(item));
          }

          const action = confirm(
            `Знайдено ${validated.length} книг.\n\nНатисніть "ОК" для ПОВНОЇ ЗАМІНИ наявної бібліотеки.\nНатисніть "Скасувати" для ОБ’ЄДНАННЯ з наявними книгами.`
          );

          if (action) {
            library = validated;
          } else {
            // Об'єднання без дублікатів по id або title+author
            const existingKeys = new Set(library.map(b => `${b.title.toLowerCase()}___${b.author.toLowerCase()}`));
            let addedCount = 0;
            validated.forEach(newB => {
              const key = `${newB.title.toLowerCase()}___${newB.author.toLowerCase()}`;
              if (!existingKeys.has(key)) {
                library.push(newB);
                existingKeys.add(key);
                addedCount++;
              }
            });
            alert(`Успішно додано ${addedCount} нових книг! Дублікати пропущено.`);
          }

          AppStorage.saveLibrary(library);
          alert('Імпорт бібліотеки успішно завершено!');
        } catch (err) {
          alert('Помилка імпорту: файл пошкоджено або він має некоректний формат JSON.\n\nДеталі: ' + err.message);
        } finally {
          fileInput.value = '';
        }
      };
      reader.readAsText(file);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Перемикач періоду статистики
  const periodBtns = document.querySelectorAll('.stats-period-btn');
  periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      statsSelectedPeriod = btn.dataset.period;
      renderStatsSection();
    });
  });

  const closeAdvBtn = document.getElementById('advCloseDetailModalBtn');
  const closeAdvFooterBtn = document.getElementById('advCloseModalFooterBtn');
  const deleteAdvBtn = document.getElementById('advDeleteBookBtn');
  const editAdvBtn = document.getElementById('advEditFullBtn');
  const advModal = document.getElementById('bookDetailModal');

  const closeAdvModal = () => {
    if (advModal) advModal.classList.remove('active');
  };

  if (closeAdvBtn) closeAdvBtn.addEventListener('click', closeAdvModal);
  if (closeAdvFooterBtn) closeAdvFooterBtn.addEventListener('click', closeAdvModal);

  if (deleteAdvBtn) {
    deleteAdvBtn.addEventListener('click', () => {
      if (currentDetailId) {
        deleteBook(currentDetailId);
        closeAdvModal();
      }
    });
  }

  if (editAdvBtn) {
    editAdvBtn.addEventListener('click', () => {
      if (currentDetailId) {
        closeAdvModal();
        openEditBook(currentDetailId);
      }
    });
  }

  setupImportExport();

  window.addEventListener('booknest:library-updated', () => {
    renderStatsSection();
    if (typeof renderAll === 'function') {
      renderAll();
    }
  });

  renderStatsSection();
});