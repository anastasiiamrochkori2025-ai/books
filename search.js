let currentSearchResults = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('googleSearchForm');
  const input = document.getElementById('apiSearchQuery');
  const filterGenre = document.getElementById('filterGenre');
  const filterYear = document.getElementById('filterYear');
  const sortTitle = document.getElementById('sortTitle');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      await executeBookSearch(query);
    });
  }

  if (filterGenre) filterGenre.addEventListener('change', applyFiltersAndRender);
  if (filterYear) filterYear.addEventListener('change', applyFiltersAndRender);
  if (sortTitle) sortTitle.addEventListener('change', applyFiltersAndRender);
});

async function executeBookSearch(query) {
  const initialNotice = document.getElementById('searchEmptyInitial');
  const loadingIndicator = document.getElementById('searchLoadingIndicator');
  const errorNotice = document.getElementById('searchErrorNotice');
  const noResultsNotice = document.getElementById('searchNoResultsNotice');
  const filtersBlock = document.getElementById('searchFiltersBlock');
  const resultsGrid = document.getElementById('searchResultsGrid');

  if (initialNotice) initialNotice.style.display = 'none';
  if (errorNotice) errorNotice.style.display = 'none';
  if (noResultsNotice) noResultsNotice.style.display = 'none';
  if (resultsGrid) resultsGrid.innerHTML = '';
  if (loadingIndicator) loadingIndicator.style.display = 'flex';

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=24`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Помилка мережі: ${response.status}`);
    }

    const data = await response.json();
    loadingIndicator.style.display = 'none';

    if (!data.items || data.items.length === 0) {
      if (noResultsNotice) noResultsNotice.style.display = 'flex';
      if (filtersBlock) filtersBlock.style.display = 'none';
      currentSearchResults = [];
      return;
    }

    currentSearchResults = data.items.map(item => normalizeGoogleBook(item));
    populateFilterOptions(currentSearchResults);
    if (filtersBlock) filtersBlock.style.display = 'flex';

    applyFiltersAndRender();
  } catch (err) {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (errorNotice) errorNotice.style.display = 'flex';
    if (filtersBlock) filtersBlock.style.display = 'none';
  }
}

function normalizeGoogleBook(item) {
  const info = item.volumeInfo || {};
  let year = '';
  if (info.publishedDate) {
    const match = info.publishedDate.match(/^(\d{4})/);
    if (match) year = match[1];
  }

  let cover = '';
  if (info.imageLinks) {
    cover = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
    if (cover.startsWith('http://')) {
      cover = cover.replace('http://', 'https://');
    }
  }

  return {
    googleId: item.id || '',
    title: info.title || 'Без назви',
    author: (info.authors && info.authors.length) ? info.authors.join(', ') : 'Невідомий автор',
    year: year || 'Невідомий рік',
    categories: (info.categories && info.categories.length) ? info.categories : ['Загальне'],
    description: info.description || 'Опис цієї книги відсутній.',
    totalPages: parseInt(info.pageCount, 10) || 0,
    coverUrl: cover
  };
}

function populateFilterOptions(books) {
  const genreSelect = document.getElementById('filterGenre');
  const yearSelect = document.getElementById('filterYear');

  const genres = new Set();
  const years = new Set();

  books.forEach(b => {
    b.categories.forEach(cat => genres.add(cat.trim()));
    if (b.year && b.year !== 'Невідомий рік') {
      years.add(b.year);
    }
  });

  if (genreSelect) {
    genreSelect.innerHTML = '<option value="all">Усі категорії</option>';
    Array.from(genres).sort().forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      genreSelect.appendChild(opt);
    });
  }

  if (yearSelect) {
    yearSelect.innerHTML = '<option value="all">Усі роки</option>';
    Array.from(years).sort((a, b) => b - a).forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });
  }
}

function applyFiltersAndRender() {
  const genreVal = document.getElementById('filterGenre')?.value || 'all';
  const yearVal = document.getElementById('filterYear')?.value || 'all';
  const sortVal = document.getElementById('sortTitle')?.value || 'default';
  const resultsGrid = document.getElementById('searchResultsGrid');
  const noResultsNotice = document.getElementById('searchNoResultsNotice');

  let filtered = [...currentSearchResults];

  if (genreVal !== 'all') {
    filtered = filtered.filter(b => b.categories.includes(genreVal));
  }

  if (yearVal !== 'all') {
    filtered = filtered.filter(b => b.year === yearVal);
  }

  if (sortVal === 'asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
  } else if (sortVal === 'desc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title, 'uk'));
  }

  if (filtered.length === 0) {
    resultsGrid.innerHTML = '';
    if (noResultsNotice) noResultsNotice.style.display = 'flex';
    return;
  }

  if (noResultsNotice) noResultsNotice.style.display = 'none';
  resultsGrid.innerHTML = filtered.map(b => renderSearchCardHTML(b)).join('');
}

function isBookAlreadyInLibrary(book) {
  if (typeof library === 'undefined' || !Array.isArray(library)) return false;

  return library.some(existing => {
    if (book.googleId && existing.googleId && existing.googleId === book.googleId) {
      return true;
    }
    const cleanCurrentTitle = book.title.trim().toLowerCase();
    const cleanExistingTitle = (existing.title || '').trim().toLowerCase();
    const cleanCurrentAuthor = book.author.trim().toLowerCase();
    const cleanExistingAuthor = (existing.author || '').trim().toLowerCase();

    return cleanCurrentTitle === cleanExistingTitle && cleanCurrentAuthor === cleanExistingAuthor;
  });
}

function renderSearchCardHTML(book) {
  const alreadyAdded = isBookAlreadyInLibrary(book);
  const jsonPayload = encodeURIComponent(JSON.stringify(book));

  const coverMarkup = book.coverUrl
    ? `<img src="${book.coverUrl}" alt="${escapeSearchHtml(book.title)}" class="api-book-cover-img" loading="lazy">`
    : `
      <div class="api-book-cover-fallback">
        <span class="fallback-badge">BookNest</span>
        <span class="fallback-title">${escapeSearchHtml(book.title)}</span>
      </div>
    `;

  return `
    <div class="api-book-card">
      <div class="api-book-cover-wrapper">
        ${coverMarkup}
      </div>
      <div class="api-book-info">
        <h4 class="api-book-title" title="${escapeSearchHtml(book.title)}">${escapeSearchHtml(book.title)}</h4>
        <div class="api-book-author">${escapeSearchHtml(book.author)}</div>
        <div class="api-book-meta">
          <span class="meta-chip">📅 ${book.year}</span>
          <span class="meta-chip">📄 ${book.totalPages > 0 ? book.totalPages + ' ст.' : 'К-сть не вказана'}</span>
          <span class="meta-chip">🏷️ ${escapeSearchHtml(book.categories[0] || 'Загальне')}</span>
        </div>
        <p class="api-book-desc">${escapeSearchHtml(book.description)}</p>
        <div class="api-book-action-row">
          <select class="status-quick-select" id="status-${book.googleId || Math.random().toString(36).substr(2, 6)}" ${alreadyAdded ? 'disabled' : ''}>
            <option value="wishlist">Хочу прочитати</option>
            <option value="reading">Читаю зараз</option>
            <option value="finished">Прочитано</option>
          </select>
          <button class="btn-primary btn-add-library" 
                  onclick="handleAddApiBook('${jsonPayload}', this)"
                  ${alreadyAdded ? 'disabled' : ''}>
            ${alreadyAdded ? 'Вже у бібліотеці ✓' : '+ Додати'}
          </button>
        </div>
      </div>
    </div>
  `;
}

window.handleAddApiBook = function(encodedBook, btnElement) {
  try {
    const bookData = JSON.parse(decodeURIComponent(encodedBook));
    if (isBookAlreadyInLibrary(bookData)) {
      alert(`Книга «${bookData.title}» уже є у вашій бібліотеці.`);
      btnElement.disabled = true;
      btnElement.textContent = 'Вже у бібліотеці ✓';
      return;
    }

    const selectEl = btnElement.parentElement.querySelector('.status-quick-select');
    const selectedStatus = selectEl ? selectEl.value : 'wishlist';

    const newBook = {
      id: 'book-' + Date.now(),
      googleId: bookData.googleId || null,
      title: bookData.title,
      author: bookData.author,
      totalPages: bookData.totalPages || 0,
      currentPage: selectedStatus === 'finished' ? (bookData.totalPages || 0) : 0,
      status: selectedStatus,
      finishedDate: selectedStatus === 'finished' ? new Date().toISOString().split('T')[0] : null,
      coverUrl: bookData.coverUrl || '',
      addedDate: new Date().toISOString().split('T')[0]
    };

    library.push(newBook);
    if (typeof saveLibrary === 'function') {
      saveLibrary();
    }

    btnElement.disabled = true;
    btnElement.textContent = 'Додано ✓';
    if (selectEl) selectEl.disabled = true;
  } catch (e) {
    alert('Помилка при збереженні книги.');
  }
};

function escapeSearchHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}