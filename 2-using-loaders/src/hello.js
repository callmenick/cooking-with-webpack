import './hello.css';

import helloTpl from './hello.hbs';

export default function(name = 'World') {
  return helloTpl({
    name: name
  });
};
