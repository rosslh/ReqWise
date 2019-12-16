'use strict'

const fp = require('fastify-plugin')
const pg = require('fastify-postgres')

module.exports = fp(async (fastify, opts) => {
  const postgresOpts = Object.assign({}, {
    user: process.env.POSTGRES_USER || 'root',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DATABASE || 'reqwise',
    password: process.env.POSTGRES_PASSWORD || 'YDf!z9D*b^J84Z7gN(Jq',
    port: process.env.POSTGRES_PORT || '3211'
  }, opts.pg)

  fastify.register(pg, postgresOpts)
})
