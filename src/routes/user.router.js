const express = require("express");
const router = express.Router();
const usersController = require('../controller/user.controller');
const { authMiddleware } = require("../middlewares/auth");
const { asyncHandler } = require("../utils/asyncHandler");


router.post('/login', asyncHandler(usersController.loginUser));
// router.post('/forget-password', asyncHandler(usersController.forgetPassword))
router.post('/google-login', asyncHandler(usersController.googleLogin))
router.post('/get-email', asyncHandler(usersController.signUpUser))
router.post('/verify-otp', authMiddleware, asyncHandler(usersController.verifyUser))
router.post('/sign-up', authMiddleware, asyncHandler(usersController.registerUser))


module.exports = router