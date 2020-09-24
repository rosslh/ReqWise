import { format } from "date-fns";
import timeline from "./data.json";

const posts = Object.entries(timeline)
  .map(([fileName, post]) => {
    return {
      title: post.title,
      slug: fileName,
      date: format(new Date(post.date.slice(0, 10)), 'MMMM d, yyyy'),
      content: post.content,
      author: post.author,
      blurb: post.blurb
    };
  });

const lookup = new Map();
posts
  .filter(post => post.content)
  .forEach(post => {
    lookup.set(post.slug.toLowerCase(), JSON.stringify(post));
  });

export function get(req, res) {
  // the `slug` parameter is available because
  // this file is called [slug].json.js
  const slug = req.params.slug.toLowerCase();

  if (lookup.has(slug)) {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(lookup.get(slug));
  } else {
    res.writeHead(404, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        message: "Not found"
      })
    );
  }
}
