// models/questions.js
'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Questions extends Model {
    static associate(models) {
      // Associate Questions with FormSteps
   Questions.belongsTo(models.FormSteps, {
        as: 'form_step',
        foreignKey: 'form_step_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
     
    }
  }

  Questions.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Maps to gen_random_uuid()
        allowNull: false,
        primaryKey: true,
      },
      form_step_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'form_steps',
          key: 'id',
        },
      },
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      input_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['text', 'number', 'radio', 'checkbox', 'dropdown']], // Enforce allowed input types
        },
      },
      allow_other: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'questions',
      modelName: 'Questions',
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );

  return Questions;
};