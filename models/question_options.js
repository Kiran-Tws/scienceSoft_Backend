// models/question_options.js
'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class QuestionOptions extends Model {
    static associate(models) {
      // Associate QuestionOptions with Questions
      QuestionOptions.belongsTo(models.Questions, {
        as: 'question',
        foreignKey: 'question_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  QuestionOptions.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Maps to gen_random_uuid()
        allowNull: false,
        primaryKey: true,
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id',
        },
      },
      option_label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      option_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_other: {
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
      tableName: 'question_options',
      modelName: 'QuestionOptions',
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );

  return QuestionOptions;
};