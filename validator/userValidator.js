const { body } = require("express-validator");
const userModel = require("../models/userModel");

// register validations: 
module.exports.registerValidator = [
    body("workEmail")
        .notEmpty().withMessage("Please enter work email")
        .isEmail().withMessage("Please enter a valid work email")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ workEmail: value });
            if (existingUser) {
                throw new Error("User with this work email already exists!!");
            }
        }),

    body("username")
        .notEmpty().withMessage("Please enter a username")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ username: value });
            if (existingUser) {
                throw new Error("User with this username already exists!! Please use a different one..");
            }
        }),

    body("password")
        .notEmpty().withMessage("Please enter a password")
        // .isString().withMessage("Please enter a valid password")
        .matches(/[a-z]/).withMessage("Password must contain one lowercase letter")
        .matches(/[0-9]/).withMessage("Password must contain one number")
        .matches(/[A-Z]/).withMessage("Password must contain one uppercase letter")
        .matches(/[`~!@#$%^&*()_,.?":{}|]/).withMessage("Password must contain one special character")
        .isLength({ min: 8 }).withMessage("password must contain atleast 8 characters"),

    body("phoneNo")
        .notEmpty().withMessage("Please enter phone number")
        .isString().withMessage("Please enter a valid phone number")
        .isLength({ min: 10, max: 10 }).withMessage("phone number must contain 10 digits only")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ phoneNo: value });
            if (existingUser) {
                throw new Error("User with this phone number already exists..");
            }
        }),
];


// requirements validations: 
module.exports.requirementsValidator = [
    body("firstName")
        .notEmpty().withMessage("Please enter first name")
        .isString().withMessage("Please enter a valid first name"),

    body("lastName")
        .notEmpty().withMessage("Please enter last name")
        .isString().withMessage("Please enter a valid last name"),

    body("businessName")
        .notEmpty().withMessage("Please enter business name")
        .isString().withMessage("Please enter a valid business name")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ businessName: value });
            if (existingUser) {
                throw new Error("User with this business name already exists..");
            }
        }),

    body("brandName")
        .notEmpty().withMessage("Provide a brand name to create logo")
        .isString().withMessage("Please enter a valid brand name"),

    body("slogan")
        .notEmpty().withMessage("Provide a slogan to create logo")
        .isString().withMessage("Please enter a valid slogan"),

    body("designRequirements")
        .notEmpty().withMessage("Please select a design requirement"),

    body("niche")
        .notEmpty().withMessage("Please select a niche"),

    body("fontOptions")
        .notEmpty().withMessage("Please select font options"),

    body("colorOptions")
        .notEmpty().withMessage("Please select color options"),
]


// login validations: 
module.exports.loginValidator = [
    body("workEmail")
        .notEmpty().withMessage("Please enter a work email.")
        .isEmail().withMessage("Please enter a valid work email")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ workEmail: value });
            if (!existingUser) {
                throw new Error("User with this work email does not exist..");
            }
        }),

    body("password")
        .notEmpty().withMessage("Please enter a password")
        .isString().withMessage("Please enter a valid password")
]

module.exports.resetValidator = [
    body("newPassword")
        .notEmpty().withMessage("Please enter a new password")
        // .isString().withMessage("Please enter a valid password")
        .matches(/[a-z]/).withMessage("New password must contain one lowercase letter")
        .matches(/[0-9]/).withMessage("New password must contain one number")
        .matches(/[A-Z]/).withMessage("New password must contain one uppercase letter")
        .matches(/[`~!@#$%^&*()_,.?":{}|]/).withMessage("New password must contain one special character")
        .isLength({ min: 8 }).withMessage("New password must contain atleast 8 characters"),

    // body("confirmPassword")
    //     .notEmpty().withMessage("Please enter a confirmPassword")
    //     // .isString().withMessage("Please enter a valid password")
    //     .matches(/[a-z]/).withMessage("Must contain one lowercase letter")
    //     .matches(/[0-9]/).withMessage("Must contain one number")
    //     .matches(/[A-Z]/).withMessage("Must contain one uppercase letter")
    //     .matches(/[`~!@#$%^&*()_,.?":{}|]/).withMessage("Must contain one special character")
    //     .isLength({ min: 8 }).withMessage("confirmPassword should contain atleast 8 characters"),
]


module.exports.afterAuthPasswordValidation = [
    body("currentPassword")
        .notEmpty().withMessage("Please enter a current password"),
    // .isString().withMessage("Please enter a valid password")

    body("newPassword")
        .notEmpty().withMessage("Please enter a new password")
        // .isString().withMessage("Please enter a valid password")
        .matches(/[a-z]/).withMessage("new password must contain one lowercase letter")
        .matches(/[0-9]/).withMessage("new password must contain one number")
        .matches(/[A-Z]/).withMessage("new password must contain one uppercase letter")
        .matches(/[`~!@#$%^&*()_,.?":{}|]/).withMessage("new password must contain one special character")
        .isLength({ min: 8 }).withMessage("New password must contain atleast 8 characters"),
]