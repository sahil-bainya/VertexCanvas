import { useState, useEffect } from "react";
export default function useGithubStars() {
  const [stars, setStars] = useState(0);
  useEffect(() => {
    fetch("https://api.github.com/repos/sahil-bainya/VertexCanvas")
      .then((r) => r.json())
      .then((d) => setStars(d.stargazers_count || 0))
      .catch(() => setStars(0));
  }, []);
  return stars;
}