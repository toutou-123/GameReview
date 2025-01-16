const gameRouter = require('express').Router();

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const { uploadGame } = require("../services/upload")
const authguard = require("../services/authguard")
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension")
const prisma = new PrismaClient().$extends(hashPasswordExtension)
const fs = require('fs');
const path = require('path');


gameRouter.get('/home', async (req, res) => {
    const categories = await prisma.category.findMany();
    let games;
    let favoriteGames = [];

    if (req.session.user) {
        // Récupérer les jeux favoris de l'utilisateur connecté
        const userId = req.session.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { favoriteGames: true } // Inclure les jeux favoris
        });
        favoriteGames = user.favoriteGames; // Stocker les jeux favoris
    } else {
        // Si l'utilisateur n'est pas connecté, récupérer tous les jeux
        games = await prisma.game.findMany({
            include: {
                categories: true // Inclure les catégories associées
            }
        });
    }

    if (req.query.category) {
        // Filtrer les jeux par catégorie
        const categoryId = parseInt(req.query.category);
        let category

        if (!isNaN(categoryId)) {
            games = await prisma.game.findMany({
                where: {
                    categories: {
                        some: {
                            id: categoryId // Assurez-vous que l'ID de la catégorie est correct
                        }
                    }
                },
                include: {
                    categories: true // Inclure les catégories associées
                }
            });
        } else {
            category = await prisma.category.findUnique({
                where: {
                    name: req.query.category
                }
            });

            if (category) {
                games = await prisma.game.findMany({
                    where: {
                        categories: {
                            some: {
                                id: category.id
                            }
                        }
                    },
                    include: {
                        categories: true
                    }
                });
            }
        }

    } else if (req.query.favorites){

    }else {
        games = await prisma.game.findMany({
            include: {
                categories: true // Inclure les catégories associées
            }
        });
    }

    res.render('pages/home.twig', {
        title: "GameReview",
        user: req.session.user,
        categories: categories,
        games: games,
        favoriteGames: favoriteGames
    })
})

gameRouter.get('/dashboard', async (req, res) => {
    const users = await prisma.user.findMany();
    const categories = await prisma.category.findMany();
    const games = await prisma.game.findMany();

    res.render('pages/dashboard.twig', {
        title: "GameReview - Page administrateur",
        user: req.session.user,
        users: users,
        categories: categories,
        games: games
    })
})

gameRouter.get('/game/:id', async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const game = await prisma.game.findUnique({
            where: {
                id: gameId // Récupère l'ID du jeu à partir des paramètres de la requête
            },
            include: {
                categories: true // Inclure les catégories associées
            }
        });

        if (game) {
            const response = {
                gameId: game.id,
                gameName: game.name,
                gameImage: game.imageUrl,
                developer: game.developer,
                description: game.informations,
                link: game.link,
                categories: game.categories.map(category => category.name) // Récupérer les noms des catégories
            };
            res.json(response);
        } else {
            res.status(404).send('Jeu non trouvé');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des informations du jeu');
    }
});

gameRouter.post('/confirmGame', uploadGame.single('gameImage'), async (req, res) => {
    const users = await prisma.user.findMany();
    const categories = await prisma.category.findMany();
    const games = await prisma.game.findMany();

    try {
        const selectCategories = Array.isArray(req.body.categories) ? req.body.categories.map(Number) : [];

        console.log(req.file);
        const game = await prisma.game.create({
            data: {
                name: req.body.gameName,
                imageUrl: req.file ? req.file.filename : null,
                developer: req.body.developer,
                informations: req.body.description,
                link: req.body.link,
                categories: {
                    connect: selectCategories.map(id => ({ id }))
                }
            }
        })
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);

        res.render('pages/dashboard.twig', {
            error: error,
            title: "GameReview - Page administrateur",
            user: req.session.user,
            users: users,
            categories: categories,
            games: games
        })
    }
})

gameRouter.get('/delete/game/:id', async (req, res) => {
    try {
        const game = await prisma.game.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (game && game.imageUrl) {
            const imagePath = path.join(__dirname, '../public/assets/img/uploads/gamePic', game.imageUrl);

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

gameRouter.post('/favorites/add/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    const userId = req.session.user.id; // Assurez-vous que l'utilisateur est connecté

    console.log(gameId);
    console.log(userId);

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                favoriteGames: {
                    connect: { id: parseInt(gameId) }  // On relie le jeu à l'utilisateur via la relation
                }
            }
        });
        res.status(201).send('Jeu ajouté aux favoris');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de l\'ajout aux favoris');
    }
});

gameRouter.delete('/favorites/remove/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    const userId = req.session.user.id; // Assurez-vous que l'utilisateur est connecté

    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data:{
                favoriteGames: {
                    disconnect: { id: parseInt(gameId) }  // On relie le jeu à l'utilisateur via la relation
                }
            }
        });
        res.status(200).send('Jeu retiré des favoris');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du retrait des favoris');
    }
});

module.exports = gameRouter