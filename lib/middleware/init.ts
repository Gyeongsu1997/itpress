const init = (app) => {
	return (req, res, next) => {
		Object.setPrototypeOf(req, app.request);
		Object.setPrototypeOf(res, app.response);
		next();
	};
}

export default init;