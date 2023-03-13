const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  longDescription: { type: String, required: true },
  courseIds: { type: [mongoose.Schema.Types.ObjectId], required: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: false },
  coAuthorIds: { type: [mongoose.Schema.Types.ObjectId], required: false },
  rewardIds: { type: [mongoose.Schema.Types.ObjectId], required: false }
});

const Track = mongoose.model('Track', trackSchema);

const courseSchema = new mongoose.Schema({
  learningTrackId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  seqNumber: { type: Number, required: function() { return Number.isInteger(this.seqNumber) } },
  shortDescription: { type: String, required: true },
  longDescription: { type: String, required: true },
  nHours: { type: Number, required: function() { return Number.isInteger(this.nHours) } },
  nLessons: { type: Number, required: function() { return Number.isInteger(this.nLessons) } },
  nQuestions: { type: Number, required: function() { return Number.isInteger(this.nQuestions) } },
  xp: { type: Number, required: function() { return Number.isInteger(this.xp) } },
  topicIds: { type: [mongoose.Schema.Types.ObjectId], required: false }
});

const Course = mongoose.model('Course', courseSchema);

const topicSchema = new mongoose.Schema({
  learningTrackId: { type: mongoose.Schema.Types.ObjectId, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  seqNumber: { type: Number, required: function() { return Number.isInteger(this.seqNumber) } },
  description: { type: String, required: true },
  topicItemIds: { type: [mongoose.Schema.Types.ObjectId], required: false }
});

const Topic = mongoose.model('Topic', topicSchema);

const topicItemSchema = new mongoose.Schema({
  learningTrackId: { type: mongoose.Schema.Types.ObjectId, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, required: true },
  seqNumber: { type: Number, required: function() { return Number.isInteger(this.seqNumber) } },
  type: { type: String, required: true, enum: [ 'LSN', 'MCQ', 'TFQ', 'SAQ', 'CQ' ] },
  title: { type: String, required: true },
  xp: { type: Number, required: function() { return Number.isInteger(this.xp) } },
  content: { type: String, required: true },
  instructions: { type: [String], required: false },
  hints: { type: [String], required: false },
  mcqOptions: { type: [String], required: false },
  mcqAnswerIndex: { type: Number, required: function() { return Number.isInteger(this.mcqAnswerIndex) && this.mcqAnswerIndex >= -1 } },
  tfqAnswer: { type: Boolean, required: false },
  saqAnswer: { type: [String], required: false },
  cqAnswer: { type: String, required: false },
  //cqStarterCode: { type: String, required: false }
});

const TopicItem = mongoose.model('Item', topicItemSchema);

const badgeSchema = new mongoose.Schema({
  learningTrackId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true, enum: [ 'TPITM', 'TOPIC', 'COURS', 'TRACK' ] },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentTitle: { type: String, required: true }
});

const Badge = mongoose.model('Badge', badgeSchema);

// export all in one object like this or won't work
module.exports = {
  Track, Course, Topic, TopicItem, Badge
}