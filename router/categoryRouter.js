const categoryRouter = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authguard = require("../services/authguard")

categoryRouter.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des catégories');
    }
});

categoryRouter.post('/confirmCategory', async (req, res) => {
    try {
        // Création de la nouvelle catégorie
        const newCategory = await prisma.category.create({
            data: {
                name: req.body.categoryName
            }
        });
        res.redirect('/dashboard')

    } catch (error) {
        console.error(error);
        // Réponse en cas d'erreur
        res.status(500).json({
            error: "Erreur lors de la création de la catégorie",
            details: error.message
        });
    }
});

categoryRouter.get('/delete/category/:id', async (req, res) => {
    try {
        await prisma.category.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de la catégorie');
    }
});

module.exports = categoryRouter