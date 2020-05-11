export function put(req, res) {
    const { theme } = req.body;
    req.session.user = { ...req.session.user, theme };
    req.session.save((err) => {
        if (err) {
            console.error(err);
        }
    });
    res.setHeader("Content-Type", "application/json");

    res.end('"success"');
}
