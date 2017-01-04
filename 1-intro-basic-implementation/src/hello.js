module.exports = function(name) {
  if (name === undefined) {
    name = 'World';
  }

  return 'Hello, ' + name + '!';
};
