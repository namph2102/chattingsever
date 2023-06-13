function createCookie(res, name, value, hours) {
  if (!hours) {
    res.cookie(name, value);
  }
  res.cookie(name, value);
}
function getCookie(res, name) {
  return res.cookies[name] || false;
}
export { createCookie, getCookie };
