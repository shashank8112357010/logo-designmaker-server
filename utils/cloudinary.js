const express = require("express");
const cloudinary = require('cloudinary').v2;
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports.uploadImg = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath);
        // console.log(result);
        return {
            success: true,
            public_id: result.public_id,
            secure_url: result.secure_url,
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}