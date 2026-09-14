// Renders the login/signup vs. logged-in-user state in the header nav,
// entirely from the Django backend session (token stored in localStorage).

document.addEventListener("DOMContentLoaded", () => {
  const navAuth = document.getElementById("navAuth");
  if (!navAuth) return;

  const myBookingsUrl = navAuth.dataset.myBookingsUrl || "/my-bookings";
  const loginUrl = navAuth.dataset.loginUrl || "/login";
  const signupUrl = navAuth.dataset.signupUrl || "/signup";

  const renderLoggedOut = (): void => {
    navAuth.innerHTML = `
      <a href="${loginUrl}" class="btn-ghost">Log in</a>
      <a href="${signupUrl}" class="btn-solid">Sign up</a>
    `;
  };

  const renderLoggedIn = (firstName: string): void => {
    navAuth.innerHTML = `
      <a href="${myBookingsUrl}" class="btn-ghost">My Bookings</a>
      <span class="nav-user">Hi, ${escapeHtml(firstName)}</span>
      <a href="#" class="btn-solid" id="navLogoutBtn">Logout</a>
    `;
    const logoutBtn = document.getElementById("navLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        Auth.clearSession();
        window.location.href = "/";
      });
    }
  };

  const cachedUser = Auth.getUser();
  if (!Auth.isLoggedIn() || !cachedUser) {
    renderLoggedOut();
    return;
  }

  // Show cached name immediately, then confirm with the backend in the background.
  renderLoggedIn(cachedUser.name.split(" ")[0]);

  Api.me().then((res) => {
    if (res.ok && res.data) {
      Auth.setSession(Auth.getToken() as string, res.data);
      renderLoggedIn(res.data.name.split(" ")[0]);
    } else if (res.status === 401) {
      // Token expired/invalid on the backend
      Auth.clearSession();
      renderLoggedOut();
    }
  });
});
