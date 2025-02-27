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

    } else if (req.query.favorites && req.session.user) {
        games = favoriteGames;
    } else {
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
    let gameFilter
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
        gameFilter = await prisma.game.findMany({
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
            gameFilter = await prisma.game.findMany({
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
                gameFilter = await prisma.game.findMany({
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

    } else if (req.query.favorites && req.session.user) {
        gameFilter = favoriteGames;
    } else {
        gameFilter = await prisma.game.findMany({
            include: {
                categories: true // Inclure les catégories associées
            }
        });
    }

    res.render('pages/dashboard.twig', {
        title: "GameReview - Page administrateur",
        user: req.session.user,
        users: users,
        generalCategories: categories,
        games: games,
        gameFilter: gameFilter
    })
})

gameRouter.get('/game/:id', async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const generalCategories = await prisma.category.findMany();
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
                linkFandom: game.linkFandom,
                linkSteam: game.linkSteam,
                categories: game.categories,
                generalCategories: generalCategories
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

gameRouter.post('/addGame', uploadGame.single('gameImage'), async (req, res) => {
    const users = await prisma.user.findMany();
    const categories = await prisma.category.findMany();
    const games = await prisma.game.findMany();

    try {
        const selectCategories = Array.isArray(req.body.categories) ? req.body.categories.map(Number) : [];

        const game = await prisma.game.create({
            data: {
                name: req.body.gameName,
                imageUrl: req.file ? req.file.filename : null,
                developer: req.body.developer,
                informations: req.body.description,
                linkFandom: req.body.linkFandom,
                linkSteam: req.body.linkSteam,
                categories: {
                    connect: selectCategories.map(id => ({ id }))
                }
            }
        })
        req.session.message = "le jeu a bien été ajouté"
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        req.session.message = "erreur lors de l'ajout du jeu"
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

gameRouter.get('/game/:id/edit', async (req, res) => {
    const gameId = parseInt(req.params.id);
    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: { categories: true }
    });
    const categories = await prisma.category.findMany();

    res.render('pages/dashboard.twig', {
        title: "GameReview - Page administrateur",
        game: game,
        generalCategories: categories
    });
});

gameRouter.post('/modifyGame/:id', uploadGame.single('gameImage'), async (req, res) => {
    const gameId = parseInt(req.params.id);
    console.log('Tentative de modification du jeu avec ID:', gameId);
    try {
        console.log('Données reçues:', req.body);
        console.log('Fichier image:', req.file);

        const selectCategories = Array.isArray(req.body.gameCategory) ? req.body.gameCategory.map(Number) : [];
        console.log('Catégories sélectionnées:', JSON.stringify(selectCategories, null, 2));

        const updateData = {
            name: req.body.name,
            imageUrl: req.file ? "/" + req.file.filename : req.body.gameImage,
            developer: req.body.developer,
            informations: req.body.description,
            linkFandom: req.body.linkFandom,
            linkSteam: req.body.linkSteam,
            categories: {
                set: selectCategories.map(id => ({ id: parseInt(id) }))
            }
        };
        console.log('Données de mise à jour:', updateData);

        const game = await prisma.game.update({
            where: { id: gameId },
            data: updateData
        });
        console.log('Données de mise à jour:', game);
        req.session.message = "le jeu a bien été modifié"
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la modification du jeu');
    }
});

gameRouter.get('/deleteGame/:id', async (req, res) => {
    const gameId = parseInt(req.params.id);
    console.log(gameId);

    try {
        const game = await prisma.game.delete({
            where: {
                id: gameId
            }
        });

        console.log(game);
        req.session.message = "le jeu a bien été supprimé"
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression du jeu');
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
        req.session.message = "le jeu a bien été mis au favoris"
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
            data: {
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