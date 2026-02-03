const isAbsoluteUrl = value => /^https?:\/\//i.test(value);

const pathToUrl = (request, value) => {
    if (!value) return null;
    if (isAbsoluteUrl(value)) return value;
    return `${request.protocol}://${request.get('host')}${value}`;
};

const urlToPath = value => {
    if (!value) return value;
    if (!isAbsoluteUrl(value)) return value;
    try {
        return new URL(value).pathname;
    } catch (error) {
        return value;
    }
};

module.exports = { pathToUrl, urlToPath };
