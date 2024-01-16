const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');

const authController = {};

authController.signup = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name.trim() || !email.trim() || !password.trim())
        return res.status(400).json({ message: 'all fields required' });
    else if (password.length < 8)
        return res.status(400).json({ message: 'password length is too short' });

    try {
        const existingUser = await userModel.findOne({ email }).lean().exec();
        if (existingUser)
            return res.status(409).json({ message: 'Email already used' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashedPassword });

        if (user) {
            res.status(201).json({ message: "user created" });
        } else {
            res.status(400).json({ message: "invalid user data received" });
        }
    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
}

authController.signin = async (req, res) => {
    const { email, password } = req.body;

    if (!email.trim() || !password.trim())
        return res.status(400).json({ message: 'all fields required' });

    try {
        const existingUser = await userModel.findOne({ email }).lean().exec();

        if (!existingUser) return res.status(400).json({ message: 'email not found' });

        const passwordMatch = await bcrypt.compare(password, existingUser.password);

        if (!passwordMatch) return res.status(401).json({message:"wrong password"});

        res.json({"token":"will sent soon"}) // TODO handle this
    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
}

module.exports = authController;