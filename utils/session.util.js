const regenerateSession = request =>
    new Promise((resolve, reject) => {
        request.session.regenerate(error => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });

const saveSession = request =>
    new Promise((resolve, reject) => {
        request.session.save(error => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });

const destroySession = request =>
    new Promise((resolve, reject) => {
        request.session.destroy(error => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });

module.exports = {
    regenerateSession,
    saveSession,
    destroySession,
};
