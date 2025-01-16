const userRouter = require('express').Router();
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const {uploadProfile} = require("../services/upload")
const authguard = require("../services/authguard")
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension")
const prisma = new PrismaClient().$extends(hashPasswordExtension)
const fs = require('fs');
const path = require('path');



userRouter.get('/login', (req, res) => {
    res.render('pages/login_inscription.twig', {
        title: "Connexion ou inscription - GameReview"
    })
})

userRouter.get('/profile', async (req, res) => {
    const categories = await prisma.category.findMany();
    const games = await prisma.game.findMany();

    const favoriteGames = await prisma.user.findUnique({
        where: { id: req.session.user.id },
        include: { favoriteGames: true } // Inclure les jeux favoris
    });

    res.render('pages/profile.twig', {
        title: "Profil - GameReview",
        user: req.session.user,
        categories: categories,
        games: games,
        favoriteGames: favoriteGames.favoriteGames
    })
})

userRouter.get('/', async (req, res) => {
    const categories = await prisma.category.findMany();
    const games = await prisma.game.findMany();
    res.render('pages/home.twig', {
        title: "GameReview",
        user: req.session.user,
        categories: categories,
        games: games
    })
})

userRouter.post('/signup', uploadProfile.single('profilImage'), async (req, res) => {
    try {
        if (req.body.password === req.body.confirmPassword) {
            
            const user = await prisma.user.create({
                data: {
                    mail: req.body.mail,
                    password: req.body.password,
                    profileImage: req.file ? req.file.filename : null,
                    username: req.body.username
                }
            })
            req.session.user = user;
            res.redirect('/')
        } else {
            throw ({ confirmPassword: "Vos mots de passe ne correspondent pas" })
        }
    } catch (error) {
        console.log(error);
        
        res.render("pages/login_inscription.twig", {
            error: error,
            title: "Connexion ou inscription - GameReview"
        })
    }
})

userRouter.post('/logingIn', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                mail: req.body.mail
            }
        })
        if (user) {
            if (await bcrypt.compare(req.body.password, user.password)) {  
                req.session.user = user;              
                if (user.isAdmin === true) {
                    res.redirect('/dashboard')
                } else {
                    res.redirect('/')
                }
            } else {
                res.render("pages/login_inscription.twig", {
                    error: "Mot de passe incorrect.",
                    title: "Connexion ou inscription - GameReview"
                });
            }
        } else {
            res.render("pages/login_inscription.twig", {
                error: "Utilisateur non trouvé.",
                title: "Connexion ou inscription - GameReview"
            });
        }
    } catch (error) {
        console.log(error);
        res.render("pages/login_inscription.twig", {
            error: error,
            title: "Connexion ou inscription - GameReview"
        })
    }
})

userRouter.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/login");
        }
    });
});

userRouter.get('/delete/user/:id', async (req,res) => {
    try {
        const user = await prisma.user.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (user && user.profileImage) {
            const imagePath = path.join(__dirname, '../public/assets/img/uploads/profilePic', user.profileImage);

            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Erreur lors de la suppression de l'image : ", err);
                }
            });
        }
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de la catégorie');
    }
})

module.exports = userRouter