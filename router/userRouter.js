const userRouter = require('express').Router();
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const { uploadProfile, uploadPropo } = require("../services/upload")
const authguard = require("../services/authguard")
const { sendMail } = require("../services/mailer")
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension")
const prisma = new PrismaClient().$extends(hashPasswordExtension)
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { log } = require('console');


userRouter.get('/login', (req, res) => {
    const message = req.session.message;
    res.render('pages/login_inscription.twig', {
        title: "Connexion ou inscription - GameReview",
        message: message
    })
})

userRouter.get('/profile', async (req, res) => {
    res.render('pages/profile.twig', {
        title: "Profil - GameReview",
        user: req.session.user
    })
})

userRouter.get('/Iforgor', async (req, res) => {
    res.render('pages/reinitialisation.twig', {
        title: "Réinitialisation du mot de passe - GameReview"
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
        const password = req.body.password;
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/;
        if (regex.test(password)) {
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
        } else {
            throw ({ password: "Le mot de passe doit avoir au moins 10 caractères, une majuscule, un chiffre et un caractère spécial" });
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

userRouter.get('/delete/user/:id', async (req, res) => {
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

userRouter.post('/send-email', async (req, res) => {
    const email = req.body.email_sender;

    const user = await prisma.user.findUnique({ where: { mail: email } });

    if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { mail: email },
            data: { resetToken, resetTokenExpiry }
        });
        const subject = "Mot de passe oublié"
        const resetLink = `http://${req.headers.host}/reset-password/${resetToken}`;
        const message = `${email} demandé une réinitialisation de mot de passe. Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}`;
        const htmlMessage = `
        <p>${email} a demandé une réinitialisation de mot de passe.</p>
        <p>Cliquez sur le bouton suivant pour réinitialiser votre mot de passe :</p>
        <a href="${resetLink}" style="display: inline-block; padding: 8px 10px; font-size: 16px; color: #fff; background-image: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb); text-decoration: none; border-radius: 5px;">
        <span style="background-color: rgb(5, 6, 45); padding: 16px 24px; border-radius: 6px; display: inline-block;">Réinitialiser le mot de passe</span></a>
`;

        await sendMail('no-reply@gamereview.com', email, subject, message, htmlMessage);
        req.session.message = "L'email de réinitialisation a été envoyé.";
        res.redirect('/login');
    } else {
        res.status(404).send('Utilisateur non trouvé.');
    }
});

userRouter.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    console.log(req.session);

    const user = await prisma.user.findUnique({
        where: {
            resetToken: token
        }
    });

    if (user) {
        res.render('pages/reset_password.twig', {
            title: "Réinitialisation du mot de passe - GameReview",
            token
        });
    } else {
        res.status(400).send('Token invalide ou expiré.');
    }
});

userRouter.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,}$/;
        // Tableau pour stocker les erreurs
        const errors = {};

        if (!regex.test(password)) {
            errors.passwordError = "Le mot de passe doit avoir au moins 10 caractères, une majuscule, un chiffre et un caractère spécial";
        }

        if (password !== confirmPassword) {
            errors.confirmPasswordError = "Vos mots de passe ne correspondent pas";
        }

        // Si des erreurs existent, on réaffiche le formulaire avec les erreurs
        if (Object.keys(errors).length > 0) {
            return res.render('pages/reset_password.twig', {
                title: "Réinitialisation du mot de passe - GameReview",
                token,
                errors,
                // Conserver les valeurs du formulaire
                password,
                confirmPassword
            });
        }

        const user = await prisma.user.findUnique({
            where: { resetToken: token }
        });

        if (!user) {
            return res.render('pages/reset_password.twig', {
                title: "Réinitialisation du mot de passe - GameReview",
                token,
                errors: { generalError: "Token invalide ou expiré." }
            });
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Mettre à jour l'utilisateur dans la base de données
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null, // Supprimer le token après utilisation
                resetTokenExpiry: null // Supprimer l'expiration du token
            }
        });

        // Rediriger vers la page de connexion avec un message de succès
        req.session.message = "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.";
        res.redirect('/login');

    } catch (error) {
        console.error(error);
        res.render('pages/reset_password.twig', {
            title: "Réinitialisation du mot de passe - GameReview",
            token,
            errors: { generalError: "Une erreur est survenue" }
        });
    }
});

userRouter.post('/proposing', uploadPropo.single('gamePhoto'), async (req, res) => {
    const { gameName, shortDesc } = req.body;
    const gamePhoto = req.file ? req.file.filename : null;
    const user = req.session.user;

    if (!user) {
        return res.status(401).send('Utilisateur non connecté.');
    }

    console.log('gameName:', gameName);
    console.log('shortDesc:', shortDesc);
    console.log('gamePhoto:', gamePhoto);
    console.log('user:', user);

    const subject = "Proposition de nouveau jeu";
    const message = `
        <p>Un utilisateur a proposé un nouveau jeu.</p>
        <p><strong>Nom du jeu :</strong> ${gameName}</p>
        <p><strong>Description :</strong> ${shortDesc}</p>
        ${gamePhoto ? `<p><strong>Photo :</strong> <img src="cid:gamePhoto" alt="Game Photo" width="500"></p>` : ''}
        <p><strong>Proposé par :</strong> ${user.username} (${user.mail})</p>`;

    try {
        const attachments = gamePhoto ? [{
            filename: gamePhoto,
            path: path.join(__dirname, '../public/assets/img/uploads/propoImage', gamePhoto),
            cid: 'gamePhoto'
        }] : [];

        await sendMail('no-reply@gamereview.com', process.env.EMAIL_USERNAME, subject, message, message, attachments);
        req.session.message = "Votre proposition a été envoyée avec succès.";
        res.redirect('/profile');
    } catch (error) {
        console.error('Error sending email: ' + error);
        console.log('Fichier reçu:', req.file);
        console.log('Chemin du fichier:', req.file ? req.file.path : 'Aucun fichier');

        res.status(500).send('Erreur lors de l\'envoi de la proposition.');
    }
});

module.exports = userRouter