

exports.ping = (req, res) => {
    let statusCode = 200;
    let statusMsg = "pong";

    //res.sendStatus(statusCode);
    res.status(statusCode).send(statusMsg);
};


exports.delay = ms => new Promise(res => setTimeout(res, ms));


// try to get parameter from session, body(post), url path(route) or url query(url params), in that order of precedent
exports.getParam = (req, paramName) => {
    let paramVal = null;
    if (req && paramName) {
        if (req.session && req.session[paramName])
            paramVal = req.session[paramName];
        if (req.body && req.body[paramName])
            paramVal = req.body[paramName];
        else if (req.params && req.params[paramName])
            paramVal = req.params[paramName];
        else if (req.query && req.query[paramName])
            paramVal = req.query[paramName];
    }
    return paramVal;
}


