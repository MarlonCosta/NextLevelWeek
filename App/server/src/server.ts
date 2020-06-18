import express, { response } from 'express';
import routes from './routes'


const app = express()

app.use(express.json())

app.use(routes)

const users = ['Calrton', 'Roberval', 'Rodinei']


app.listen(3333)