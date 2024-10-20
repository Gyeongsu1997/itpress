class Layer {
	private path;
	private method;
	private handler;

	constructor(path, method, fn) {
		this.path = path;
		this.method = method;
		this.handler = fn;
	}

	handle_error(err, req, res, next) {
		const fn = this.handler;

		if (fn.length !== 4) {
			return next(err);
		}

		try {
			fn(err, req, res, next);
		} catch(err) {
			next(err);
		}
	}

	handle_request(req, res, next) {
		const fn = this.handler;

		if (fn.length > 3) {
			return next();
		}

		if (req.path !== this.path || req.method !== this.method) {
			return next();
		}

		try {
			fn(req, res, next);
		} catch(err) {
			next(err);
		}
	}
}

export default Layer;