const express = require('express');
const router = express.Router();

const { allowOriginURL } = require("./constants");

const mongoose = require('mongoose');
require('./connect');
const { Track, Course, Topic, TopicItem, Badge } = require('./schemasAndModels');


function prepareLearningTrackProgressRecord(trackId, courseEntities, topicItemEntities) {
  
  // now you have all the course ids for the track
  const courseIds = courseEntities.map(courseEntity => courseEntity._id.toString());
  
  let totalTrackXP = 0;
  topicItemEntities.forEach(topicItemEntity => {
    totalTrackXP += topicItemEntity.xp;
  });

  let trackProgress = {
    id: trackId, 
    coursesCompletedIds: Array(courseIds.length).fill(""),
    coursesNotCompletedIds: courseIds.slice(),
    nCourses: courseIds.length,
    totalTrackXP: totalTrackXP,
    totalXPEarned: 0,
    rewardsEarned: []
  };

  console.log('trackProgress: ', trackProgress);

  return trackProgress;
}

function prepareCourseProgressRecord(courseEntities, topicEntities, topicItemEntities) {
  console.log('in function: courseEntities: ', courseEntities.length);
  console.log('in function: topicEntities: ', topicEntities.length);

  const courseProgress = {};
  console.log('courseProgress: ', courseProgress);

  // now you have topic ids grouped by course
  courseEntities.forEach(courseEntity => {
    // NB: in each CourseProgress, topicIds MUST be in order of increasing seqNumber
    let topicIdsArray = [];
    topicEntities.forEach(topicEntity => {
      console.log('topicEntity.courseId: ', topicEntity.courseId);
      if (topicEntity.courseId.toString() == courseEntity._id.toString()) {
        topicIdsArray.push(topicEntity._id.toString());
      }
    });

    let totalCourseXP = 0;
    topicItemEntities.forEach(topicItemEntity => {
      console.log('topicItemEntity.courseId: ', topicItemEntity.courseId);
      if (topicItemEntity.courseId.toString() == courseEntity._id.toString()) {
        totalCourseXP += topicItemEntity.xp;
      }
    });

    courseProgress[courseEntity._id] = {
      id: courseEntity._id, 
      learningTrackId: courseEntity.learningTrackId,
      seqNumber: courseEntity.seqNumber,
      topicsCompletedIds: Array(topicIdsArray.length).fill(""), 
      topicsNotCompletedIds: topicIdsArray.slice(),
      nTopics: topicIdsArray.length,
      totalCourseXP: totalCourseXP,
      totalXPEarned: 0
    };
  });
  console.log('courseProgress: ', courseProgress);
  return courseProgress;
}

function prepareTopicProgressRecord(topicEntities, topicItemEntities) {
  const topicProgress = {};

  topicEntities.forEach(topicEntity => {

    let topicItemsDataArray = [];
    let totalTopicXP = 0;

    topicItemEntities.forEach(topicItemEntity => {

      if (topicItemEntity.topicId.toString() == topicEntity._id.toString()) {
        topicItemsDataArray.push({
          id: topicItemEntity._id.toString(),
          topicId: topicItemEntity.topicId,
          seqNumber: topicItemEntity.seqNumber, 
          xp: topicItemEntity.xp
        });
        totalTopicXP += topicItemEntity.xp;
      }
    });

    topicProgress[topicEntity._id] = {
      id: topicEntity._id, 
      learningTrackId: topicEntity.learningTrackId,
      courseId: topicEntity.courseId,
      seqNumber: topicEntity.seqNumber,
      topicItemsCompleted: Array(topicItemsDataArray.length).fill({}), 
      topicItemsNotCompleted: topicItemsDataArray.slice(),
      nTopicItems: topicItemsDataArray.length,
      totalTopicXP: totalTopicXP,
      totalXPEarned: 0
    };
  });

  return topicProgress;
}

// https://www.theodinproject.com/lessons/node-path-javascript-async-and-await
// Returning in an async function is the same as resolving a promise. 
// Likewise, throwing an error will reject the promise
// await keyword is used to get a value from a function where you would normally use .then()
// to catch errors, append a .catch() after the asyncFunctionCall()

router.get('/template/progress/:trackId', async function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL); 

  try {

    const courseEntities = await Course.find({ learningTrackId: req.params.trackId })
      .sort({ seqNumber: 1 })  // important
      .exec();

    if (courseEntities.length == 0)
      throw new RangeError(`at /template/progress/track/${req.params.trackId}: no courses found`);

    console.log('courseEntities: ', courseEntities.length);


    const topicEntities = await Topic.find({ learningTrackId: req.params.trackId })
      .sort({ seqNumber: 1 })  // important
      .exec();

    if (topicEntities.length == 0)
      throw new RangeError(`at /template/progress/track/${req.params.trackId}: no topics found`);

    console.log('topicEntities: ', topicEntities.length);


    const allTopicItemsInLearningTrack = await TopicItem.find({ learningTrackId: req.params.trackId })
      .sort({ seqNumber: 1 })  // important
      .exec();

    if (allTopicItemsInLearningTrack.length == 0)
      throw new RangeError(`at /template/progress/track/${req.params.trackId}: no topic items found`);

    console.log('allTopicItemsInLearningTrack: ', allTopicItemsInLearningTrack.length);

    res.json({ 'response': { 
      learningTrackProgress: prepareLearningTrackProgressRecord(req.params.trackId, courseEntities, allTopicItemsInLearningTrack),
      courseProgress: prepareCourseProgressRecord(courseEntities, topicEntities, allTopicItemsInLearningTrack),
      topicProgress: prepareTopicProgressRecord(topicEntities, allTopicItemsInLearningTrack)
    }});
  }
  catch(error) {
    // console.log(`error at endpoint /template/progress/track/${req.params.trackId}: ${err}`);
    res.json({ 'error': error });
  }
});

router.get('/item/:itemId', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an object
  TopicItem.findById(req.params.itemId)
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /item/:itemId: ', err);
      res.json({ 'error': err });
    });
});

router.get('/topic/:topicId/item/:seqNumber', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  TopicItem.find({ topicId: req.params.topicId, seqNumber: req.params.seqNumber })
    .sort({ seqNumber: 1 })
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /topic/:topicId/items: ', err);
      res.json({ 'error': err });
    });
});

router.get('/topic/:topicId/items', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  TopicItem.find({ topicId: req.params.topicId })
    .sort({ seqNumber: 1 })
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /topic/:topicId/items: ', err);
      res.json({ 'error': err });
    });
});

router.get('/course/:courseId/items', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  TopicItem.find({ courseId: req.params.courseId })
    .sort({ topicId: 1, seqNumber: 1 })  // sorted by topicId then seqNumber
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /course/:courseId/topics: ', err);
      res.json({ 'error': err });
    });
});

router.get('/topic/:topicId', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an object
  Topic.findById(req.params.topicId)
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /topic/:topicId: ', err);
      res.json({ 'error': err });
    });
});

router.get('/course/:courseId/topics', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  Topic.find({ courseId: req.params.courseId })
    .sort({ seqNumber: 1 })
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /course/:courseId/topics: ', err);
      res.json({ 'error': err });
    });
});

router.get('/course/:courseId', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an object
  Course.findById(req.params.courseId)
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /course/:courseId: ', err);
      res.json({ 'error': err });
    });
});

router.get('/track/:trackId/badges', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  Badge.find({ learningTrackId: req.params.trackId })
    .sort({ type: 1, title: 1 })
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /track/:trackId/badges: ', err);
      res.json({ 'error': err });
    });
});

router.get('/track/:trackId/items', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  TopicItem.find({ learningTrackId: req.params.trackId })
    .sort({ topicId: 1, courseId: 1, seqNumber: 1 })
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /track/:trackId/items: ', err);
      res.json({ 'error': err });
    });
});

router.get('/track/:trackId/topics', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  Topic.find({ learningTrackId: req.params.trackId })
    .sort({ courseId: 1, seqNumber: 1 })
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /track/:trackId/topics: ', err);
      res.json({ 'error': err });
    });
});

router.get('/track/:trackId/courses', async function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  Course.find({ learningTrackId: req.params.trackId })
    .sort({ seqNumber: 1 })
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /track/:trackId/courses: ', err);
      res.json({ 'error': err });
    });
});

router.get('/track/:trackId', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an object
  Track.findById(req.params.trackId)
    .exec()
    .then(docs => {
      // console.log('response: ', docs);
      res.json({ 'response': docs });
    })
    .catch(err => {
      // console.log('error at endpoint /track/:trackId: ', err);
      res.json({ 'error': err });
    });
});

router.get('/tracks', function(req, res) {
  res.set('Access-Control-Allow-Origin', allowOriginURL);  

  // returns docs in an array of objects
  Track.find({})
    .sort({title: 1})
    .exec()
    .then(docs => {
      res.json({ 'response': docs });
    })
    .catch(err => {
      res.json({ 'error': err });
    });
});

router.get('/', function(req, res) {
  res.json({ response: 'This API is for viewing educational data.' });
});

module.exports = router;

/*
    UserModel.find()                   // find all users
            .skip(100)                // skip the first 100 items
            .limit(10)                // limit to 10 items
            .sort({firstName: 1}      // sort ascending by firstName
            .select({firstName: true} // select firstName only
            .exec()                   // execute the query
            .then(docs => {
                console.log(docs)
            })
            .catch(err => {
                console.error(err)

    req.headers:  {
      host: 'localhost:3001',
      connection: 'keep-alive',
      'sec-ch-ua': '"Chromium";v="109", "Not_A Brand";v="99"',
      accept: 'application/json',
      'sec-ch-ua-mobile': '?0',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'sec-ch-ua-platform': '"Linux"',
      origin: allowOriginURL,
      'sec-fetch-site': 'cross-site',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'if-none-match': 'W/"6f8-0QYRyw5MX5WvemOnEk8mpHzeVfY"'
    }
*/
