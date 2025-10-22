// models/final_contact.js
'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class FinalContact extends Model {
    static associate(models) {
    }
  }

  FinalContact.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      work_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      preferred_communication: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'final_contact',
      modelName: 'FinalContact',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false, // Disable updatedAt since schema doesn't include it
    }
  );

  return FinalContact;
};