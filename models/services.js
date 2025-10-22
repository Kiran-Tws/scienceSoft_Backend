// models/services.js
'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Services extends Model {
    static associate(models) {
      // Define associations here if needed
      // Example: Services.hasMany(models.SomeOtherModel, { foreignKey: 'serviceId' });
    }
  }

  Services.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Maps to gen_random_uuid()
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: 'services',
      modelName: 'Services',
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );

  return Services;
};
