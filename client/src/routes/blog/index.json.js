import { format } from "date-fns";
import timeline from "./data.json";

const contents = Object.entries(timeline)
  .map(([fileName, post]) => {
    return {
      title: post.title,
      slug: fileName,
      date: format(new Date(post.date.slice(0, 10)), 'MMMM d, yyyy'),
      content: post.content,
      author: post.author,
      blurb: post.blurb
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export function get(req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(contents));
}
