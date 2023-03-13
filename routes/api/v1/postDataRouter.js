const express = require("express");
const router = express.Router();

const { allowOriginURL } = require("./constants");

const mongoose = require('mongoose');
require('./connect');
const { Track, Course, Topic, TopicItem, Badge } = require('./schemasAndModels');


router.post('/update/item', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  

    console.log('req.body: ',req.body);

    TopicItem.findById(req.body.id)
        .then(document => {
            console.log('topic item to update: ', document);
            document.seqNumber = req.body.seqNumber;
            document.type = req.body.type;
            document.title = req.body.title;
            document.xp = req.body.xp;
            document.content = req.body.content;
            document.instructions = req.body.instructions;
            document.hints = req.body.hints;
            document.mcqOptions = req.body.mcqOptions;
            document.mcqAnswerIndex = req.body.mcqAnswerIndex;
            document.cqAnswer = req.body.cqAnswer;
            document.saqAnswer = req.body.saqAnswer;
            document.tfqAnswer = req.body.tfqAnswer;
            document.save()
                    .then(document => {
                        console.log('Topic Item entity updated: ', document);
                        res.json({ response: document });
                    });
        })
        .catch(err => {
            console.log('Error updating Topic Item entity: ', err);
            res.json({ error: err });
        });
});

router.post('/update/topic', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  

    Topic.findById(req.body.id)
        .then(document => {
            console.log('topic to update: ', document);
            document.title = req.body.title;
            document.seqNumber = req.body.seqNumber;
            document.description = req.body.description;
            document.save()
                    .then(document => {
                        console.log('Topic entity updated: ', document);
                        res.json({ response: document });
                    });
        })
        .catch(err => {
            console.log('Error updating Topic entity: ', err);
            res.json({ error: err });
        });    
});

router.post('/update/course', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  

    Course.findById(req.body.id)
        .then(document => {
            // console.log('course to update: ', document);
            document.title = req.body.title;
            document.seqNumber = req.body.seqNumber;
            document.shortDescription = req.body.shortDescription;
            document.longDescription = req.body.longDescription;
            document.save()
                    .then(document => {
                        // console.log('Course entity updated: ', document);
                        res.json({ response: document });
                    });
        })
        .catch(err => {
            // console.log('Error updating Course entity: ', err);
            res.json({ error: err });
        });
});

router.post('/update/track', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  

    if (!req.body.id)
        res.json({ error: "POST request failed at /api/v1/post/update/track endpoint. No id field provided." });

    Track.findById(req.body.id)
        .then(document => {
            // console.log('track to update: ', document);
            document.title = req.body.title;
            document.shortDescription = req.body.shortDescription;
            document.longDescription = req.body.longDescription;
            document.save()
                    .then(document => {
                        // console.log('Learning Track entity updated: ', document);
                        res.json({ response: document });
                    });
        })
        .catch(err => {
            // console.log('Error updating Learning Track entity: ', err);
            res.json({ error: err });
        });
});

router.post('/create/badge', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  
    
    const { learningTrackId, title, type, contentId, contentTitle } = req.body;

    let newBadgeEntity = new Badge({ learningTrackId, title, type, contentId, contentTitle });

    newBadgeEntity
        .save()
        .then(document => {
            console.log('New Badge entity created: ', document);
            res.json({ response: document });
        })
        .catch(err => {
            console.log('Error creating new Badge entity: ', err);
            res.json({ error: err });
        });
});

router.post('/create/item', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  
    
    const { learningTrackId, courseId, topicId,
            seqNumber, type, title, xp, content, 
            instructions, hints, mcqOptions, mcqAnswerIndex, 
            cqAnswer, saqAnswer, tfqAnswer } = req.body;

    let newTopicItemEntity = new TopicItem({ 
        learningTrackId, courseId, topicId,
        seqNumber, type, title, xp, content, 
        instructions, hints, mcqOptions, mcqAnswerIndex, 
        cqAnswer, saqAnswer, tfqAnswer 
    });

    newTopicItemEntity
        .save()
        .then(document => {
            console.log('New Topic Item entity created: ', document);
            res.json({ response: document });
        })
        .catch(err => {
            console.log('Error creating new Topic Item entity: ', err);
            res.json({ error: err });
        });
});

router.post('/create/topic', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  
    
    let newTopicEntity = new Topic({
        learningTrackId: req.body.learningTrackId,
        courseId: req.body.courseId,
        title: req.body.title,
        seqNumber: req.body.seqNumber,
        description: req.body.description
    });

    newTopicEntity
        .save()
        .then(document => {
            console.log('New Topic entity created: ', document);
            res.json({ response: document });
        })
        .catch(err => {
            console.log('Error creating new Topic entity: ', err);
            res.json({ error: err });
        });
});

const HOURS_PER_COURSE = 4, XP = 100;
router.post('/create/course', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  
    
    let newCourseEntity = new Course({
        learningTrackId: req.body.learningTrackId,
        title: req.body.title,
        seqNumber: req.body.seqNumber,
        shortDescription: req.body.shortDescription,
        longDescription: req.body.longDescription,
        nHours: HOURS_PER_COURSE,
        nLessons: 1,
        nQuestions: 4,
        xp: XP
    });

    newCourseEntity
        .save()
        .then(document => {
            // console.log('New Course entity created: ', document);
            res.json({ response: document });
        })
        .catch(err => {
            // console.log('Error creating new Course entity: ', err);
            res.json({ error: err });
        });
});

router.post('/create/track', function(req, res) {
    res.set('Access-Control-Allow-Origin', allowOriginURL);  
    
    let newLearningTrackEntity = new Track({
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        longDescription: req.body.longDescription
    });

    newLearningTrackEntity
        .save()
        .then(document => {
            // console.log('New Learning Track entity created: ', document);
            res.json({ response: document });
        })
        .catch(err => {
            // console.log('Error creating new Learning Track entity: ', err);
            res.json({ error: err });
        });
});

/*
    /post

    /create - for creating new entities in the database
    /track
    /course
    /topic
    /item

    /update - for updating existing entities in the database
    /track
    /course
    /topic
    /item
*/

module.exports = router;