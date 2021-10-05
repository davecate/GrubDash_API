const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// dish exists validator
const dishExists = (req, res, next) => {
  const { dishId } = req.params
  const foundDish = dishes.find((dish) => dish.id === dishId)
  if (foundDish) {
    res.locals.dish = foundDish
    return next()
  }
  next({
    status: 404, 
    message: `Dish id not found: ${dishId}`,
  })
}

// validation for dish properties
// id validator
const idMatches = (req, res, next) => {
  const { dishId } = req.params
  const { data: { id } } = req.body
  if (dishId === id) next()
  if (!id) next()
  next({ 
    status: 400, 
    message: `Invalid dish id: ${id}. A dish's id must match its url` 
  })
}

// name validator
const hasName = (req, res, next) => {
  const { data: { name } = {} } = req.body
  if (!name) next({ 
    status: 400, 
    message: "A 'name' property is required." 
  })
  next()
}

// description validator
const hasDesc = (req, res, next) => {
  const { data: { description } = {} } = req.body
  if (!description) next({ 
    status: 400, 
    message: "A 'description' property is required." 
  })
  next()
}

// img url validator
const hasImgUrl = (req, res, next) => {
  const { data: { image_url } = {} } = req.body
  if (!image_url) next( { 
    status: 400, 
    message: "An 'image_url' property is required." 
  } )
  next()
}

// price validator
const priceIsRight = (req, res, next) => {
  const { data: { price } = {} } = req.body
  const priceIsWrong = { 
    status: 400, 
    message: "A 'price' property greater than 0 is required." 
  }
  if (typeof price !== 'number') next(priceIsWrong)
  if (price <= 0) next(priceIsWrong)
  next()
}

// containers for validators, organized by handler
const validateCreate = [hasName, hasDesc, hasImgUrl, priceIsRight]
const validateUpdate = [dishExists, idMatches, validateCreate]

// API call handlers
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
  res
    .status(201)
    .json({ data: newDish })
}

// put: update a dish
const update = (req, res, next) => {
  const { dish: { id } } = res.locals
  const { data: { name, description, price, image_url } = {} } = req.body
  dish = { 
    id, 
    name, 
    description, 
    price, 
    image_url 
  }
  res.json({ data: dish })
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [validateCreate, create],
  update: [validateUpdate, update],
}