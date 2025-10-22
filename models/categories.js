// models/categories.js
'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      // Associate Categories with Services
      Categories.belongsTo(models.Services, {
        as: 'service',
        foreignKey: 'service_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Categories.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Maps to gen_random_uuid()
        allowNull: false,
        primaryKey: true,
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'services',
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
      tableName: 'categories',
      modelName: 'Categories',
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );

  return Categories;
};