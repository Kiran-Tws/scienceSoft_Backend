// models/subcategories.js
'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Subcategories extends Model {
    static associate(models) {
      // Associate Subcategories with Categories
      Subcategories.belongsTo(models.Categories, {
        as: 'category',
        foreignKey: 'category_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Subcategories.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Maps to gen_random_uuid()
        allowNull: false,
        primaryKey: true,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon: {
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
      tableName: 'subcategories',
      modelName: 'Subcategories',
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );

  return Subcategories;
};