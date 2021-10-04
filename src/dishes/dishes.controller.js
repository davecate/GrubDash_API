const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// TODO: Implement the /orders handlers needed to make the tests pass

// validation goes here
// name validator
const hasName = (req, res, next) => {
  const { data: { name } = {} } = req.body
  if (name) next()
  next({ status: 400, message: "A 'name' property is required." })
}

const hasDesc = (req, res, next) => {
  const { data: { description } = {} } = req.body
  if (description) next()
  next({ status: 400, message: "A 'description' property is required." })
}

const hasImgUrl = (req, res, next) => {
  const { data: { image_url } = {} } = req.body
  if (image_url) next()
  next({ status: 400, message: "An 'image_url' property is required." })
}

const priceIsRight = (req, res, next) => {
  const { data: { price } = {} } = req.body
  const priceIsWrong = { status: 400, message: "A 'price' property greater than 0 is required." }
  if (price > 0) next()
  if (price === NaN) next(priceIsWrong)
  next(priceIsWrong)
}

// API calls
const list = (req, res, next) => {
  res.json( { data: dishes } )
}

const read = (req, res, next) => {
  
}

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

const update = (req, res, next) => {
  
}

const destroy = (req, res, next) => {
  
}

module.exports = {
  list,
  read: [read],
  create: [hasName, hasDesc, hasImgUrl, priceIsRight, create],
  update: [update],
  destroy: [destroy],
}