import { MockRepository } from './MockRepository'
import type { Repository } from './repository'

export const repo: Repository = new MockRepository()
