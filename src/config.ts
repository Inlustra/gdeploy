import { load } from '@inlustra/env-args'

const defaultConfig = {
  port: 3000,
  debug: true,
  logConsole: false,
  allowedUsernames: []
}

const config = load(defaultConfig);
console.log(config);

export default config
