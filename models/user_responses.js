// models/user_responses.js
'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserResponses extends Model {
    static associate(models) {
      // Associate UserResponses with Questions
      UserResponses.belongsTo(models.Questions, {
        as: 'question',
        foreignKey: 'question_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      // Associate UserResponses with Subcategories
      UserResponses.belongsTo(models.Subcategories, {
        as: 'subcategory',
        foreignKey: 'subcategory_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      // Associate UserResponses with QuestionOptions
      UserResponses.belongsTo(models.QuestionOptions, {
        as: 'selected_option',
        foreignKey: 'selected_option_id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        constraints: false, // Allow null since the column is nullable
      });
    }
  }

  UserResponses.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Maps to gen_random_uuid()
        allowNull: false,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id',
        },
      },
      subcategory_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'subcategories',
          key: 'id',
        },
      },
      selected_option_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'question_options',
          key: 'id',
        },
      },
      response_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'user_responses',
      modelName: 'UserResponses',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false, // Disable updatedAt since schema doesn't include it
    }
  );

  return UserResponses;
};