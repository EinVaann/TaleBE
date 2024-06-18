import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres://postgres.aitcvpzzmnnclnymbndj:einacht3012@aws-0-us-west-1.pooler.supabase.com:6543/postgres', {
  dialect: 'postgres',
});

export default sequelize;