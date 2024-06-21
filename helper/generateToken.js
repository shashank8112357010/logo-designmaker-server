const Token = require("../models/tokenModel")

module.exports.generateToken = async (id) => {
    // generate new token: 
    const tokenCode = Math.floor(1000 + Math.random() * 9000);

    // creating token in the token model:
    const token = await Token.create({
        userId: id,
        tokenCode,
        createdAt: new Date()
    });
    return token;
}