/**
 * Logs the message in info level.
 * @param {string} str - message
 */
function info(str) {
    return console.info("INFO: " + str);
}

/**
 * Logs the message in error level.
 * @param {[string | Object | Error]} err - message
 */
function error(err) {
    console.log("ERROR: " + formatError(err));

    if (err.stack) {
        console.log("ERROR STACK: " + err.stack);
    }
}

/**
 * Logs the message in warn level.
 * @param {string} str - message
 */
function warn(str) {
    return console.warn("WARN: " + str);
}

/**
 * Logs the main process in info level.
 * @param {string} str - message
 */
function logMainProcess(str) {
    return console.info("----- " + str + " -----");
}

/**
 * Formats the error according to its type.
 * @param {[string | Object | Error]} err - message
 */
function formatError(err) {
    // TODO: Handle Error type
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
