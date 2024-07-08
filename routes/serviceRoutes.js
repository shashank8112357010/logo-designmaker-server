const express = require("express");
const { createService, getMyServices, updateService, deleteService } = require("../controllers/serviceController");
const router = express.Router();

// create user service: 
router.post("/createService", authenticate, createService);

// get my services: 
router.get("/myServices", authenticate, getMyServices);

// update service: 
router.put("/updateService/:serviceId", authenticate, authorizeRole("admin"), updateService);

// delete a service: 
router.delete("/deleteService/:serviceId", authenticate, deleteService);

module.exports = router;