module.exports = url =>
  require('superagent-use')(require('superagent'))
    .use(require('superagent-prefix')(url))
