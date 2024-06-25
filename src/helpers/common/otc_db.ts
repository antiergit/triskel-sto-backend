// import Coin from "../../modules/coin/model.coin";
import { DBInterface } from "../../interfaces/db.interface";
import { Sequelize } from "sequelize";
import { config } from "../../config";

class Database implements DBInterface {
  public db_write: Sequelize;
  public db_read: Sequelize;
  public connectionWrite: string;
  public connectionRead: string;

  constructor() {

    // let config: [
    //   root: 'root',
    //   DB_PASSWORD: 'admin123',
    //   DB_HOST_WRITE: 'localhost',
    //   DB_HOST_READ: 'localhost',
    //   DB_NAME: 'triskel_wallet'
    // ]

    // this.connectionWrite = `mysql://root:admin123@localhost/triskel_wallet`;

    // this.connectionRead = `mysql://root:admin123@localhost/triskel_wallet`;


    this.connectionWrite = `mysql://${config.DB.DB_USER}:${config.DB.DB_PASSWORD}@${config.DB.DB_HOST_WRITE}/${config.DB.OTC_DB_NAME}`;

    this.connectionRead = `mysql://${config.DB.DB_USER}:${config.DB.DB_PASSWORD}@${config.DB.DB_HOST_READ}/${config.DB.OTC_DB_NAME}`;

    this.db_write = new Sequelize(this.connectionWrite, {
      dialect: "mysql",
      logging: false,
      define: {
        charset: "utf8",
        collate: "utf8_general_ci",
        underscored: true,
        timestamps: true,
      },
      pool: {
        max: 5,
        min: 0,
        idle: 20000,
        acquire: 20000,
      },
    });

    this.db_read = new Sequelize(this.connectionRead, {
      dialect: "mysql",
      logging: false,
      define: {
        charset: "utf8",
        collate: "utf8_general_ci",
        underscored: true,
        timestamps: true,
      },
      pool: {
        max: 5,
        min: 0,
        idle: 20000,
        acquire: 20000,
      },
    });
    // this.syncTables();
  }

  public async syncTables() {
    await this.db_write.sync({ alter: true });
  }
}
const wallet_db = new Database();
export default {
  db_write: wallet_db.db_write,
  db_read: wallet_db.db_read,
};
