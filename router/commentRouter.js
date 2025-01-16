const commentRouter = require('express').Router();
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const authguard = require("../services/authguard")
const hashPasswordExtension = require("../services/extensions/hashPasswordExtension")
const prisma = new PrismaClient().$extends(hashPasswordExtension)