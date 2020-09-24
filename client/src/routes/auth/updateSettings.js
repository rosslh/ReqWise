export function put(req, res) {
  const { theme, imageName, doneProjectTour, doneTeamTour } = req.body;
  req.session.user = { ...req.session.user, theme, imageName, doneProjectTour, doneTeamTour };
  req.session.save((err) => {
    if (err) {
      console.error(err);
    }
  });
  res.setHeader("Content-Type", "application/json");

  res.end(JSON.stringify({ theme, imageName, doneProjectTour, doneTeamTour }));
}
