const Token = require("../models/tokenModel")

module.exports.generateResetToken = async (id) => {
    // generate new token: 
    // const tokenCode = Math.floor(1000 + Math.random() * 9000);

    const length = 64;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let tokenCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        tokenCode += characters.charAt(randomIndex);
    }

    // creating token in the token model:
    const token = await Token.create({
        userId: id,
        token: tokenCode,
        createdAt: new Date()
    });
    await token.save();
    return tokenCode;
}