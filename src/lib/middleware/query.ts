import url from "url";

const query = () => {
	return (req, res, next) => {
		if (req.query) {
			return next();
		}
		const parsedUrl = url.parse(req.url, true);
		const { pathname } = parsedUrl;
		const query = { ...parsedUrl.query };

		req.baseUrl = '';
		req.path = pathname;
		req.query = query;
		
		next();
	};
};

export default query;