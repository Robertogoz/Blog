const Express = require('express');
const User = require('./User');
const router = Express.Router();
const bcrypt = require('bcryptjs');
const adminAuth = require('../middleware/adminAuth');
const Category = require('../Categories/Category');

router.get('/admin/users',adminAuth,(req,res) => {
    User.findAll().then(users => {
        res.render('admin/users/index', {users: users});
    });
});

router.get('/admin/users/new', adminAuth,(req,res) => {
    res.render('admin/users/new');
});

router.post('/user/create', adminAuth,(req,res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({where:{email:email}}).then(user => {
        if(user == undefined) {
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password,salt);

            User.create({
                email:email,
                password: hash
            }).then(() => {
                res.redirect('/admin/users');
            }).catch(err => {
                res.redirect('/admin/users/new');
            })
        } else {
            res.redirect('/admin/users/create');
        }
    });
});

router.delete('/user/delete', adminAuth,(req,res) =>{
    let id = req.body.id;

    if(id != undefined) {
        if(!isNaN(id)) {
            User.destroy({where: {id:id}}).then(() => {
                res.redirect('/admin/users');
            })
        } else {
            res.redirect('/admin/users');
        }
    } else {
        res.redirect('/admin/users');
    }
});

router.get('/admin/users/edit/:id', adminAuth, (req,res) => {
    let id = req.params.id;

    if(isNaN(id)) {
        res.redirect('/admin/users');
    }

    User.findByPk(id).then(users => {
        if(id != undefined) {
            res.render('admin/users/edit', {users:users});
        } else {
            res.redirect('/admin/users');
        }
    });
});

router.put('/user/edit', adminAuth, (req,res) => {
    let id = req.body.id;
    let email = req.body.email;
    let password = req.body.password;

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password,salt);

    User.update({email:email, password:hash}, {where: {id:id}}).then(() => {
        res.redirect('/admin/users')
    })

})


//login

router.get('/login', (req,res) => {
    Category.findAll().then(categories => {
        res.render('admin/users/login', {categories});
    });
});

router.post('/user/authenticate', (req,res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({where:{email: email}}).then(user => {
        if(user != undefined) {
            let correctPassword = bcrypt.compareSync(password, user.password);

            if(correctPassword) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect('/admin/users');
            } else {
                res.redirect('/login');
                console.log('senha incorreta');
            }
        } else {
            res.redirect('/login');
            console.log('email incorreto');
        }
    });
});

router.get('/logout', (req,res)=>{
    req.session.user = undefined;
    res.redirect('/');
});

module.exports = router;