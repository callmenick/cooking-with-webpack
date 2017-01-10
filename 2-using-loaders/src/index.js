import './style.css';

import hello from './hello.js';

const input = document.querySelector('.js-add-hello');
const hellos = document.querySelector('#hellos');

input.addEventListener('keyup', e => {
  if (e.keyCode === 13) {
    hellos.insertAdjacentHTML('beforeend', hello(e.target.value));
    input.value = '';
  }
});
