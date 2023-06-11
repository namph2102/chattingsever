function createCookie(res, name, value, hours) {
  if (!hours) {
    res.cookie(name, value);
    console.log("tao cookie thanh cong");
    return;
  }
  res.cookie(name, value, {
    expires: new Date(Date.now() + hours * 60 * 60 * 1000),
  });
  console.log("tao cookie thanh cong");
}
export { createCookie };
