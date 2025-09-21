export const logout = () => {
  localStorage.removeItem("token"); // remove auth token
  window.location.href = "auth/login"; // redirect to login page
};
