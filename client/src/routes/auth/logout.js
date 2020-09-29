export function post(req, res) {
  req.session.destroy();
  res.clearCookie("__session");
  if (req.session && req.session.user) {
    delete req.session.user;
  }
  res.end(JSON.stringify({ ok: true }));
}
