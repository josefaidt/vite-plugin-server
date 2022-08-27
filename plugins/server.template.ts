import express from 'express'
import { app } from '$server'

const server = express()
server.use(express.static('.'))
server.use(app)
