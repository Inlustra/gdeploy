import { ChildProcess } from "child_process";


export interface Job {
    name: string
    description: string
    start: () => ChildProcess
  }
