function info(str) {
    return console.info("INFO: " + str);
}

function error(str) {
    console.log("ERROR: " + formatError(str));

    if (str.stack) {
        console.log("ERROR STACK: " + str.stack);
    }
}

function warn(str) {
    return console.warn("WARN: " + str);
}

function logMainProcess(str) {
    return console.info("----- " + str + " -----");
}

function formatError(err) {
    if (typeof err === "object") {
        return JSON.stringify(err);
    }

    return err;
}

module.exports = {
    info: info,
    error: error,
    warn: warn,
    logMainProcess: logMainProcess
}
