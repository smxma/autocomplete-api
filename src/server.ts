import * as Path from 'path';
import * as BodyParser from 'body-parser';
import * as Winston from 'winston';
import express = require('express');
import morgan = require('morgan');

import { settings } from "settings";
import { initRoutes } from "routes";
import { loader } from "./loader";

export class Server {
	public app: express.Application;
	public log: Winston.LoggerInstance;
	public router: express.Router;

  constructor() {
    this.app = express();
    this.setLogger();
    loader();
    this.setConfig();
    this.setRoutes();
  }

	public start() {
		this.app.listen(settings.PORT);
		this.log.info(`Server started at ${settings.PORT}`);
	}

	private setConfig() {
		this.app.use('/', express.static(settings.PUBLIC_PATH));
		this.app.use(BodyParser.json());
	}

	private setRoutes() {
		initRoutes(this.app);
	}

	private setLogger() {
		// Set up application logging
		this.log = new Winston.Logger({
			transports: [
				new Winston.transports.File({
					level: 'info',
					filename: Path.resolve(settings.LOG_PATH, 'server.log'),
					handleExceptions: true,
					json: true,
					maxsize: 5242880, // 5MB
					maxFiles: 5,
					colorize: true,
				}),
				new Winston.transports.Console({
					level: 'debug',
					handleExceptions: true,
					json: false,
					colorize: true,
				}),
			],
			exitOnError: false,
		});

		// Set up HTTP request logging
		const morganOptions = {
			stream: {
				write: (message: string) => {
					this.log.info(message);
				},
			},
		};

		this.app.use(morgan('combined', morganOptions));
	}
}
