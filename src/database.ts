import mongoose, { ConnectOptions } from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
var URI = process.env.MONGOCLOUD ? process.env.MONGOCLOUD : 'mongodb://127.0.0.1/reports_mp' 

mongoose.connect((URI), { 
   useNewUrlParser: true,
   useUnifiedTopology: true
} as ConnectOptions)

.then(db => console.log('DB is connected on:',db.connection.host))
.catch(err => console.log(err))