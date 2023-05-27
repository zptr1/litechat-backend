/** @type {import("..").Route} */
export function get(req, res) {
  res.json({
    version: "v1",
    type: "latest" // latest | outdated | deprecated
  });
}