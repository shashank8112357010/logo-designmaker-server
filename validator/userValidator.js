const { body } = require("express-validator");
const userModel = require("../models/userModel");

// register validations: 
module.exports.registerValidator = [
    body("workEmail")
        .notEmpty().withMessage("Please enter work email")
        .isEmail().withMessage("Please enter a valid email")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ workEmail: value });
            if (existingUser) {
                throw new Error("User with this email already exists!!");
            }
        }),

    body("password")
        .notEmpty().withMessage("Please enter a password")
        // .isString().withMessage("Please enter a valid password")
        .isLength({ min: 8 }).withMessage("Password should contain atleast 8 characters")
        .matches(/[a-z]/).withMessage("Must contain one lowercase letter")
        .matches(/[0-9]/).withMessage("Must contain one number")
        .matches(/[A-Z]/).withMessage("Must contain one uppercase letter")
        .matches(/[!@#$%^&*()_,.?":{}|]/).withMessage("Must contain one special character"),

    body("phoneNo")
        .notEmpty().withMessage("Please enter phone number")
        .isString().withMessage("Please enter a valid mobile number")
        .isLength({ min: 10, max: 10 }).withMessage("Mobile number must contain 10 digits only")
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
        .isString().withMessage("Please enter a valid name"),

    body("lastName")
        .notEmpty().withMessage("Please enter last name")
        .isString().withMessage("Please enter a valid last name"),

    body("businessName")
        .notEmpty().withMessage("Please enter Business Name")
        .isString().withMessage("Please enter a valid business name")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ businessName: value });
            if (existingUser) {
                throw new Error("User with this business name already exists..");
            }
        }),

    body("brandName")
        .notEmpty().withMessage("Provide a brand name to create logo")
        .isString().withMessage("Please enter a valid brand name")
]



// login validations: 
module.exports.loginValidator = [
    body("workEmail")
        .notEmpty().withMessage("Please enter a email.")
        .isEmail().withMessage("Please enter a valid email")
        .custom(async (value) => {
            const existingUser = await userModel.findOne({ workEmail: value });
            if (!existingUser) {
                throw new Error("User with this email does not exist..");
            }
        }),

    body("password")
        .notEmpty().withMessage("Please enter a password")
        .isString().withMessage("Please enter a valid password")
]