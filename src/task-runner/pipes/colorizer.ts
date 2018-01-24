import * as through2 from 'through2'
import chalk from 'chalk'

function coloriseStream(colour: string) {
  return through2(function(chunk, enc, cb) {
    this.push(chalk[colour](chunk))
    cb()
  })
}

const red = coloriseStream('red')

export { red }
