'use strict';

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import process from 'process';
import config from '../config/config.json' assert { type: 'json' };

// Import model definitions
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

// Initialize all models first, add them to db object
db.Services = ServicesModel(sequelize, Sequelize.DataTypes);
db.Categories = CategoryModel(sequelize, Sequelize.DataTypes);
db.Subcategories = SubCategoryModel(sequelize, Sequelize.DataTypes);
db.FormSteps = FormStepsModels(sequelize, Sequelize.DataTypes);
db.Questions = QuestionsModel(sequelize, Sequelize.DataTypes);
db.QuestionOptions = QuestionOptionsModel(sequelize, Sequelize.DataTypes);
db.FinalContact = ContactFormModel(sequelize, Sequelize.DataTypes);
db.UserResponses = UserResponseModel(sequelize, Sequelize.DataTypes);

// Now call 'associate' on each model if it exists: this sets up associations using the full db object
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;


