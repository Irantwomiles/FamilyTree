const express = require('express')
const postRouter = express.Router()
const Person = require('../models/Person')
const { v4: uuidv4 } = require('uuid')

/**
 * This is run everytime any of the routes bellow are called.
 */
postRouter.use(function(req, res, next) {

    /**
     * if(some form of auth) { next() } else { res.sendStatus(403) }
     */

    /**
     * the next() function determines if we should go to the next route after our middleware functions have ran.
     *  -ex: if user and password are incorrect, don't call next() because they are not autheticated, instead res.send/sendStatus something else like 'not auth'
     */
    next()
})

postRouter.post('/create', function(req, res) {

    var firstName = req.body.firstName
    var lastName = req.body.lastName
    var dob = req.body.dob
    var id = uuidv4()

    var person = new Person({
        first_name: firstName,
        last_name: lastName,
        dob: dob,
        id: id,
        father: {
            first_name: "",
            last_name: "",
            dob: "",
            id: ""
        },
        mother: {
            first_name: "",
            last_name: "",
            dob: "",
            id: ""
        },
        spouse: {
            first_name: "",
            last_name: "",
            dob: "",
            id: ""
        },
        children: []
    })

    person.save(function(err) {
        if(err) {
            console.log("error while creating a new document", err)
            res.sendStatus(400)
            return
        }
 
        console.log("Document saved successfully!")

    })

    res.send({status: 200, id: id})
})

postRouter.post('/update/:id', function(req, res) {
  
    let spouse = req.body.spouse
    let father = req.body.father
    let mother = req.body.mother
    let children = req.body.children

    spouse.id = handleEmptyId(spouse.id)
    father.id = handleEmptyId(father.id)
    mother.id = handleEmptyId(mother.id)
 
    let arr = []

    for(var i = 0; i < children.length; i++) {

        children[i].id = handleEmptyId(children[i].id)

        arr.push({
            first_name: children[i].first_name,
            last_name: children[i].last_name,
            dob: children[i].dob,
            id: children[i].id
        })
    }

    const update = {
        spouse: spouse,
        father: father,
        mother: mother,
        children: arr
    }

    Person.findOneAndUpdate({id: req.params.id}, update, {
        new: true
    },
    function(err, response) {
        if(err) {
            return res.sendStatus(400)
        }

        res.send(response)
    });

})

postRouter.get('/:id', function(req, res) {
 
    Person.find({id: req.params.id}, (err, result) => {
        res.send(result)
    }).catch((err) => {
        console.log(err)
    })

})

postRouter.get('/search/:first/:last/:dob', function(req, res) {

    console.log(req.params)

    Person.find({first_name: { "$regex": req.params.first, "$options": "i" }}, (err, result) => {
        console.log(result)
        res.send(result)
    }).catch((err) => {
        console.log(err)
    })

})

function handleEmptyId(data) {
    if(data.length === 0) {
        return uuidv4()
    }

    return data
}

module.exports = postRouter