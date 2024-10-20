import http from "http";

const res = Object.create(http.ServerResponse.prototype);

res.status = function(code) {
	this.statusCode = code;
	return this;
};

res.set = function(name, value) {
	this.setHeader(name, value);
	return this;
};

res.cookie = function(name, value) {
	return this.set('Set-Cookie', `${name}=${value}`);
}

res.send = function(body) {
	if (typeof body === 'object') {
		return this.json(body);
	}
	this.setHeader('Content-Type', 'text/plain');
	this.end(body);
};

res.json = function(body) {
	this.setHeader('Content-Type', 'application/json; charset=utf-8');
	this.end(JSON.stringify(body));
};

res.redirect = function(path) {
	this.status(302).set('Location', path).end();
};

export default res;