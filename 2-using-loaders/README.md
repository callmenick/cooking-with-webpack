# Understanding & Using Webpack Loaders

In [part 1](https://github.com/callmenick/cooking-with-webpack/tree/master/1-intro-basic-implementation), we plunged into webpack and gained a better understanding of what it is and some of its capabilities. We were able to write a script, require a module in it, and output a bundle using webpack. One really important takeaway from all of that was that we **bundled** up some **modules**. At this point, it's time to understand that a module can refer to many different things, not just a JavaScript file. Out of the box, webpack only supports JavaScript modules. But what if we wanted to bundle up some CSS in our output file? What if we wanted to grab some HTML templates from HTML files for usage in our script? Enter loaders.

## What is a Loader?

[According to the docs:](https://webpack.js.org/loaders/)

> Webpack enables use of loaders to preprocess files. This allows you to bundle any static resource way beyond JavaScript.

In other words, by using a loader, we can tell webpack to apply *transformations* to certain file types, and load it into the output. For example, if we used a CSS loader, we could require a CSS file in any of our JavaScript files. Then, webpack would step in, transform it to parsable JavaScript, and spit out the bundle. Webpack has a [ton of loaders](https://webpack.js.org/loaders/) ready for you to use. Let's take a look at some of them by implementing them and observing the output.

## Syntax of a Loader Configuration

In our configuration file, we need a new key called `module`. This is where we will place all our loaders, which are stored as an array with key `loaders`. We'll be building upon our work in part 1, so go ahead and copy over the files. For quick reference, our file should now look like this:

```javascript
module.exports = {
  entry: path.join(__dirname, 'src/index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.bundle.js'
  },
  module: {
    loaders: []
  }
};
```

In the most basic sense, each loader is represented as an object with a RegEx test followed by a string or array of loaders to apply. For example:

```javascript
loaders: [
  {
    test: /\.extension$/,
    loader: 'some-loader'
  },
  {
    test: /\.differentextension$/,
    loaders: ['some-loader', 'another-loader']
  }
]
```

A particular point of interest comes in the second loader configuration. We're able to chain loaders together, which is sometimes useful and necessary. Let's add our first loader and put it to the test.

## Basic Templates with the HTML Loader

Let's imagine a scenario where we have a simple JavaScript application, and based on some user's interactions, we want to display some HTML template. For the sake of separating our concerns, we wanted our HTML to reside in its own file, and for us to some how be able to require it and bundle it in on demand. The [HTML loader ](https://github.com/webpack/html-loader) is the perfect tool for the job. Let's go ahead and install it:

```console
npm install html-loader --save-dev
```

Now over in our webpack configuration, let's add the loader:

```javascript
{
  test: /\.html$/,
  loader: 'html'
}
```

Now, let's create the HTML template in `src/hello.html`:

```html
<h1>Hello!</h1>
<p>Welcome to this awesome application. I hope you enjoy it.</p>
<button>More awesome</button>
```

Over in our entry file `src/index.js`, let's remove what we had before for now. Now, let's simply observe what happens when we require the HTML template and log it to the console:

```javascript
var hello = require('./hello.html');

console.log(hello);
```

Now, let's create our bundle by running:

```console
npm run build
```

Let's observe the `dist/index.bundle.js` file to see what happened during bundling. If we scroll down to the first module, we'll see that we're assigning the result of `__webpack_require__(1)` to the variable `hello`. Then, in the second module (which is at index 1 in the array), we can see that the loader applied the correct transformations to the HTML template, and converted it to a string with the necessary new line characters. Let's witness that first hand by running our bundle in node:

```console
node dist/index.bundle.js

output:

<h1>Hello!</h1>
<p>Welcome to this awesome application. I hope you enjoy it.</p>
<button>More awesome</button>
```

Naturally, if we're using HTML, we'd want to inject it into the DOM somehow, so let's do that. Let's create a basic web page:

```
touch index.html
```

In it, let's outline a basic HTML5 app, and include a div to add our HTML to, and a reference to the bundled JavaScript:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cooking With Webpack Part 2 - Using Loaders</title>
</head>
<body>
  <div id="app"></div>
  <script src="dist/index.bundle.js"></script>
</body>
</html>
```

Back in our `src/index.js` file, let's write some simple JavaScript to inject the template in our app when the script runs:

```javascript
var hello = require('./hello.html');
var app = document.querySelector('#app');

app.innerHTML = hello;
```

Save, compile using `npm run build`, and now open up `index.html` in the browser. If you're like me, and you get extremely happy with simple successes, then what you see in the browser should make you jump off your seat in excitement. We've successfully included an HTML template in our JavaScript, transformed it with a loader, and used it in our bundled script to inject it into the DOM.

## Injecting Styles with the Style and CSS Loader

Apps and websites are pretty boring with plain old rendered HTML. Let's load some styles into our app and make it look pretty!

*Sidenote: In the example that follows, we're going to be requiring CSS in our JavaScript, and injecting it into the DOM directly. There's a lot of hot debate about this methodology. On one hand, if the CSS is small enough, then it saves an HTTP request round trip. On the other, if it's huge, then it can be a lot to handle. For now, we're going to inject it into the DOM, but when we look at plugins in the future, we'll see how we can use webpack to spit out a traditional stylesheet based on our bundle requirements.*

When working with styles, there are two loaders that need to be considered:

1. The [style loader](https://github.com/webpack/style-loader) - injects CSS into the DOM by adding a `style` tag
2. The [CSS loader](https://github.com/webpack/css-loader) - interprets CSS properly and resolves paths etc

Let's install both of them:

```console
npm install style-loader css-loader --save-dev
```

Now, let's configure webpack to use the loaders:

```javascript
{
  test: /\.css$/,
  loaders: ['style', 'css']
}
```

This time, we used an array of loaders. Webpack allows us to chain loaders by adding multiple loaders to an array with key `loaders`, instead of just the one `loader`. Next up, let's create our first stylesheet:

```console
touch src/style.css
```

And let's populate it with some basic styles:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 10px;
}

body {
  font-family: sans-serif;
  font-size: 1.6rem;
}
```

Over in our entry file, let's require the styles at the top:

```javascript
// index.js
require('./style.css');

var hello = require('./hello.html');
var app = document.querySelector('#app');

app.innerHTML = hello;
```

Now, let's build using `npm run build`, and open up `index.html` in the browser. You should see the styles applied. Exciting! Let's look under the hood in `dist/index.bundle.js`. Webpack creates another module for us that gets loaded with the `__webpack_require__` when it's needed. This time, it transforms our stylesheet into readable JavaScript, then it runs through it, parses it, and injects it as a `style` tag into the DOM's `head` tag. If you open up the elements tab in the browser console, you'll see that the styles are indeed there. Sweet!

Let's go a step further and refactor our app a little. Over in our `index.html` file, let's add a button and a container that'll render some hellos for us:

```html
<button class="js-add-hello">Add Hello</button>
<div id="hellos"></div>
```

Now, in our `hello.js` file, let's comment out what we had before for now, and just let our module require some css, and return the hello template:

```javascript
require('./hello.css');

module.exports = function() {
  return require('./hello.html');
};
```

We're going to need to create that `hello.css` file, so go ahead and do that:

```console
touch src/hello.css
```

Now, populate it:

```css
.Hello {
  margin: 2rem 0;
  padding: 2rem;
  border: solid 1px #ddd;
}

.Hello-title {
  margin-bottom: 1rem;
  font-size: 1.6rem;
}
```

In our `hello.html` template, let's change it up to this for now:

```html
<div class="Hello">
  <h3 class="Hello-title">Hello, World!</h3>
  <p>The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.</p>
</div>
```

And now, finally, in our entry `index.js` file, let's tie it all together:

```javascript
require('./style.css');

var hello = require('./hello.js');

var button = document.querySelector('.js-add-hello');
var hellos = document.querySelector('#hellos');

button.addEventListener('click', function(e) {
  e.preventDefault();

  hellos.insertAdjacentHTML('beforeend', hello());
});
```

Let's bundle it all up using `npm run build`, and now let's open up the `index.html` file in the browser. Voila, we have a working app!

You're probably thinking that a lot of what we just did has nothing to do with webpack. I'd like to point out otherwise though. Sure, we could've written all of this in on JavaScript file and one CSS file. However, what we did accomplish is that we've exposed some of webpack's true powers. We were able to truly separate our concerns here, and group together the markup, styling, and logic of the "hello" component. Webpack allowed us to work on our "hello" component in isolation, and bundle it up with the rest of our project code later on.

To prove this point a bit, let's work solely on our "hello" component. For it to be more template-like, let's use handlebars instead of just plain old HTML:

```console
npm install handlebars handlebars-loader --save-dev
cp src/hello.html src/hello.hbs
```

In our webpack config, let's enable handlebars transformations:

```javascript
{
  test: /\.hbs$/,
  loader: 'handlebars'
}
```

Now, in our handlebars template, let's add a `name` variable:

```handlebars
<div class="Hello">
  <h3 class="Hello-title">Hello, {{name}}!</h3>
  <p>The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.</p>
</div>
```

Let's change up our `hello.js` module now to accept a name, and render the handlebars template with that name:

```javascript
require('./hello.css');

module.exports = function(name) {
  if (name === undefined) {
    name = 'World';
  }

  return require('./hello.hbs')({
    name: name
  });
};
```

If we build and refresh the page, we should still see the same result, which is good! We've successfully worked on our component in isolation, accessing the relevant files we needed, when we needed. Let's quickly edit our entry file now to put the component to better use. First though, let's add an input field to our `index.html` file:

```html
<input type="text" class="Input js-add-hello" placeholder="Type a name and hit enter">
```

And now, the JavaScript:

```javascript
var input = document.querySelector('.js-add-hello');
var hellos = document.querySelector('#hellos');

input.addEventListener('keyup', function(e) {
  if (e.keyCode === 13) {
    hellos.insertAdjacentHTML('beforeend', hello(e.target.value));
    input.value = '';
  }
});
```

Build, refresh, and voila. Beautiful.

## Moving to Modern JavaScript with the Babel Loader

To wrap this all up, I'm going to introduce to you one more loader that'll allow you to write next generation JavaScript using [babel](http://babeljs.io/). Babel is a JavaScript compiler that gives us a large configuration set. We'll keep it simple for now though. As with all other loaders, we need the [babel loader](https://github.com/babel/babel-loader), as well as some other dependencies based on their docs:

```console
npm install babel-loader babel-core babel-preset-es2015 --save-dev
```

The `babel-loader` package is required for the actual loading in webpack, the `babel-core` package is required to actually compile the JavaScript, and the `babel-preset-es2015` package is required so that we have a preset to base off of. In our webpack configuration file, we can set up the loader like this:

```javascript
{
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  query: {
    presets: ['es2015']
  }
}
```

This time, we're using two more loader properties:

1. `exclude` to specify via RegEx what to exclude from the transformation
2. `query` to send some information to the babel configuration

Now, we can change up all our JavaScript:

```javascript
// index.js
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

// hello.js
import './hello.css';

import helloTpl from './hello.hbs';

export default function(name = 'World') {
  return helloTpl({
    name: name
  });
};
```

Build, refresh the browser, and boom! More awesome magic. We're now able to write next generation JavaScript wherever we want thanks to webpack's loading and transformation functionality in tandem with babel. Exciting stuff!

## Wrap Up

Phew! This time, we plunged into the world of loaders and saw how they apply transformations to our bundles. Loaders are extremely important in the world of webpack, and I hope I've imparted enough wisdom for you to go out in the wild and configure them yourself.
