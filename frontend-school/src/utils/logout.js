export const logout = () => {
  localStorage.removeItem("token"); // remove auth token
  window.location.href = "/login"; // redirect to login page
};
