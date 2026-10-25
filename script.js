const STORAGE_KEY = 'booknest_library_data';
const GOAL_KEY = 'booknest_reading_goal';
const THEME_KEY = 'booknest_theme';
const VIEW_MODE_KEY = 'booknest_library_view_mode';

const DEMO_BOOKS = [
  {
    id: 'demo-1',
    googleId: null,
    title: 'Тигролови',
    author: 'Іван Багряний',
    genre: 'Пригодницький роман',
    year: 1944,
    totalPages: 320,
    currentPage: 210,
    status: 'reading',
    rating: 5,
    finishedDate: null,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    description: 'Пригодницький роман про волю, силу людського духу та боротьбу проти тоталітарного режиму.',
    addedDate: '2026-09-12'
  },
  {
    id: 'demo-2',
    googleId: null,
    title: 'Місто',
    author: 'Валер\'ян Підмогильний',
    genre: 'Модернізм',
    year: 1928,
    totalPages: 288,
    currentPage: 140,
    status: 'reading',
    rating: 4,
    finishedDate: null,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    description: 'Урбаністичний роман про підкорення Києва молодим юнаком Степаном Радченком.',
    addedDate: '2026-10-01'
  },
  {
    id: 'demo-3',
    googleId: null,
    title: 'Фелікс Австрія',
    author: 'Софія Андрухович',
    genre: 'Історичний роман',
    year: 2014,
    totalPages: 288,
    currentPage: 288,
    status: 'finished',
    rating: 5,
    finishedDate: '2026-02-18',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80',
    description: 'Станиславів кінця XIX — початку XX століття та складна історія двох жінок.',
    addedDate: '2026-01-10'
  },
  {
    id: 'demo-4',
    googleId: null,
    title: 'За перекопом є земля',
    author: 'Анастасія Левкова',
    genre: 'Сучасна проза',
    year: 2023,
    totalPages: 392,
    currentPage: 392,
    status: 'finished',
    rating: 5,
    finishedDate: '2026-05-14',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
    description: 'Кримський роман від 2000-х років до окупації 2014 року.',
    addedDate: '2026-04-12'
  },
  {
    id: 'demo-5',
    googleId: null,
    title: 'Я бачу, вас цікавить пітьма',
    author: 'Ілларіон Павлюк',
    genre: 'Психологічний трилер',
    year: 2020,
    totalPages: 660,
    currentPage: 660,
    status: 'finished',
    rating: 5,
    finishedDate: '2026-08-22',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
    description: 'Містичний детектив про київського кримінального психолога у дивному селищі Буськів Сад.',
    addedDate: '2026-07-15'
  },
  {
    id: 'demo-6',
    googleId: null,
    title: 'Танці з кістками',
    author: 'Андрій Сем\'янків',
    genre: 'Медичний трилер',
    year: 2022,
    totalPages: 360,
    currentPage: 0,
    status: 'wishlist',
    rating: 0,
    finishedDate: null,
    coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=400&q=80',
    description: 'Історія патологоанатома Северина, який ступає на слизьку стежку нелегального заробітку.',
    addedDate: '2026-10-15'
  }
];

const MOTIVATIONAL_QUOTES = [
  '«Людина, яка читає, проживає тисячу життів до того, як помре.» — Джордж Мартін',
  '«Книги — це кораблі думки, що мандрують по хвилях часу.» — Френсіс Бекон',
  '«Читання для розуму — те саме, що фізичні вправи для тіла.» — Джозеф Аддісон',
  '«Кімната без книг подібна до тіла без душі.» — Марк Туллій Цицерон'
];

let library = [];
let yearlyGoal = 12;
let monthlyChart = null;

let libraryFilterStatus = 'all';
let librarySortOption = 'added-desc';
let librarySearchTerm = '';
let libraryViewMode = 'grid';

let activeDetailBookId = null;

function loadInitialData() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    try {
      library = JSON.parse(storedData);
    } catch (e) {
      library = [...DEMO_BOOKS];
    }
  } else {
    library = [...DEMO_BOOKS];
    saveLibrary();
  }

  const storedGoal = localStorage.getItem(GOAL_KEY);
  if (storedGoal) {
    yearlyGoal = parseInt(storedGoal, 10) || 12;
  }

  const storedView = localStorage.getItem(VIEW_MODE_KEY);
  if (storedView) {
    libraryViewMode = storedView;
  }
}

function saveLibrary() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  renderAll();
}

function saveGoal(newGoal) {
  yearlyGoal = parseInt(newGoal, 10) || 12;
  localStorage.setItem(GOAL_KEY, yearlyGoal);
  renderYearlyProgress();
}

function initTheme() {
  const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const themeToggle = document.getElementById('themeToggle');
  const settingsToggle = document.getElementById('settingsThemeToggle');
  if (settingsToggle) settingsToggle.checked = currentTheme === 'dark';

  const toggleHandler = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    if (settingsToggle) settingsToggle.checked = !isDark;
    updateChartTheme();
  };

  if (themeToggle) themeToggle.addEventListener('click', toggleHandler);
  if (settingsToggle) settingsToggle.addEventListener('change', toggleHandler);
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .inline-nav-link, [data-navigate]');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const menuToggle = document.getElementById('menuToggle');

  function navigateTo(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`section-${sectionId}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    }

    if (sectionId === 'library') {
      renderLibrarySection();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const section = link.dataset.section || link.dataset.navigate;
      if (section) {
        e.preventDefault();
        navigateTo(section);
      }
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  }
}

function updateGreetingAndQuote() {
  const greetingEl = document.getElementById('welcomeGreeting');
  const quoteEl = document.getElementById('motivationalQuote');

  const hour = new Date().getHours();
  let timeStr = 'Доброго дня';
  if (hour >= 5 && hour < 12) timeStr = 'Доброго ранку';
  else if (hour >= 18 && hour < 23) timeStr = 'Доброго вечора';
  else if (hour >= 23 || hour < 5) timeStr = 'Доброї ночі';

  if (greetingEl) greetingEl.textContent = `${timeStr}, любителю читання! 📖`;
  if (quoteEl) {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    quoteEl.textContent = MOTIVATIONAL_QUOTES[randomIndex];
  }
}

function renderStatistics() {
  const total = library.length;
  const reading = library.filter(b => b.status === 'reading').length;
  const finished = library.filter(b => b.status === 'finished').length;
  const wishlist = library.filter(b => b.status === 'wishlist').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-reading').textContent = reading;
  document.getElementById('stat-finished').textContent = finished;
  document.getElementById('stat-wishlist').textContent = wishlist;

  const pillAll = document.getElementById('pillCountAll');
  const pillReading = document.getElementById('pillCountReading');
  const pillFinished = document.getElementById('pillCountFinished');
  const pillWishlist = document.getElementById('pillCountWishlist');

  if (pillAll) pillAll.textContent = total;
  if (pillReading) pillReading.textContent = reading;
  if (pillFinished) pillFinished.textContent = finished;
  if (pillWishlist) pillWishlist.textContent = wishlist;

  const statsDetailTotal = document.getElementById('statsDetailTotal');
  const statsDetailFinished = document.getElementById('statsDetailFinished');
  const statsDetailPages = document.getElementById('statsDetailPages');
  const statsDetailAvg = document.getElementById('statsDetailAvg');

  if (statsDetailTotal) statsDetailTotal.textContent = total;
  if (statsDetailFinished) statsDetailFinished.textContent = finished;

  const totalPagesRead = library.reduce((acc, b) => {
    if (b.status === 'finished') return acc + (b.totalPages || 0);
    return acc + (b.currentPage || 0);
  }, 0);

  if (statsDetailPages) statsDetailPages.textContent = totalPagesRead;
  if (statsDetailAvg) {
    const avg = total > 0 ? Math.round(totalPagesRead / total) : 0;
    statsDetailAvg.textContent = avg;
  }
}

function renderYearlyProgress() {
  const currentYear = new Date().getFullYear();
  const yearDisplay = document.getElementById('currentYearDisplay');
  const chartYearTag = document.getElementById('chartYearTag');
  if (yearDisplay) yearDisplay.textContent = currentYear;
  if (chartYearTag) chartYearTag.textContent = `${currentYear} рік`;

  const finishedThisYear = library.filter(b => {
    if (b.status !== 'finished' || !b.finishedDate) return false;
    return new Date(b.finishedDate).getFullYear() === currentYear;
  }).length;

  const countEl = document.getElementById('yearlyReadCount');
  const targetEl = document.getElementById('yearlyTargetGoal');
  const percentEl = document.getElementById('yearlyPercentage');
  const barEl = document.getElementById('yearlyProgressBar');
  const hintEl = document.getElementById('progressHint');

  const percentage = Math.min(100, Math.round((finishedThisYear / yearlyGoal) * 100));

  if (countEl) countEl.textContent = finishedThisYear;
  if (targetEl) targetEl.textContent = yearlyGoal;
  if (percentEl) percentEl.textContent = `${percentage}%`;
  if (barEl) barEl.style.width = `${percentage}%`;

  if (hintEl) {
    if (finishedThisYear >= yearlyGoal) {
      hintEl.textContent = `🎉 Вітаємо! Ви перевиконали ціль на ${currentYear} рік!`;
    } else {
      const remaining = yearlyGoal - finishedThisYear;
      hintEl.textContent = `Залишилося прочитати ${remaining} ${getNoun(remaining, 'книгу', 'книги', 'книг')} для досягнення мети.`;
    }
  }

  const settingsGoalInput = document.getElementById('settingsGoalInput');
  if (settingsGoalInput) settingsGoalInput.value = yearlyGoal;
}

function renderChart() {
  const ctx = document.getElementById('monthlyReadingChart');
  if (!ctx) return;

  const currentYear = new Date().getFullYear();
  const monthlyCounts = new Array(12).fill(0);

  library.forEach(b => {
    if (b.status === 'finished' && b.finishedDate) {
      const finish = new Date(b.finishedDate);
      if (finish.getFullYear() === currentYear) {
        monthlyCounts[finish.getMonth()]++;
      }
    }
  });

  const monthLabels = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

  if (monthlyChart) {
    monthlyChart.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#9a9a9a' : '#6b6b6b';
  const gridColor = isDark ? '#333333' : '#ede2d3';

  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Прочитано книг',
        data: monthlyCounts,
        backgroundColor: '#2d6b45',
        hoverBackgroundColor: '#245238',
        borderRadius: 6
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
          ticks: {
            stepSize: 1,
            color: textColor
          },
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

function updateChartTheme() {
  if (monthlyChart) {
    renderChart();
  }
}

function renderReadingNow() {
  const container = document.getElementById('dashboardReadingList');
  const readingGrid = document.getElementById('readingBooksGrid');
  const emptyState = document.getElementById('readingEmptyState');

  const readingBooks = library.filter(b => b.status === 'reading');

  const html = readingBooks.map(b => {
    const total = b.totalPages || 1;
    const current = b.currentPage || 0;
    const percent = Math.min(100, Math.round((current / total) * 100));

    return `
      <div class="reading-card" onclick="openBookDetail('${b.id}')">
        <img class="book-cover" src="${b.coverUrl || getDefaultCover(b.title)}" alt="${escapeHtml(b.title)}">
        <div class="reading-card-content">
          <h4>${escapeHtml(b.title)}</h4>
          <span class="book-author-name">${escapeHtml(b.author)}</span>
          <div class="reading-mini-progress">
            <div class="reading-progress-text">
              <span>${current} з ${total} стор.</span>
              <span><strong>${percent}%</strong></span>
            </div>
            <div class="progress-bar-bg" style="height: 6px; margin-bottom: 8px;">
              <div class="progress-bar-fill" style="width: ${percent}%;"></div>
            </div>
          </div>
          <div class="reading-card-actions" onclick="event.stopPropagation()">
            <button class="btn-update-pages" onclick="promptUpdateProgress('${b.id}')">Оновити сторінку</button>
            <button class="btn-complete-quick" onclick="markAsFinished('${b.id}')">Прочитано ✓</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (container) {
    if (readingBooks.length === 0) {
      container.innerHTML = '<p class="progress-hint">Наразі немає книг у процесі читання. Додайте нову або оберіть зі списку бажань!</p>';
    } else {
      container.innerHTML = html;
    }
  }

  if (readingGrid && emptyState) {
    if (readingBooks.length === 0) {
      readingGrid.innerHTML = '';
      emptyState.style.display = 'flex';
    } else {
      readingGrid.innerHTML = html;
      emptyState.style.display = 'none';
    }
  }
}

function renderOtherSections() {
  const recentContainer = document.getElementById('dashboardRecentList');
  const finishedGrid = document.getElementById('finishedBooksGrid');
  const finishedEmpty = document.getElementById('finishedEmptyState');
  const wishlistGrid = document.getElementById('wishlistBooksGrid');
  const wishlistEmpty = document.getElementById('wishlistEmptyState');

  const recentBooks = [...library].reverse().slice(0, 4);
  if (recentContainer) {
    if (recentBooks.length === 0) {
      recentContainer.innerHTML = '<p class="progress-hint">Колекція поки порожня.</p>';
    } else {
      recentContainer.innerHTML = recentBooks.map(b => createSimpleBookCardHTML(b)).join('');
    }
  }

  const finishedBooks = library.filter(b => b.status === 'finished');
  if (finishedGrid && finishedEmpty) {
    if (finishedBooks.length === 0) {
      finishedGrid.innerHTML = '';
      finishedEmpty.style.display = 'flex';
    } else {
      finishedGrid.innerHTML = finishedBooks.map(b => createSimpleBookCardHTML(b)).join('');
      finishedEmpty.style.display = 'none';
    }
  }

  const wishlistBooks = library.filter(b => b.status === 'wishlist');
  if (wishlistGrid && wishlistEmpty) {
    if (wishlistBooks.length === 0) {
      wishlistGrid.innerHTML = '';
      wishlistEmpty.style.display = 'flex';
    } else {
      wishlistGrid.innerHTML = wishlistBooks.map(b => createSimpleBookCardHTML(b)).join('');
      wishlistEmpty.style.display = 'none';
    }
  }
}

function createSimpleBookCardHTML(b) {
  const statusLabels = {
    reading: 'Читаю',
    finished: 'Прочитано',
    wishlist: 'У планах'
  };

  return `
    <div class="book-card-item" onclick="openBookDetail('${b.id}')">
      <div class="book-card-cover-wrap">
        <img src="${b.coverUrl || getDefaultCover(b.title)}" alt="${escapeHtml(b.title)}">
        <span class="book-badge-status ${b.status}">${statusLabels[b.status] || b.status}</span>
      </div>
      <h4 class="book-card-title" title="${escapeHtml(b.title)}">${escapeHtml(b.title)}</h4>
      <span class="book-card-author">${escapeHtml(b.author)}</span>
      <div class="book-card-tags">
        <span class="tag-genre">${escapeHtml(b.genre || 'Література')}</span>
        <span>•</span>
        <span>${b.year || '—'}</span>
      </div>
      ${renderStarsHTML(b.rating || 0)}
      <div class="book-card-footer" onclick="event.stopPropagation()">
        <span>${b.totalPages || 0} ст.</span>
        <div class="book-action-icons">
          <button class="btn-card-action" onclick="openEditBook('${b.id}')" title="Редагувати">✏️</button>
          <button class="btn-card-action danger" onclick="deleteBook('${b.id}')" title="Видалити">🗑️</button>
        </div>
      </div>
    </div>
  `;
}

function renderStarsHTML(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '★';
    } else {
      stars += '<span class="star-empty">★</span>';
    }
  }
  return `<div class="star-rating-display" title="Рейтинг: ${rating}/5">${stars}</div>`;
}

function renderLibrarySection() {
  const container = document.getElementById('libraryBooksContainer');
  const emptyState = document.getElementById('libraryEmptyState');
  const emptyTitle = document.getElementById('libraryEmptyTitle');
  const emptyText = document.getElementById('libraryEmptyText');

  if (!container) return;

  container.className = `library-container ${libraryViewMode}-mode`;

  let books = [...library];

  if (libraryFilterStatus !== 'all') {
    books = books.filter(b => b.status === libraryFilterStatus);
  }

  if (librarySearchTerm) {
    const q = librarySearchTerm.toLowerCase();
    books = books.filter(b =>
      (b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.genre || '').toLowerCase().includes(q)
    );
  }

  books.sort((a, b) => {
    switch (librarySortOption) {
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '', 'uk');
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '', 'uk');
      case 'author-asc':
        return (a.author || '').localeCompare(b.author || '', 'uk');
      case 'year-desc':
        return (b.year || 0) - (a.year || 0);
      case 'year-asc':
        return (a.year || 0) - (b.year || 0);
      case 'rating-desc':
        return (b.rating || 0) - (a.rating || 0);
      case 'added-asc':
        return new Date(a.addedDate || 0) - new Date(b.addedDate || 0);
      case 'added-desc':
      default:
        return new Date(b.addedDate || 0) - new Date(a.addedDate || 0);
    }
  });

  if (books.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'flex';
      if (library.length === 0) {
        emptyTitle.textContent = 'Бібліотека порожня';
        emptyText.textContent = 'Додайте свою першу книгу за допомогою кнопки «Додати книгу»';
      } else {
        emptyTitle.textContent = 'Книг не знайдено';
        emptyText.textContent = 'За вказаними фільтрами або пошуковим запитом нічого не знайдено';
      }
    }
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const statusLabels = {
    reading: 'Читаю',
    finished: 'Прочитано',
    wishlist: 'У планах'
  };

  container.innerHTML = books.map(b => {
    if (libraryViewMode === 'list') {
      return `
        <div class="book-card-item" onclick="openBookDetail('${b.id}')">
          <div class="book-card-cover-wrap">
            <img src="${b.coverUrl || getDefaultCover(b.title)}" alt="${escapeHtml(b.title)}">
          </div>
          <div class="book-card-info-main">
            <h4 class="book-card-title">${escapeHtml(b.title)}</h4>
            <span class="book-card-author">${escapeHtml(b.author)}</span>
            <div class="book-card-tags">
              <span class="tag-genre">${escapeHtml(b.genre || 'Література')}</span>
              <span>•</span>
              <span>${b.year || '—'}</span>
            </div>
          </div>
          ${renderStarsHTML(b.rating || 0)}
          <span class="book-badge-status ${b.status}">${statusLabels[b.status] || b.status}</span>
          <div class="book-card-footer" onclick="event.stopPropagation()">
            <span>${b.totalPages || 0} ст.</span>
            <div class="book-action-icons">
              <button class="btn-card-action" onclick="openEditBook('${b.id}')" title="Редагувати">✏️</button>
              <button class="btn-card-action danger" onclick="deleteBook('${b.id}')" title="Видалити">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }

    return createSimpleBookCardHTML(b);
  }).join('');
}

function renderAll() {
  renderStatistics();
  renderYearlyProgress();
  renderChart();
  renderReadingNow();
  renderOtherSections();
  renderLibrarySection();
}

const bookModal = document.getElementById('bookModal');
const bookForm = document.getElementById('bookForm');
const detailModal = document.getElementById('bookDetailModal');

function setupModal() {
  const openButtons = document.querySelectorAll('.open-add-modal');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      openAddBookForm();
    });
  });

  const closeModal = () => bookModal.classList.remove('active');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  bookModal.addEventListener('click', (e) => {
    if (e.target === bookModal) closeModal();
  });

  const starBtns = document.querySelectorAll('#starRatingInput .star-btn');
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.value, 10);
      setStarRating(val);
    });
  });

  const statusSelect = document.getElementById('bookStatus');
  const finishedDateGroup = document.getElementById('finishedDateGroup');
  if (statusSelect && finishedDateGroup) {
    statusSelect.addEventListener('change', () => {
      if (statusSelect.value === 'finished') {
        finishedDateGroup.style.display = 'flex';
        const finishedDateInput = document.getElementById('bookFinishedDate');
        if (!finishedDateInput.value) {
          finishedDateInput.value = new Date().toISOString().split('T')[0];
        }
      } else {
        finishedDateGroup.style.display = 'none';
      }
    });
  }

  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateBookForm()) return;

    const id = document.getElementById('bookIdInput').value;
    const googleId = document.getElementById('bookGoogleIdInput').value || null;
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const genre = document.getElementById('bookGenre').value.trim();
    const yearVal = document.getElementById('bookYear').value.trim();
    const year = yearVal ? parseInt(yearVal, 10) : null;
    const totalPages = parseInt(document.getElementById('bookTotalPages').value, 10) || 0;
    const currentPageInput = document.getElementById('bookCurrentPage').value.trim();
    let currentPage = currentPageInput ? parseInt(currentPageInput, 10) : 0;
    const status = document.getElementById('bookStatus').value;
    const rating = parseInt(document.getElementById('bookRating').value, 10) || 0;
    let finishedDate = document.getElementById('bookFinishedDate').value || null;
    const coverUrl = document.getElementById('bookCoverUrl').value.trim();
    const description = document.getElementById('bookDescription').value.trim();

    if (status === 'finished') {
      currentPage = totalPages;
      if (!finishedDate) finishedDate = new Date().toISOString().split('T')[0];
    }

    if (id) {
      const idx = library.findIndex(b => b.id === id);
      if (idx !== -1) {
        library[idx] = {
          ...library[idx],
          title,
          author,
          genre,
          year,
          totalPages,
          currentPage,
          status,
          rating,
          finishedDate: status === 'finished' ? finishedDate : null,
          coverUrl: coverUrl || library[idx].coverUrl,
          description
        };
      }
    } else {
      const newBook = {
        id: 'book-' + Date.now(),
        googleId,
        title,
        author,
        genre,
        year,
        totalPages,
        currentPage,
        status,
        rating,
        finishedDate: status === 'finished' ? finishedDate : null,
        coverUrl: coverUrl || '',
        description,
        addedDate: new Date().toISOString().split('T')[0]
      };
      library.push(newBook);
    }

    saveLibrary();
    closeModal();
  });
}

function openAddBookForm() {
  bookForm.reset();
  clearFormErrors();
  document.getElementById('bookIdInput').value = '';
  document.getElementById('bookGoogleIdInput').value = '';
  document.getElementById('modalTitle').textContent = 'Додати нову книгу';
  document.getElementById('finishedDateGroup').style.display = 'none';
  setStarRating(0);
  bookModal.classList.add('active');
}

function setStarRating(val) {
  document.getElementById('bookRating').value = val;
  const starBtns = document.querySelectorAll('#starRatingInput .star-btn');
  starBtns.forEach(btn => {
    const btnVal = parseInt(btn.dataset.value, 10);
    if (btnVal <= val) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function clearFormErrors() {
  document.querySelectorAll('.form-error-msg').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('invalid'));
}

function validateBookForm() {
  clearFormErrors();
  let isValid = true;

  const title = document.getElementById('bookTitle');
  if (!title.value.trim()) {
    title.classList.add('invalid');
    document.getElementById('errBookTitle').textContent = 'Вкажіть назву книги';
    isValid = false;
  }

  const author = document.getElementById('bookAuthor');
  if (!author.value.trim()) {
    author.classList.add('invalid');
    document.getElementById('errBookAuthor').textContent = 'Вкажіть автора книги';
    isValid = false;
  }

  const genre = document.getElementById('bookGenre');
  if (!genre.value.trim()) {
    genre.classList.add('invalid');
    document.getElementById('errBookGenre').textContent = 'Вкажіть жанр або категорію';
    isValid = false;
  }

  const totalPages = document.getElementById('bookTotalPages');
  const pagesVal = parseInt(totalPages.value, 10);
  if (isNaN(pagesVal) || pagesVal <= 0) {
    totalPages.classList.add('invalid');
    document.getElementById('errBookTotalPages').textContent = 'Кількість сторінок має бути більше 0';
    isValid = false;
  }

  const currentPage = document.getElementById('bookCurrentPage');
  const currentVal = parseInt(currentPage.value, 10);
  if (!isNaN(currentVal) && (currentVal < 0 || (!isNaN(pagesVal) && currentVal > pagesVal))) {
    currentPage.classList.add('invalid');
    document.getElementById('errBookCurrentPage').textContent = 'Поточна сторінка не може перевищувати загальну кількість';
    isValid = false;
  }

  const yearInput = document.getElementById('bookYear');
  if (yearInput.value.trim()) {
    const yVal = parseInt(yearInput.value, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yVal) || yVal < 500 || yVal > currentYear + 1) {
      yearInput.classList.add('invalid');
      document.getElementById('errBookYear').textContent = `Введіть коректний рік (до ${currentYear + 1})`;
      isValid = false;
    }
  }

  const coverUrlInput = document.getElementById('bookCoverUrl');
  if (coverUrlInput.value.trim()) {
    try {
      new URL(coverUrlInput.value.trim());
    } catch (_) {
      coverUrlInput.classList.add('invalid');
      document.getElementById('errBookCoverUrl').textContent = 'Введіть коректну URL-адресу (http/https)';
      isValid = false;
    }
  }

  return isValid;
}

window.openEditBook = function(id) {
  const book = library.find(b => b.id === id);
  if (!book) return;

  clearFormErrors();
  document.getElementById('bookIdInput').value = book.id;
  document.getElementById('bookGoogleIdInput').value = book.googleId || '';
  document.getElementById('bookTitle').value = book.title || '';
  document.getElementById('bookAuthor').value = book.author || '';
  document.getElementById('bookGenre').value = book.genre || '';
  document.getElementById('bookYear').value = book.year || '';
  document.getElementById('bookTotalPages').value = book.totalPages || '';
  document.getElementById('bookCurrentPage').value = book.currentPage || 0;
  document.getElementById('bookStatus').value = book.status || 'reading';
  document.getElementById('bookFinishedDate').value = book.finishedDate || '';
  document.getElementById('bookCoverUrl').value = book.coverUrl || '';
  document.getElementById('bookDescription').value = book.description || '';

  const finishedGroup = document.getElementById('finishedDateGroup');
  if (book.status === 'finished') {
    finishedGroup.style.display = 'flex';
  } else {
    finishedGroup.style.display = 'none';
  }

  setStarRating(book.rating || 0);

  document.getElementById('modalTitle').textContent = 'Редагувати книгу';
  bookModal.classList.add('active');

  if (detailModal.classList.contains('active')) {
    detailModal.classList.remove('active');
  }
};

window.deleteBook = function(id) {
  const book = library.find(b => b.id === id);
  const title = book ? `«${book.title}»` : 'цю книгу';
  if (confirm(`Ви впевнені, що хочете видалити ${title} з вашої бібліотеки?`)) {
    library = library.filter(b => b.id !== id);
    saveLibrary();
    if (detailModal.classList.contains('active')) {
      detailModal.classList.remove('active');
    }
  }
};

window.promptUpdateProgress = function(id) {
  const book = library.find(b => b.id === id);
  if (!book) return;

  const current = prompt(`Введіть прочитану сторінку для «${book.title}» (всього ${book.totalPages}):`, book.currentPage || 0);
  if (current !== null) {
    const pageNum = parseInt(current, 10);
    if (!isNaN(pageNum) && pageNum >= 0) {
      book.currentPage = Math.min(pageNum, book.totalPages);
      if (book.currentPage >= book.totalPages) {
        book.status = 'finished';
        book.finishedDate = new Date().toISOString().split('T')[0];
      }
      saveLibrary();
    }
  }
};

window.markAsFinished = function(id) {
  const book = library.find(b => b.id === id);
  if (!book) return;

  book.status = 'finished';
  book.currentPage = book.totalPages;
  book.finishedDate = new Date().toISOString().split('T')[0];
  saveLibrary();
};

window.openBookDetail = function(id) {
  const book = library.find(b => b.id === id);
  if (!book) return;

  activeDetailBookId = id;
  const body = document.getElementById('bookDetailBody');
  const headerTitle = document.getElementById('detailHeaderTitle');

  const statusLabels = {
    reading: 'Читаю зараз',
    finished: 'Прочитано',
    wishlist: 'Хочу прочитати'
  };

  headerTitle.textContent = book.title;

  body.innerHTML = `
    <div class="book-detail-grid">
      <img src="${book.coverUrl || getDefaultCover(book.title)}" alt="${escapeHtml(book.title)}" class="book-detail-cover">
      <div class="book-detail-info">
        <h2>${escapeHtml(book.title)}</h2>
        <div class="detail-author">${escapeHtml(book.author)}</div>
        <div class="detail-metadata-chips">
          <span class="detail-chip">🏷️ ${escapeHtml(book.genre || 'Загальне')}</span>
          <span class="detail-chip">📅 ${book.year || 'Рік невідомий'}</span>
          <span class="detail-chip">📄 ${book.totalPages || 0} сторінок</span>
          <span class="detail-chip">📌 ${statusLabels[book.status] || book.status}</span>
        </div>
        ${renderStarsHTML(book.rating || 0)}
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">
          Прогрес: <strong>${book.currentPage || 0}</strong> з <strong>${book.totalPages || 0}</strong> стор.
          (${Math.min(100, Math.round(((book.currentPage || 0) / (book.totalPages || 1)) * 100))}%)
        </p>
        ${book.finishedDate ? `<p style="font-size: 12px; color: var(--color-finished); margin-top: 4px;">Завершено: ${book.finishedDate}</p>` : ''}
      </div>
    </div>
    <div class="detail-desc-box">
      <strong>Опис / Нотатки:</strong><br>
      ${escapeHtml(book.description || 'Опис для цієї книги ще не додано.')}
    </div>
  `;

  detailModal.classList.add('active');
};

function setupDetailModal() {
  const closeBtn = document.getElementById('closeDetailModalBtn');
  const closeActionBtn = document.getElementById('detailCloseBtn');
  const editBtn = document.getElementById('detailEditBtn');
  const deleteBtn = document.getElementById('detailDeleteBtn');

  const close = () => detailModal.classList.remove('active');

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (closeActionBtn) closeActionBtn.addEventListener('click', close);

  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) close();
  });

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (activeDetailBookId) {
        openEditBook(activeDetailBookId);
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (activeDetailBookId) {
        deleteBook(activeDetailBookId);
      }
    });
  }
}

function setupLibraryControls() {
  const searchInput = document.getElementById('libraryLocalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      librarySearchTerm = e.target.value.trim();
      renderLibrarySection();
    });
  }

  const pills = document.querySelectorAll('.library-status-pills .pill-btn');
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(btn => btn.classList.remove('active'));
      p.classList.add('active');
      libraryFilterStatus = p.dataset.filter;
      renderLibrarySection();
    });
  });

  const sortSelect = document.getElementById('librarySortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      librarySortOption = e.target.value;
      renderLibrarySection();
    });
  }

  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');

  if (viewGridBtn && viewListBtn) {
    if (libraryViewMode === 'list') {
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
    }

    viewGridBtn.addEventListener('click', () => {
      libraryViewMode = 'grid';
      localStorage.setItem(VIEW_MODE_KEY, 'grid');
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
      renderLibrarySection();
    });

    viewListBtn.addEventListener('click', () => {
      libraryViewMode = 'list';
      localStorage.setItem(VIEW_MODE_KEY, 'list');
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      renderLibrarySection();
    });
  }
}

function setupSettingsAndGoal() {
  const changeGoalBtn = document.getElementById('changeGoalBtn');
  if (changeGoalBtn) {
    changeGoalBtn.addEventListener('click', () => {
      const val = prompt('Вкажіть вашу річну ціль книг:', yearlyGoal);
      if (val !== null && !isNaN(val) && val > 0) {
        saveGoal(val);
      }
    });
  }

  const goalInput = document.getElementById('settingsGoalInput');
  if (goalInput) {
    goalInput.addEventListener('change', (e) => {
      saveGoal(e.target.value);
    });
  }

  const resetBtn = document.getElementById('resetDemoBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Скинути всі книги до початкових демо-значень?')) {
        library = [...DEMO_BOOKS];
        saveLibrary();
      }
    });
  }

  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const librarySection = document.getElementById('section-library');
      if (librarySection && librarySection.classList.contains('active')) {
        librarySearchTerm = q;
        const localInput = document.getElementById('libraryLocalSearch');
        if (localInput) localInput.value = q;
        renderLibrarySection();
      } else {
        librarySearchTerm = q;
        const localInput = document.getElementById('libraryLocalSearch');
        if (localInput) localInput.value = q;
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        librarySection.classList.add('active');
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.toggle('active', link.dataset.section === 'library');
        });
        renderLibrarySection();
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

function getDefaultCover(title) {
  return `https://via.placeholder.com/300x450/2d6b45/ffffff?text=${encodeURIComponent(title || 'Book')}`;
}

function getNoun(number, one, two, five) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) return five;
  n %= 10;
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return two;
  return five;
}

document.addEventListener('DOMContentLoaded', () => {
  loadInitialData();
  initTheme();
  setupNavigation();
  setupModal();
  setupDetailModal();
  setupLibraryControls();
  setupSettingsAndGoal();
  updateGreetingAndQuote();
  renderAll();
});