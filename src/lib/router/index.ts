const restore = (callback, obj, ...props) => {
	const values = props.reduce((values, key) => {
		values.push(obj[key]);
		return values;
	}, []);
  
	return (...args) => {
		for (let i = 0; i < props.length; i++) {
			obj[props[i]] = values[i];
		}
		return callback(...args);
	};
}

class Router {
	private stack = [];

	handle(req, res, next) {
		const done = (err) => next(err);

		const runMiddleware = (stack, i: number, err: Error) => {
			if (i >= stack.length) {
				return done(err);
			}

			const middleware = stack[i];
			const next = (err: Error) => runMiddleware(stack, i + 1, err);

			middleware(err, req, res, next);
		};

		runMiddleware(this.stack, 0, null);
	}

	use(path, ...handlers) {
		if (!path) {
			throw new TypeError('Router.use() requires a middleware function');
		}
		if (typeof path === 'function') {
			handlers = [path, ...handlers];
			path = '/';
		}
		if (typeof path !== 'string') {
			return;
		}

		const regExp = new RegExp(`^${path}/.*`);

		handlers.forEach(fn => {
			if (fn instanceof Router) {
				const middleware = (err, req, res, next) => {
					try {
						if (err) {
							return next(err);
						}
						if (path === '/') {
							return fn.handle(req, res, next);
						}
						if (req.path === path) {
							req.path += '/'
						}
						if (!regExp.test(req.path)) {
							return next();
						}
						next = restore(next, req, 'baseUrl', 'path');
						req.baseUrl += path;
						req.path = req.path.replace(path, '');
						return fn.handle(req, res, next);
					} catch(err) {
						return next(err);
					}
				}
	
				return this.stack.push(middleware);
			}

			if (typeof fn !== 'function') {
				throw new TypeError(`Router.use() requires a middleware function but got a ${fn.toString()}`);
			}

			const middleware = (err, req, res, next) => {
				try {
					if (err && fn.length !== 4) {
						return next(err);
					}
					if (!err && fn.length > 3) {
						return next();
					}
					if (path === '/') {
						return fn.length === 4 ? fn(err, req, res, next) : fn(req, res, next);
					}
					if (req.path === path) {
						req.path += '/'
					}
					if (!regExp.test(req.path)) {
						return next(err);
					}
					next = restore(next, req, 'baseUrl', 'path');
					req.baseUrl += path;
					req.path = req.path.replace(path, '');
					return fn.length === 4 ? fn(err, req, res, next) : fn(req, res, next);
				} catch(err) {
					return next(err);
				}
			};

			this.stack.push(middleware);
		});
	}

	get(path, ...handlers) {
		if (typeof path !== 'string') {
			return;
		}
		handlers.forEach(fn => {
			if (typeof fn !== 'function') {
				throw new TypeError(`Router.get() requires a callback function but got a ${fn.toString()}`);
			}
			if (fn.length > 3) {
				return;
			}

			const middleware = (err, req, res, next) => {
				try {
					if (err || (req.path !== path || req.method !== 'GET')) {
						return next(err);
					}
					return fn(req, res, next);
				} catch (err) {
					return next(err);
				}
			}

			this.stack.push(middleware);
		});
	}

	post(path, ...handlers) {
		if (typeof path !== 'string') {
			return;
		}
		handlers.forEach(fn => {
			if (typeof fn !== 'function') {
				throw new TypeError(`Router.get() requires a callback function but got a ${fn.toString()}`);
			}
			if (fn.length > 3) {
				return;
			}

			const middleware = (err, req, res, next) => {
				try {
					if (err || (req.path !== path || req.method !== 'POST')) {
						return next(err);
					}
					return fn(req, res, next);
				} catch (err) {
					return next(err);
				}
			}

			this.stack.push(middleware);
		});
	}
}

export default () => {
	return new Router();
};