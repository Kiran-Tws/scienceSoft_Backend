// migrations/20251022-create-question-options.mjs
import { literal, UUID, DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await queryInterface.createTable('question_options', {
    id: {
      type: UUID,
      defaultValue: literal('uuid_generate_v4()'),
      allowNull: false,
      primaryKey: true,
    },
    question_id: {
      type: UUID,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('NOW()'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('question_options');
}
