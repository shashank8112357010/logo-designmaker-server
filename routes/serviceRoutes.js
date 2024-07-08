const express = require("express");
const router = express.Router();

const { createService, getMyServices, updateService, deleteService } = require("../controllers/serviceController");
const authenticate = require("../middlewares/authentication");
const { authorizeRole } = require("../middlewares/authorization");

// create user service: 
router.post("/createService", authenticate, createService);

// get my services: 
router.get("/myServices", authenticate, getMyServices);

// update service: 
router.put("/updateService/:serviceId", authenticate, authorizeRole("admin"), updateService);

// delete a service: 
router.delete("/deleteService/:serviceId", authenticate, deleteService);

module.exports = router;