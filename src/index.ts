import app from './app'

//Initialization server
import './database'

app.listen(app.get('PORT'),()=>{
  console.log('server on port: ' + app.get('PORT'));
})