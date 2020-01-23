import slugify from "slugify";
import { removeStopwords } from "stopword";

export const toPrettyId = str => {
  return slugify(
    removeStopwords(str.split(" "))
      .slice(0, 3)
      .join(" "),
    { lower: true }
  );
};
