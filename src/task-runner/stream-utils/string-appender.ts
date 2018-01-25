import * as through2 from 'through2'

function stringAppender(str: string) {
  return through2(function(chunk, enc, cb) {
    this.push(str+chunk)
    cb()
  })
}

export { stringAppender }
