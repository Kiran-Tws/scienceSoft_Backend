// models/form_steps.js
"use strict";

import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class FormSteps extends Model {
    static associate(models) {
      // Associate FormSteps with Subcategories
      FormSteps.belongsTo(models.Subcategories, {
        as: "subcategory",
        foreignKey: "subcategory_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      FormSteps.hasMany(models.Questions, {
        as: "questions",
        foreignKey: "form_step_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  FormSteps.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Maps to gen_random_uuid()
        allowNull: false,
        primaryKey: true,
      },
      subcategory_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "subcategories",
          key: "id",
        },
      },
      step_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "form_steps",
      modelName: "FormSteps",
      timestamps: true,
      updatedAt: "updated_at",
      createdAt: "created_at",
    }
  );

  return FormSteps;
};
