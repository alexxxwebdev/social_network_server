import { Router } from 'express'
import { Urls } from '../constants/Urls'
import fs from 'fs'

const router = Router()
router.get(Urls.upload,
    async (req, res) => {
        try {
            console.log('URL', req.url)
            fs.readFile(__dirname + req.url, function(err, file) {
                res.setHeader('Content-Type', 'image/png')
                res.end(file)
            })

           // res.status(201).json({ message: "Пользователь создан" })
        } catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так. Попробуйте еще.'})
        }
    })


export default router