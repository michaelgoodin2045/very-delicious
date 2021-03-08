import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores
    .map((store) => {
      return `
        <a href="/stores/${store.slug}" class="search__result">
            <strong>${store.name}</strong>
        </a>
        `;
    })
    .join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function () {
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';

    axios
      .get(`/api/v1/search?q=${this.value}`)
      .then((res) => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(
            searchResultsHTML(res.data)
          );
          return;
        }
        // Nothing came back
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search__result">No results for ${this.value} found!</div>`
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // keyboard inputs
  searchInput.on('keyup', ({ keyCode }) => {
    if (![38, 13, 40].includes(keyCode)) {
      return;
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (keyCode === 40) {
      next = items[0];
    } else if (keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (keyCode === 38) {
      next = items[items.length - 1];
    } else if (keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead;
