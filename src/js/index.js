import '../css/style.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const input = document.querySelector('.search-input');
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more-btn');

const API_KEY = '31646623-01570f01238a20d01c1f98059';
let pageForBtn = 1;
let userInput = '';
let quantityOfValues = '';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
});

form.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onClick);

function onSubmit(event) {
  event.preventDefault();
  gallery.innerHTML = '';
  userInput = event.currentTarget.elements.searchQuery.value.trim();
  if (!loadMoreBtn.classList.contains('is-hidden')) {
    loadMoreBtn.classList.add('is-hidden');
  };
  if (userInput === '') {
    Notiflix.Notify.failure('Enter a query');
  } else {
    pageForBtn = 1;

    getUser(userInput).then(() => {
      if (quantityOfValues > 0) {
        Notiflix.Notify.success(`Hooray! We found ${quantityOfValues} images.`);
      };
      pageForBtn += 1;
      lightbox.refresh();
      input.value = '';
    });
  };
};

async function getUser(query) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageForBtn}`
    );
    if (response.data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    };
    let arr = response.data.hits;
    let lastPage = Math.ceil(response.data.totalHits / 40);
    quantityOfValues = response.data.totalHits;

    makeListCard(arr);

    if (response.data.total > 40) {
      loadMoreBtn.classList.remove('is-hidden');
    };
    if (pageForBtn === lastPage) {
      if (!loadMoreBtn.classList.contains('is-hidden')) {
        loadMoreBtn.classList.add('is-hidden');
      };
      if (response.data.total <= 40) {
        return;
      };
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    };
  } catch (error) {
    console.error(error);
  };
};

function makeListCard(data) {
  const markup = markupCard(data);
  gallery.insertAdjacentHTML('beforeend', markup);
};

function markupCard(data) {
  return data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
  <a class="gallery-link" href="${largeImageURL}"> 
  <img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
  </a>
</div>`
    )
    .join('');
};

function onClick(event) {
  event.preventDefault();
  getUser(userInput).then(() => {
    pageForBtn += 1;
    lightbox.refresh();
    const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  });
};