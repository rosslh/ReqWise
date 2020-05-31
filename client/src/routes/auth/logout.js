export function post(req, res) {
  req.session.destroy();
  delete req.session.user;
  res.end(JSON.stringify({ ok: true }));
}
