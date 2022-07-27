import * as Express from 'express';

import { autocompleteGet } from 'routes/autocomplete';

export const initRoutes = (app: Express.Application) => {
	app.get('/autocomplete', autocompleteGet);
};
