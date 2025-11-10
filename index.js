const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('./db')
const express = require('express')

const salt = 'secret-key'
const SECRET = 'this-is-for-JWT'

const app = express()

app.use(express.json())


const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) req.status(401).json({
        error: "Нет токена авторизации"
    })

    if (!(authHeader.split(" ")[1])) res.status(401).json({
        error: "Неверный формат токена"
    })

    try {
        const token = authHeader.split(" ")[1
            
        ]
    } catch (error) {
        console.error(error)
    }
}
app.post('/register', (req, res) => {
    const { email, name, password } = req.body

    try {
        if (!email || !name || !password) {
            return res.status(400).json({ error: 'Не хватает данных' })
        }
        const syncSalt = bcrypt.genSaltSync(10)
        const hashed = bcrypt.hashSync(password, syncSalt)
        const query = db.prepare(
            `INSERT INTO users (email, name, password) VALUES (?, ?, ?)`,
        )
        const info = query.run(email, name, hashed)
        const newUser = db
            .prepare(`SELECT * FROM users WHERE ID = ?`)
            .get(info.lastInsertRowid)
        res.status(201).json(newUser)
    } catch (error) {
        console.error(error)
    }
})

app.post('/login', (req, res) => {
    try {
        const { email, password } = req.body

        const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email)

        if (!user) res.status(401).json({ error: 'Неправильные данные' })

        const valid = bcrypt.compareSync(password, user.password)

        if (!valid) res.status(401).json({ error: 'Неправильные данные' })

        const token = jwt.sign({ ...user }, SECRET, { expiresIn: '24h' })

        const { password: p, ...response } = user

        res.status(200).json({ token: token, ...response })
        res.json(token)

    } catch (error) {
        console.error(error)
    }
})

app.get('/', (_, res) => {
    res.send('Hello world')
})

app.post('/', (req, res) => {
    console.log(req.body)
    res.send('Успех')
})

app.get('/users', (_, res) => {
    const data = db.prepare('SELECT * FROM users').all()
    res.json(data)
})

app.delete('/users/:id', (req, res) => {
    const { id } = req.params
    const query = db.prepare(`DELETE FROM users WHERE id = ?`)
    const result = query.run(id)

    if (result.changes === 0)
        res.status(404).json({ error: 'Пользователь не был найден' })

    res.status(200).json({ message: 'Юзер успешно удален' })
})

app.get('/todos', (_, res) => {
    const data = db.prepare('SELECT * FROM todos').all()
    res.json(data)
})

app.delete('/todos', (req, res) => {
    const { id } = req.params
    const query = db.prepare(`DELETE FROM todos WHERE id = ?`)
    const result = query.run(id)

    if (result.changes === 0)
        res.status(404).json({ error: 'Задача не был найдена' })

    res.status(200).json({ message: 'Задача успешно удалена' })
})

app.post('/todos', (req, res) => {
    const { name, status } = req.body

    try {
        if (!name) {
            return res.status(400).json({ error: 'Не хватает данных' })
        }
        const query = db.prepare(
            `INSERT INTO todos (status, name) VALUES (?, ?)`,
        )
        const info = query.run(status, name)
        const newUser = db
            .prepare(`SELECT * FROM todos WHERE ID = ?`)
            .get(info.lastInsertRowid)
        res.status(201).json(newUser)
    } catch (error) {
        console.error(error)
    }
})

app.delete('/users/:id', (req, res) => {
    const { id } = req.params
    const query = db.prepare(`DELETE FROM users WHERE id = ?`)
    const result = query.run(id)

    if (result.changes === 0)
        res.status(404).json({ error: 'Пользователь не был найден' })

    res.status(200).json({ message: 'Юзер успешно удален' })
})

app.patch('/todos/:id/toggle', (req, res) => {
    try {
        const { id } = req.params
        const query = db.prepare(
            `UPDATE todos SET status = 1 - status WHERE id = ?`,
        )
        const result = query.run(id)

        if (result.changes === 0)
            res.status(404).json({ error: 'Задачи не было найдено' })

        res.status(200).json({ message: 'Задача обновлена' })
    } catch (error) {
        console.error(error)
    }
})

app.listen('3000', () => {
    console.log('Сервер запущен на порту 3000')
})

