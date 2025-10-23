// index.js
'use strict';

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import process from 'process';
import config from '../config/config.json' assert { type: 'json' };
import ServicesModel from './services.js';
import CategoryModel from './categories.js';
import SubCategoryModel from './subcategories.js';
import FormStepsModels from './form_steps.js';
import QuestionsModel from './questions.js';
import QuestionOptionsModel from './question_options.js';
import ContactFormModel from './final_contact.js';
import UserResponseModel from './user_responses.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

let sequelize;
if (config[env].use_env_variable) {
  sequelize = new Sequelize(process.env[config[env].use_env_variable], config[env]);
} else {
  sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);
}


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(async file => {
    const modelPath = pathToFileURL(path.join(__dirname, file)).href;
    const { default: model } = await import(modelPath);
    const initializedModel = model(sequelize, Sequelize.DataTypes);
    db[initializedModel.name] = initializedModel;
  });


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Initialize all models
db.Services = ServicesModel(sequelize, Sequelize.DataTypes);
db.Categories = CategoryModel(sequelize,Sequelize.DataTypes);
db.Subcategories = SubCategoryModel(sequelize,Sequelize.DataTypes);
db.FormSteps= FormStepsModels(sequelize,Sequelize.DataTypes);
db.Questions = QuestionsModel(sequelize,Sequelize.DataTypes);
db.QuestionOptions = QuestionOptionsModel(sequelize,Sequelize.DataTypes);
db.FinalContact = ContactFormModel(sequelize,Sequelize.DataTypes);
db.UserResponses = UserResponseModel(sequelize,Sequelize.DataTypes);

export default db;