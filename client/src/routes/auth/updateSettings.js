export function put(req, res) {
    const { theme, imageName } = req.body;
    req.session.user = { ...req.session.user, theme, imageName };
    req.session.save((err) => {
        if (err) {
            console.error(err);
        }
    });
    res.setHeader("Content-Type", "application/json");

    res.end(JSON.stringify({ imageName }));
}
