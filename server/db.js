const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const storagePath = process.env.SQLITE_FILE || path.join(__dirname, 'data', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false
});

const Conversation = sequelize.define('Conversation', {
  sessionId: { type: DataTypes.STRING, allowNull: false, unique: true },
  messages: { type: DataTypes.JSON, defaultValue: [] }
}, { timestamps: true });

const Note = sequelize.define('Note', {
  sessionId: { type: DataTypes.STRING, allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
  originalText: { type: DataTypes.TEXT, allowNull: false },
  generatedNotes: { type: DataTypes.TEXT, allowNull: false },
  pages: { type: DataTypes.INTEGER, defaultValue: 0 },
  fileSize: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true });

const Quiz = sequelize.define('Quiz', {
  sessionId: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  topic: { type: DataTypes.STRING, allowNull: false },
  questions: { type: DataTypes.JSON, defaultValue: [] },
  results: { type: DataTypes.JSON, defaultValue: [] }
}, { timestamps: true });

module.exports = { sequelize, Conversation, Note, Quiz };
