const express = require('express')
const path = require('path')
const fs = require('fs')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})

const userSvc = require('./services/userDbService')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(cookieParser())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(logger('common'))

const publicUrls = ['/login', '/signup', '/']

app.use((req, res, next) => {
  console.log('#cookies:', req.cookies)
  if (publicUrls.indexOf(req.url) > -1) {
    return next()
  }
  if (req.cookies.user) {
    return next()
  }
  res.redirect('/login')
})

const newUser = {
  'name': '',
  'role': 'Guest',
  'email': '',
  'score': 0,
  'img': 'guest.png'
}

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/test', (req, res) => {
  res.send('<h1>How dare you test me like this!</h1>')
})

app.get('/users', (req, res) => {
  userSvc.list(users => {
    res.render('index', {users: users})
  })
})

app.get('/users/add', (req, res) => {
  res.render('edit', {user: newUser})
})

app.post('/users/add', upload.single('photo'), (req, res) => {
  console.log('#req.body:', req.body)
  console.log('#req.file:', req.file)
  req.body.photo = req.file
  userSvc.create(req.body, id => {
    res.redirect(id)
  })
})

app.get('/users/:id', (req, res) => {
  userSvc.detail(req.params.id, user => {
    if (!user.photo) {
      user.photo = {
        path: 'img/user.png'
      }
    }
    res.render('view', {user: user})
  })
})

app.get('/users/:id/del', (req, res) => {
  userSvc.remove(req.params.id, _ => {
    res.redirect('/users')
  })
})

app.get('/users/:id/edit', (req, res) => {
  userSvc.detail(req.params.id, user => {
    res.render('edit', {user: user})
  })
})

app.post('/users/:id/edit', upload.single('photo'), (req, res) => {
  if (req.file) {
    req.body.photo = req.file
  }
  userSvc.modify(req.params.id, req.body, _ => {
    res.redirect('/users/' + req.params.id)
  })
})

app.get('/signup', (req, res) => {
  res.render('signup', { error: ''} )
})

app.post('/signup', (req, res) => {
  console.log('#req.body:', req.body)
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.confirmPassword) {
    res.render('signup', { error: 'Something is missing' })
  }
  if (req.body.password !== req.body.confirmPassword) {
    res.render('signup', { error: 'Password doesn\'t match' })
  }
  userSvc.create(req.body, (err, id) => {
    if (err) {
      if (err.code === 11000) {
        return res.render('signup', { error: 'This email is already used.' })
      } else {
        return res.render('signup', { error: err.message })
      }
    }
    res.redirect('/')
  })
})

app.get('/login', (req, res) => {
  res.render('login', { error: ''} )
})

app.post('/login', (req, res) => {
  console.log('#req.body:', req.body)
  if (!req.body.email || !req.body.password) {
    res.render('login', { error: 'Something is missing' })
  }
  userSvc.findOneByEmail(req.body.email, (err, user) => {
    if (err) {
      return res.render('login', { error: err.message })
    }
    console.log('#user:', user)
    if (!user) {
      return res.render('login', { error: 'Unregistred Email' })
    }
    if (user.password !== req.body.password) {
      return res.render('login', { error: 'Incorrect Password' })
    }

    res.cookie('user', user) // make a cookie for user

    res.redirect('/')
  })
})

app.get('/logout', (req, res) => {
  res.clearCookie('user')
  res.redirect('/login')
})

app.listen(3000, () => {
  console.log('Express server running on port 3000')
})
