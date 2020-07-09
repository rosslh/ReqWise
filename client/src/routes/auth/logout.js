export function post(req, res) {
  req.session.destroy();
  res.clearCookie("__session");
  if (req.session) {
    delete req.session.user;
  }
  res.end(JSON.stringify({ ok: true }));
}
