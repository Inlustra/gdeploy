import { load } from '@inlustra/env-args'

const defaultConfig = {
  port: 3000,
  debug: true,
  logConsole: false,
  allowedUsernames: [],
  thisWillBreak: undefined
}

const config = load(defaultConfig);


export default config
