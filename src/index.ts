import { Server as HTTPServer, createServer } from "http";
import express, { NextFunction, Request, Response } from "express";
import { ServerInterface } from "./interfaces/server.interface";
import appControllers from "./modules/sto/controllers.index";

import cors from "cors";
import path from "path";
import expressFileUploader from "express-fileupload";
import { config } from "./config";

import helmet from "helmet";
import { encryptionMiddleware } from "./middlewares/encryption.middleware";
import { ValidationError, Joi } from 'express-validation';
import { GlblCode, GlblMessages, InfoMessages } from "./constants/global_enum";

class Server implements ServerInterface {
  public app: express.Application;
  public httpServer: HTTPServer;

  constructor() {
    this.app = express();

    this.app.use(expressFileUploader());
    this.httpServer = createServer(this.app);
    this.app.use(helmet());
    this.app.use(helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "frame-ancestors": "'none'",
      },
    }));
    this.app.use(helmet.dnsPrefetchControl());
    this.app.use(helmet.expectCt());
    this.app.use(helmet.frameguard({
      action: "deny",
    }));
    this.app.use(helmet.hidePoweredBy());
    this.app.use(helmet.hsts());
    this.app.use(helmet.ieNoOpen());
    this.app.use(helmet.noSniff());
    this.app.use(helmet.permittedCrossDomainPolicies());
    this.app.use(helmet.referrerPolicy());
    // this.app.use(helmet.xssFilter());

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Strict-Transport-Security", " max-age=31536000; includeSubDomains");
      next();
    });

    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(cors());
    this.app.use(
      `/api/v1/static`,
      express.static(path.join(__dirname, "public"))
    );
    this.app.use(express.static(path.join(__dirname, 'public')))
    this.app.set('views', './views');
    this.app.use(encryptionMiddleware);
    this.initializeControllers();
    this.startServer();
    this.checkHealth();


    this.app.use(function (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      console.error('err >>>>>> ', err);
      if (err instanceof ValidationError) {

        return res.status(err.statusCode).json({
          statusCode: err.statusCode,
          message: err.message,
          name: err.name,
          error: err.error
        });
      }
      return res.status(GlblCode.NOT_FOUND).json(
        {
          statusCode: GlblCode.NOT_FOUND,
          message: GlblMessages.CATCH_MSG
        }
      );
    });
  }

  public startServer() {
    this.httpServer.listen(config.PORT, () => {
      console.log("sto server started at >>>", config.PORT)
    });
    this.app.get("/", (req: Request, res: Response) => {
      res.send(InfoMessages.APP_INFO).status(GlblCode.SUCCESS);
    });
    this.app.get('/transaction-success', function (req, res) {
      res.sendFile(__dirname + '/views/index.html')
    });
    this.app.get("/apple-app-site-association", (req, res) => {
      res.set('Content-Type', 'application/pkcs7-mime');
      res.status(200);
      res.sendFile(__dirname + "/apple-app-site-association")
    })
    process.on('uncaughtException', function (err) {
      console.log('Caught exception >>>>' + err);
    });

  }

  public initializeControllers() {
    const url: string = `/api/v1`;
    console.log(
      "\n\n\n🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪",
      url,
      "🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪🌪\n"
    );


    appControllers.forEach((appControllersRoute) => {
      this.app.use(url, appControllersRoute.router);
    });
  }

  public checkHealth() {
    this.app.use("/", (req: Request, res: Response, next: NextFunction) => {
      const healthcheck: any = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
      };
      try {
        res.status(200).send(healthcheck);
      } catch (error) {
        healthcheck.message = error;
        res.status(503).send();
      }
    })
  }
}

new Server();
