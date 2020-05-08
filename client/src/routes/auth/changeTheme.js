export function put(req, res) {
    const { darkModeEnabled } = req.body;
    req.session.user = { ...req.session.user, darkModeEnabled };

    res.setHeader("Content-Type", "application/json");

    res.end('"success"');
}
