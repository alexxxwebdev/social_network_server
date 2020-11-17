import { Router} from 'express'
import multer from 'multer'
import path from 'path'
import { Urls } from '../constants/Urls'

const router = Router()

const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'upload')
        },
        filename: (req, file, cb ) => {
            cb(null, Date.now() + path.extname(file.originalname))
        }
    })

const upload = multer({
    storage,
    limits: {
        fieldSize: 2 * 1024* 1024
    },
    fileFilter: function (req, file, callback) {
        console.log('FILE', file)
        const ext = path.extname(file.originalname)
        console.log('EXT', ext)
        if (ext !== '.jpg' || ext !== '.jpeg' || ext !== '.png') {
            const error = new Error('Extention')
            error.code = 'EXTENTION'
            console.log('KKK', error)
            return callback(null, true)
        }
    }
}).single('file')

router.post(Urls.addImg, ( req, res ) => {
    upload(req, res, err => {
        let error = ''
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                error = 'Картинка не более 2 Мб'
            }
            if (err.code === 'EXTENTION') {
                error = 'Только jpeg и png'
            }
        }
        res.status(400).json({
            ok: !error,

        })
    })
})

export default router
