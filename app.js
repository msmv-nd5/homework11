const express = require("express");
const bodyParser = require("body-parser");
var {ObjectId} = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const app = express();
const rtAPIv1 = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    "extended": true
}));

var userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});
var User = mongoose.model('User', userSchema);

var taskSchema = new Schema({
    name: String,
    description: String,
    isOpen: Boolean,
    user: Schema.Types.ObjectId,
});

var Task = mongoose.model('Task', taskSchema);


mongoose.connect("mongodb://localhost:27017/test2", function(err, db) {


    //Пользователи
    rtAPIv1.get("/users/", function(req, res) {
        User.find((err, result) => {
            res.send(result);
        });
    });

    rtAPIv1.post("/users/", function(req, res) {
        let user = User({
            name: req.body.name
        });
        user.save((err, result) => {
            res.send(result);
        });
    });

    rtAPIv1.delete("/users/:id", function(req, res) {
        User.remove({
            "_id": ObjectId(req.params.id)
        }, (err, result) => {
            res.send(result);
        });
    });

    rtAPIv1.put("/users/:id", function(req, res) {
        let user = {
            name: req.query.name
        };
        User.update({
            "_id": ObjectId(req.params.id)
        }, user, (err, result) => {
            res.send(result);
        });
    });

    rtAPIv1.get("/users/:query", function(req, res) {
        User.find({
            "_id": ObjectId(req.params.query)
        }, (err, result) => {
            res.send(result);
        });
    });


    //Задачи

    rtAPIv1.get("/tasks/", function(req, res) {
        Task.find((err, result) => {
            res.send(result);
        });
    });

    rtAPIv1.post("/tasks/", function(req, res) {
        let task = Task({
            name: req.body.name,
            description: req.body.description,
            isOpen: req.body.isOpen,
            user: ObjectId(req.body.user)
        });
        task.save((err, result) => {
            res.send(result);
        });
    });

    rtAPIv1.delete("/tasks/:id", function(req, res) {
        Task.remove({
            "_id": ObjectId(req.params.id)
        }, (err, result) => {
            res.send(result);
        });
    });

    rtAPIv1.put("/tasks/:id", function(req, res) {
        let task = {
            name: req.query.name,
            description: req.query.description,
            isOpen: req.query.isOpen,
            user: ObjectId(req.query.user)
        };
        Task.update({
            "_id": ObjectId(req.params.id)
        }, task, (err, result) => {
            res.send(result);
        });
    });

    rtAPIv1.get("/tasks/:query", function(req, res) {
        Task.find({
            "$or": [{
                "name": req.params.query
            }, {
                "description": req.params.query
            }]
        }, (err, result) => {
            res.send(result);
        });
    });

    //Открытие-закрытие задачи

    rtAPIv1.put("/tasks/:id/open", function(req, res) {
        Task.findOne({
            "_id": ObjectId(req.params.id)
        }, (err, task) => {
            task.isOpen = true;
            task.save((err, result) => {
                res.send(result);
            });
        });
    });

    rtAPIv1.put("/tasks/:id/close", function(req, res) {
        Task.findOne({
            "_id": ObjectId(req.params.id)
        }, (err, task) => {
            task.isOpen = false;
            task.save((err, result) => {
                res.send(result);
            });
        });
    });

    //Делегирование на пользователя

    rtAPIv1.put("/tasks/:id/user/:user", function(req, res) {
        Task.findOne({
            "_id": ObjectId(req.params.id)
        }, (err, task) => {
            task.user = ObjectId(req.params.user);
            task.save((err, result) => {
                res.send(result);
            });
        });
    });


});

app.use("/api/v1", rtAPIv1);
app.listen(3000);