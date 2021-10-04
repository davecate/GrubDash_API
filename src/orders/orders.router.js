const router = require("express").Router();
const controller = require("./orders.controller")
const methodNotAllowed = require("../errors/methodNotAllowed")

router
  .route("/")
  .get()
  .post()
  .all(methodNotAllowed)

router
  .route("/:orderId")
  .get()
  .put()
  .all(methodNotAllowed)

module.exports = router;
