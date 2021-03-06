import * as assert from 'assert'
import 'mocha'

import {Connection} from '.'
const db = new Connection({})

describe('db.CreateTable(...)', () => {
  const command = db.CreateTable('users')
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'CREATE TABLE users (  )')
  })
  it('should not be affected by add() call', () => {
    command.add('modified DATETIME')
    assert.equal(command.toSQL(), 'CREATE TABLE users (  )')
  })
  it('should be affected by _add() call', () => {
    command._add('modified DATETIME')
    assert.equal(command.toSQL(), 'CREATE TABLE users ( modified DATETIME )')
  })
})

describe('db.CreateTable(...).add(...)', () => {
  const command = db.CreateTable('users').add(
    'id SERIAL PRIMARY KEY',
    'created TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  )
  it('should equal literal string', () => {
    assert.equal(command.toSQL(),
      'CREATE TABLE users ( id SERIAL PRIMARY KEY, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP )')
  })
  it('modified version should have extra column', () => {
    const modified_command = command.add('modified DATETIME')
    assert.equal(modified_command.toSQL(),
      'CREATE TABLE users ( id SERIAL PRIMARY KEY, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, modified DATETIME )')
  })
})
