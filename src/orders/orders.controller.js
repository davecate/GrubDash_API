const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// order exists validator
const orderExists = (req, res, next) => {
  res.locals.orderId = req.params.orderId
  const { orderId } = res.locals
  const foundOrder = orders.find((order) => order.id === orderId)
  if (foundOrder) {
    res.locals.order = foundOrder
    next()
  }
  next({
    status: 404, 
    message: `Order id not found: ${orderId}`,
  })
}

// all validation for order properties
// id validator
const idMatches = (req, res, next) => {
  res.locals.order = req.body.data
  const { orderId } = res.locals
  const { order: { id } } = res.locals
  if (orderId === id) next()
  if (!id) next()
  next({ 
    status: 400, 
    message: `Invalid order id: ${id}. An order's id must match its url.` 
  })
}

// address (deliverTo) validator
const hasDeliverTo = (req, res, next) => {
  if (!res.locals.order) res.locals.order = req.body.data
  const { order: { deliverTo } = {} } = res.locals
  if (!deliverTo) next({ 
    status: 400, 
    message: "A 'deliverTo' property is required." 
  })
  next()
}

// mobile number validator
const hasMobileNumber = (req, res, next) => {
  const { order: { mobileNumber } = {} } = res.locals
  if (!mobileNumber) next({ 
    status: 400, 
    message: "A 'mobileNumber' property is required." 
  })
  next()
}

// dishes validator
const hasDishes = (req, res, next) => {
  const { order: { dishes } = {} } = res.locals
  if (!dishes || !dishes.length || Array.isArray(dishes) === false) {
    next({ 
      status: 400, 
      message: "A 'dishes' property is required." 
    })
  }
  next()
}

// dish quantity validator
const dishHasQuantity = (req, res, next) => {
  const { order: { dishes } } = res.locals

  for (dish of dishes) {
    const message = `A valid 'quantity' property of 1 or more is required for each dish.`
    const quantity = dish.quantity

    if (quantity === 0) {
      next({
        status: 400,
        message: message + ` ${quantity} is not valid.`
    })
    }

    if (!quantity) {
      next({
        status: 400,
        message: message
      })
    }

    if (Number.isInteger(quantity) === false) {
      next({
        status: 400,
        message: message + ` Dish located at dishes[${dishes.indexOf(dish)}] has an invalid quantity.`
      })
    }
  }

  next()
}

// status validators
// hasStatus for post and put requests
const hasStatus = (req, res, next) => {
  const { order: { status } } = res.locals
  const error = {
    status: 400,
    message: `A valid 'status' property is required.`
  }
  if (status === 'invalid') next(error)
  if (status) next()
  next(error)
}

// statusIsPending for delete requests
const statusIsPending = (req, res, next) => {
  const { order: { status } } = res.locals
  if (status !== "pending") {
    next({
      status: 400,
      message: `Order status must be 'pending'`
    })
  }
  next()
}

// containers for validators, organized by handler
const validateCreate = [hasDeliverTo, hasMobileNumber, hasDishes, dishHasQuantity]
const validateUpdate = [orderExists, idMatches, validateCreate, hasStatus]
const validateDestroy = [orderExists, statusIsPending]

// API call handlers
// get all orders
const list = (req, res) => {
  res.json({ data: orders })
}

// get one order
const read = (req, res) => {
  res.json({ data: res.locals.order })
}

// post a new order
const create = (req, res) => {
  const { order: { deliverTo, mobileNumber, status, dishes, } = {} } = res.locals
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  }
  orders.push(newOrder)
  res
    .status(201)
    .json({ data: newOrder })
}

// put: update an order
const update = (req, res) => {
  const { orderId } = res.locals
  const { order: { deliverTo, mobileNumber, status, dishes } } = res.locals
  order = { 
    id: orderId, 
    deliverTo, 
    mobileNumber, 
    status, 
    dishes 
  }
  res.json({ data: order })
}

// delete an order
const destroy = (req, res) => {
  const { orderId } = res.locals
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
    res.sendStatus(204)
  }
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [validateCreate, create],
  update: [validateUpdate, update],
  destroy: [validateDestroy, destroy],
}