import { post as p } from "../../api";

export function post(req, res) {
  const { email, password } = req.body;
  p("/auth/token", { email, password }).then((r) => {
    if (r) req.session.user = { id: r.userId, jwt: r.token, theme: r.theme, imageName: r.imageName };

    res.setHeader("Content-Type", "application/json");

    res.end(JSON.stringify(r));
  });
}
