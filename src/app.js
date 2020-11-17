import config from 'config'
import { connect } from 'mongoose'

import authRouter from './routes/auth.routes'
import imgRouter from './routes/image.routes'
import uploadRouter from './routes/upload.routes'
import express from 'express'

var bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use('/api/auth', authRouter)
app.use('/api/add', imgRouter)
app.use('/api', uploadRouter)

const PORT = config.get('port') || 5000
const mongoUri = config.get('mongoUri')

const start = async () => {
    try {
        await connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
    }catch (e) {
        console.log('Error connection with MongoDB', e)
        process.exit(1)
    }
}

start()

app.listen(PORT, () => console.log(`Server worked on ${PORT}`))