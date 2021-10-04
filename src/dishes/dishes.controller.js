const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// TODO: Implement the /orders handlers needed to make the tests pass

const dishExists = (req, res, next) => {
  const dishId = req.params.dishId
  const foundDish = dishes.find((dish) => dish.id === dishId)
  if (foundDish) {
    res.locals.dish = foundDish
    return next()
  }
  next({status: 404, message: `Dish id not found: ${req.params.dishId}`,})
}

// validation for dish properties
// name validator
const hasName = (req, res, next) => {
  const { data: { name } = {} } = req.body
  if (name) next()
  next({ status: 400, message: "A 'name' property is required." })
}

// description validator
const hasDesc = (req, res, next) => {
  const { data: { description } = {} } = req.body
  if (description) next()
  next({ status: 400, message: "A 'description' property is required." })
}

// img dish validator
const hasImgUrl = (req, res, next) => {
  const { data: { image_url } = {} } = req.body
  if (image_url) next()
  next({ status: 400, message: "An 'image_url' property is required." })
}

// price validator
const priceIsRight = (req, res, next) => {
  const { data: { price } = {} } = req.body
  const priceIsWrong = { status: 400, message: "A 'price' property greater than 0 is required." }
  if (price > 0) next()
  if (price === NaN) next(priceIsWrong)
  next(priceIsWrong)
}

// API calls
// get all dishes
const list = (req, res, next) => {
  res.json( { data: dishes } )
}

// get one dish
const read = (req, res, next) => {
  res.json( { data: res.locals.dish } )
}

// post new dish
const create = (req, res, next) => {
  const { data: { name, description, price, image_url } = {} } = req.body
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  }
  dishes.push(newDish)
  res.status(201).json({ data: newDish })
}

// put: update a dish
const update = (req, res, next) => {
  
}

// delete a dish
const destroy = (req, res, next) => {
  
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [hasName, hasDesc, hasImgUrl, priceIsRight, create],
  update: [update],
  destroy: [destroy],
}