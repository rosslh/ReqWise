export function post(req, res) {
  req.session.destroy();
  res.end(JSON.stringify({ ok: true }));
}
