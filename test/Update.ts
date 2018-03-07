import * as assert from 'assert'
import 'mocha'

import {Connection} from '.'
const db = new Connection({})

describe('db.Update(...).setEqual(...).where(...)', () => {
  const command = db.Update('users').setEqual({name: 'Chris'}).where('id = 1').returning('*')
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'UPDATE users SET name = $name WHERE id = 1 RETURNING *')
    assert.deepEqual(command.parameters, {name: 'Chris'})
  })
})

describe('db.Update(...).setEqual(...).whereEqual(...)', () => {
  const command = db.Update('users').setEqual({fn: 'Chris', ln: 'Brown'}).whereEqual({active: true}).returning('*')
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'UPDATE users SET fn = $fn, ln = $ln WHERE active = $active RETURNING *')
    assert.deepEqual(command.parameters, {fn: 'Chris', ln: 'Brown', active: true})
  })
})

describe('db.UpdateOne(...)', () => {
  const command = db.UpdateOne('users').setEqual({name: 'Chris'}).where('id = 1').returning('*')
  it('should equal literal string, same as db.Update(...)', () => {
    assert.equal(command.toSQL(), 'UPDATE users SET name = $name WHERE id = 1 RETURNING *')
    assert.deepEqual(command.parameters, {name: 'Chris'})
  })
})
