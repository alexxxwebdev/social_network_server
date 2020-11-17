import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import config from 'config'
import jwt from 'jsonwebtoken'
import { validationResult, check }  from 'express-validator'
import User from '../models/User'
import { Urls } from '../constants/Urls'

const router = Router()
router.post(Urls.register,
    [
        check('email', 'Введен некорректный email').isEmail(), //валидация почты
        check('password', 'Количество символов должно быть не меньше 6').isLength({ min: 6 }) // пароля
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req) // получаем ошибки после валидации

            // проверка на ошибки и отправление на фронт в случае их появления
            if(!errors.isEmpty()) {
                return res.status(324).json({
                    errors: errors.array(),
                    message: 'Введены некорректные данные регистрации' })
            }

            const { email, password } = req.query

            const candidate = await User.findOne( {email} ) // поиск в монго существующего пользователя по email

            if (candidate) {
                return res.status(400).json({ message: "Такой пользователь уже существует" })
            }
            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({ email, password: hashedPassword }) // создаем нового пользователя предварительно пройдя проверки на существующего пользователя
            await user.save() //сохраниние в базу пользователя

            res.status(201).json({ message: "Пользователь создан" })
        } catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так. Попробуйте еще.'})
        }
    })

router.post(Urls.login,
    [
        check('email', 'Введен некорректный email').normalizeEmail().isEmail(), //валидация почты
        check('password', 'Введите пароль').exists()// пароля
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req) // получаем ошибки после валидации

            // проверка на ошибки и отправление на фронт в случае их появления
            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Введены некорректные данные регистрации' })
            }

            const { email, password } = req.query

            const user = await User.findOne({ email })

            if(!user) {
                return res.status(400).json({ message: "Пользователя не существует" })
            }

            const isMatch = bcrypt.compare(password, user.password)

            if(!isMatch) {
                return res.status(400).json({ message: "Указаны неверный логин или пароль" })
            }

            //Создание токена если пользователь найден
            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            )

            return res.json({ userId: user.id, token }) // отправка токена на фронт


        } catch (e) {
            console.log('ERROR', e)
            return res.status(500).json({ message: 'Что-то пошло не так. Попробуйте еще.'})
        }
    })



export default router