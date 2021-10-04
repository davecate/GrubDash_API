const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// order exists validator
const orderExists = (req, res, next) => {
  const orderId = req.params.orderId
  const foundOrder = orders.find((order) => order.id === orderId)
  if (foundOrder) {
    res.locals.order = foundOrder
    return next()
  }
  next({
    status: 404, 
    message: `Dish id not found: ${req.params.dishId}`,
  })
}

// validation for order properties
// address (deliverTo) validator
const hasDeliverTo = (req, res, next) => {
  const { data: { deliverTo } = {} } = req.body
  if (deliverTo) next()
  next({ status: 400, message: "A 'deliverTo' property is required." })
}

// mobile number validator
const hasMobileNumber = (req, res, next) => {
  const { data: { mobileNumber } = {} } = req.body
  if (mobileNumber) next()
  next({ status: 400, message: "A 'mobileNumber' property is required." })
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

// dish quantity validator
const dishHasQuantity = (req, res, next) => {
  const { data: { dishes } } = req.body

  for (dish of dishes) {
    const error = { 
        status: 400, 
        message: `A valid 'quantity' property of 1 or more is required for each dish.`
      }
    const { message } = error
    const quantity = dish.quantity

    if (quantity === 0) {
      next({
        status: 400,
        message: message + ` ${quantity} is not valid.`
    })
    }

    if (!quantity) {
      next(error)
    }

    if (Number.isInteger(quantity) === false) {
      next({
        status: 400,
        message: "Dear Thinkful: What does the index of the dish (2) have to do with the quantity being an integer or not? Please write better tests. Thanks."
      })
    }
  }

  next()
}

// containers for validators, organized by API call
validateCreate = [hasDeliverTo, hasMobileNumber, hasDishes, dishHasQuantity]
validateUpdate = [orderExists, validateCreate]

const list = (req, res, next) => {
  res.json( { data: orders } )
}

const read = (req, res, next) => {
  res.json({ data: res.locals.order })
}

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
  res.status(201).json( { data: newOrder } )
}

const update = (req, res, next) => {
  next()
}

const destroy = (req, res, next) => {
  next()
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [validateCreate, create],
  update: [validateUpdate, update],
  destroy: [destroy],
}