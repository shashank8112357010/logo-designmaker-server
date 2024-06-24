const { body } = require("express-validator");
const userModel = require("../models/userModel");

// register validations: 
module.exports.registerValidator = [
    body("workEmail")
        .notEmpty().withMessage("Please enter workEmail")
        .isEmail().withMessage("Please enter a valid workEmail")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ workEmail: value });
            if (existingUser) {
                throw new Error("User with this workEmail already exists!!");
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
        .matches(/[a-z]/).withMessage("Must contain one lowercase letter")
        .matches(/[0-9]/).withMessage("Must contain one number")
        .matches(/[A-Z]/).withMessage("Must contain one uppercase letter")
        .matches(/[`~!@#$%^&*()_,.?":{}|]/).withMessage("Must contain one special character")
        .isLength({ min: 8 }).withMessage("password should contain atleast 8 characters"),

    body("phoneNo")
        .notEmpty().withMessage("Please enter phoneNo")
        .isString().withMessage("Please enter a valid phoneNo")
        .isLength({ min: 10, max: 10 }).withMessage("phoneNo must contain 10 digits only")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ phoneNo: value });
            if (existingUser) {
                throw new Error("User with this phoneNo already exists..");
            }
        }),
];


// requirements validations: 
module.exports.requirementsValidator = [
    body("firstName")
        .notEmpty().withMessage("Please enter firstName")
        .isString().withMessage("Please enter a valid firstName"),

    body("lastName")
        .notEmpty().withMessage("Please enter lastName")
        .isString().withMessage("Please enter a valid lastName"),

    body("businessName")
        .notEmpty().withMessage("Please enter businessName")
        .isString().withMessage("Please enter a valid businessName")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ businessName: value });
            if (existingUser) {
                throw new Error("User with this businessName already exists..");
            }
        }),

    body("brandName")
        .notEmpty().withMessage("Provide a brandName to create logo")
        .isString().withMessage("Please enter a valid brandName")
]


// login validations: 
module.exports.loginValidator = [
    body("workEmail")
        .notEmpty().withMessage("Please enter a workEmail.")
        .isEmail().withMessage("Please enter a valid workEmail")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ workEmail: value });
            if (!existingUser) {
                throw new Error("User with this workEmail does not exist..");
            }
        }),

    body("password")
        .notEmpty().withMessage("Please enter a password")
        .isString().withMessage("Please enter a valid password")
]

module.exports.resetValidator = [
    body("newPassword")
        .notEmpty().withMessage("Please enter a newPassword")
        // .isString().withMessage("Please enter a valid password")
        .matches(/[a-z]/).withMessage("Must contain one lowercase letter")
        .matches(/[0-9]/).withMessage("Must contain one number")
        .matches(/[A-Z]/).withMessage("Must contain one uppercase letter")
        .matches(/[`~!@#$%^&*()_,.?":{}|]/).withMessage("Must contain one special character")
        .isLength({ min: 8 }).withMessage("newPassword should contain atleast 8 characters"),

    body("confirmPassword")
        .notEmpty().withMessage("Please enter a confirmPassword")
        // .isString().withMessage("Please enter a valid password")
        .matches(/[a-z]/).withMessage("Must contain one lowercase letter")
        .matches(/[0-9]/).withMessage("Must contain one number")
        .matches(/[A-Z]/).withMessage("Must contain one uppercase letter")
        .matches(/[`~!@#$%^&*()_,.?":{}|]/).withMessage("Must contain one special character")
        .isLength({ min: 8 }).withMessage("confirmPassword should contain atleast 8 characters"),
]