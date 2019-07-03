

exports.ping = (req, res) => {
    let statusCode = 200;
    let statusMsg = "pong";

    //res.sendStatus(statusCode);
    res.status(statusCode).send(statusMsg);
};

const maxDelayMs = 12*60*60*1000;
exports.delay = ms => new Promise(res => setTimeout(res, Math.min(ms, maxDelayMs)));


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


exports.isDst = () => {
    let now = new Date();
    let jan = new Date(now.getFullYear(), 0, 1);
    let jul = new Date(now.getFullYear(), 6, 1);
    
    return now.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

