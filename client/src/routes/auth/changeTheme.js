export function put(req, res) {
    const { darkModeEnabled } = req.body;
    req.session.user = { ...req.session.user, darkModeEnabled };
    req.session.save((err) => {
        if (err) {
            console.error(err);
        }
    });
    res.setHeader("Content-Type", "application/json");

    res.end('"success"');
}
