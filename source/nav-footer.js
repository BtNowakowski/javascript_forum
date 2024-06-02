// Utility functions to manage cookies
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}
function logout() {
    deleteCookie('token');
    window.location.href = 'index.html';  // Redirect to the home page or login page
}

document.addEventListener('DOMContentLoaded', function() {
    const token = getCookie('token');

    let navHtml = `
    <nav class="navbar">
        <div class="nav-brand">ForumApp</div>
        <div class="nav-links">
            <a href="index.html">Home</a>`;

    if (token) {
        navHtml += `<a href="newpost.html">Create Post</a>`;
        navHtml += `<a href="login.html" onclick="logout()">Logout</a>`;
    } else {
        navHtml += `<a href="login.html">Login</a>`;
        navHtml += `<a href="register.html">Register</a>`;
    }

    navHtml += `</div>
    </nav>`;

    const footerHtml = `
    <footer class="footer">
        <p>© 2024 ForumApp. All rights reserved.</p>
    </footer>`;

    document.body.insertAdjacentHTML('afterbegin', navHtml);
    document.body.insertAdjacentHTML('beforeend', footerHtml);
});
