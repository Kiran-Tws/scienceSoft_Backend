import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class FinalContact extends Model {
    static associate(models) {
      // no associations needed here currently
    }
  }

  FinalContact.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,         // ensure one final contact per session
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
        validate: {
          isEmail: { msg: 'Must be a valid email address' }
        }
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          // Basic phone validation pattern — adjust as needed
          is: {
            args: /^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/i,
            msg: 'Must be a valid phone number',
          },
        },
      },
      preferred_communication: {
        type: DataTypes.ENUM('email', 'phone', 'sms', 'none'),
        allowNull: true,
        defaultValue: 'none',
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
      updatedAt: false,
    }
  );

  return FinalContact;
};
