import http from "http";
import finalhandler from "finalhandler";
import request from "./request";
import response from "./response";
import Router from "./router";
import bodyParser from "body-parser";
import serveStatic from "serve-static";
import init from "./middleware/init";
import query from "./middleware/query";

const createApplication = () => {
	const _router = Router();

	const app = (req, res) => {
		_router.handle(req, res, finalhandler(req, res));
	};

	const listen = (...args) => {
		const server = http.createServer(app);
		return server.listen(...args);
	};

	app.request = Object.create(request);
	app.response = Object.create(response);
	
	app.listen = listen;
	app.use = _router.use.bind(_router); 
	// app.all = _router.all.bind(_router);
	app.get = _router.get.bind(_router);
	// app.post = _router.post.bind(_router);
	// app.delete = _router.delete.bind(_router);

	_router.use(init(app));
	_router.use(query());

	return app;
};

createApplication.Router = Router;
createApplication.json = bodyParser.json;
createApplication.urlencoded = bodyParser.urlencoded;
createApplication.static = serveStatic;

export default createApplication;
