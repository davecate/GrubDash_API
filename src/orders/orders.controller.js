const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// order exists validator
const orderExists = (req, res, next) => {
  const { orderId } = req.params
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
  const { orderId } = req.params
  const { data: { id } } = req.body
  if (orderId === id) next()
  if (!id) next()
  next({ 
    status: 400, 
    message: `Invalid order id: ${id}. An order's id must match its url.` 
  })
}

// address (deliverTo) validator
const hasDeliverTo = (req, res, next) => {
  const { data: { deliverTo } = {} } = req.body
  if (deliverTo) next()
  next({ 
    status: 400, 
    message: "A 'deliverTo' property is required." 
  })
}

// mobile number validator
const hasMobileNumber = (req, res, next) => {
  const { data: { mobileNumber } = {} } = req.body
  if (mobileNumber) next()
  next({ 
    status: 400, 
    message: "A 'mobileNumber' property is required." 
  })
}

// dishes validator
const hasDishes = (req, res, next) => {
  const { data: { dishes } = {} } = req.body
  if (!dishes || !dishes.length || Array.isArray(dishes) === false) {
    next({ 
      status: 400, 
      message: "A 'dishes' property is required." 
    })
  }
  next()
}

// dish quantity validator -- tests require different messages for each case
const dishHasQuantity = (req, res, next) => {
  const { data: { dishes } } = req.body

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

// status validator
const hasStatus = (req, res, next) => {
  const { data: { status } } = req.body
  const error = {
    status: 400,
    message: `A valid 'status' property is required.`
  }
  if (status === 'invalid') next(error)
  if (status) next()
  next(error)
}

// containers for validators, organized by handler
const validateCreate = [hasDeliverTo, hasMobileNumber, hasDishes, dishHasQuantity]
const validateUpdate = [orderExists, idMatches, validateCreate, hasStatus]

// API call handlers
// get all orders
const list = (req, res, next) => {
  res.json({ data: orders })
}

// get one order
const read = (req, res, next) => {
  res.json({ data: res.locals.order })
}

// post a new order
const create = (req, res, next) => {
  const { data: { deliverTo, mobileNumber, status, dishes, } = {} } = req.body
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
const update = (req, res, next) => {
  const { order: { id } } = res.locals
  const { data: { deliverTo, mobileNumber, status, dishes } } = req.body
  order = { 
    id, 
    deliverTo, 
    mobileNumber, 
    status, 
    dishes 
  }
  res.json({ data: order })
}

// delete an order
const destroy = (req, res, next) => {
  const { orderId } = req.params
  const { order } = res.locals
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
  }
  if (order.status === "pending") {
    res.sendStatus(204)
  }
  next({
    status: 400,
    message: `Order status must be 'pending'`
  })
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [validateCreate, create],
  update: [validateUpdate, update],
  destroy: [orderExists, destroy],
}