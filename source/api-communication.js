function setCookie(name, value, minutes) {
    let expires = "";
    if (minutes) {
        const date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function getPayload(){
    const arrayToken = getCookie('token').split('.');
    return JSON.parse(atob(arrayToken[1]));
}
function submitRegister() {
    const username = String(document.getElementById('username').value);
    const email = String(document.getElementById('email').value);
    const password = String(document.getElementById('password').value);
    createUser(username, email, password).catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
    
}
async function createUser(username, email, password) {
    const url = 'http://127.0.0.1:8000/users/';
    const headers = {
        'Content-Type': 'application/json'
    };

    const body = JSON.stringify({ username, email, password });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (response.ok) {
            const user = await response.json();
            console.log('User created:', user);
            document.getElementById('registerForm').reset()
            return user;
        } else {
            console.error('Failed to create user:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            return null;
        }
    } catch (error) {
        console.error('Error creating user:', error);
        return null;
    }
}

async function loginUser(email, password) {
    const url = 'http://127.0.0.1:8000/login';
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    });

    if (response.ok) {
        const data = await response.json();
        setCookie('token', data.access_token, 60); // Save the token for 60 minutes
        console.log('Login successful:', data);
        document.getElementById('loginForm').reset()
        return data; // Return data to handle it in .then() later
    } else {
        console.error('Login failed:', response.status);
        return null; // Return null if the login failed
    }
}


function submitLogin() {
    const email = String(document.getElementById('email').value);
    const password = String(document.getElementById('password').value);
    loginUser(email, password).then(data => {
        if (data) {
            // Handle successful login, e.g., redirect to dashboard
            console.log('Token saved in cookies:', data.access_token);
            window.location.href = './index.html'; // Example redirection
        } else {
            // Handle login failure
            console.error('Invalid credentials');
            alert('Login failed. Please check your email and password.');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

async function createPost(title, content) {
    const token = getCookie('token');
    if (!token) {
        console.error('No token found. Please log in first.');
        return;
    }

    const url = 'http://127.0.0.1:8000/posts/';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const body = JSON.stringify({ title, content });

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    });

    if (response.ok) {
        const post = await response.json();
        console.log('Post created:', post);
        return post;
    } else {
        console.error('Failed to create post:', response.status);
        return null;
    }
}

function submitPost() {
    const title = String(document.getElementById('title').value).replace(/\n/g, '');
    const content = String(document.getElementById('content').value).replace(/\n/g, '');

    if (title == ""|| content==""){
        console.error('Post creation failed');
        alert('Failed to create post. Please try again.')
    }else{
        createPost(title, content).then(post => {
                if (post) {
                    console.log('Post successfully created');
                    fetchPosts(); // Refresh posts after creation
                } else {
                    console.error('Post creation failed');
                    alert('Failed to create post. Please try again.');
                }
        }).catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }
}

async function fetchPosts(skip, limit) {
    const token = getCookie('token');
    if (!token) {
        console.error('No token found. Please log in first.');
        return;
    }

    const loadingIndicator = document.getElementById('loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }

    const url = `http://127.0.0.1:8000/posts/?skip=${skip}&limit=${limit}`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    });

    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }

    if (response.ok) {
        const posts = await response.json();
        displayPosts(posts);
    } else {
        console.error('Failed to fetch posts:', response.status);
    }
}

async function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    const token = getCookie('token');
    if (!token) {
        console.error('No token found. Please log in first.');
        return;
    }
    user_id = getPayload().user_id

    postsContainer.innerHTML = ''; // Clear existing posts before adding new ones
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.id = `post-${post.id}`;
        postElement.className = 'post';
        if (post.owner_id == user_id){
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <p>Created at: ${post.created_at.slice(0,10)} ${post.created_at.slice(11,19)}</p>
                <p>User id: ${post.owner_id}</p>
                
                <button onclick="editPost('${post.id}', '${post.title.replace(/'/g, "\\'")}', '${post.content.replace(/'/g, "\\'")}')">Edit</button>
                <button onclick="deletePost('${post.id}')">Delete</button>
            `;
        }else{
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <p>Created at: ${post.created_at.slice(0,10)} ${post.created_at.slice(11,19)}</p>
                <p>User id: ${post.owner_id}</p>
                `
        }


       
        
        postsContainer.appendChild(postElement);
    });
}


async function deletePost(postId) {
    const token = getCookie('token');
    if (!token) {
        console.error('No token found. Please log in first.');
        return;
    }
    

    const url = `http://127.0.0.1:8000/posts/${postId}/`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
        method: 'DELETE',
        headers: headers
    });

    if (response.ok) {
        console.log('Post deleted:', postId);
        fetchPosts(); // Refresh posts after deletion
    } else {
        console.error('Failed to delete post:', response.status);
    }
}


function editPost(postId, title, content) {
    const postElement = document.getElementById(`post-${postId}`);
    if (!postElement) {
        console.error('Post element not found');
        return;
    }

    postElement.innerHTML = `
        <input type="text" id="edit-title-${postId}" value="${title.replace(/"/g, '&quot;')}" required>
        <textarea id="edit-content-${postId}" required>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        <button onclick="submitEdit('${postId}')">Save</button>
        <button onclick="cancelEdit('${postId}', '${title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${content.replace(/'/g, "\\'").replace(/</g, '&lt;').replace(/>/g, '&gt;')}')">Cancel</button>
    `;
}
function submitEdit(postId) {
    const title = document.getElementById(`edit-title-${postId}`).value;
    const content = document.getElementById(`edit-content-${postId}`).value;

    // Example: If `limit` is a global variable
    if (typeof limit !== 'undefined') {
        updatePost(postId, title, content, limit).then(updatedPost => {
            // Your function implementation
        }).catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    } else {
        console.error('Error: limit is not defined');
        alert('An error occurred. Please try again.');
    }
    cancelEdit(postId, title, content)
}


function cancelEdit(postId, title, content) {
    const postElement = document.getElementById(`post-${postId}`);
    if (!postElement) {
        console.error('Post element not found');
        return;
    }

    postElement.innerHTML = `
        <h3>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
        <p>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        <button onclick="editPost('${postId}', '${title.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${content.replace(/'/g, "\\'").replace(/</g, '&lt;').replace(/>/g, '&gt;')}')">Edit</button>
        <button onclick="deletePost('${postId}')">Delete</button>
    `;
}
async function updatePost(postId, title, content) {
    const token = getCookie('token');
    if (!token) {
        console.error('No token found. Please log in first.');
        return null;
    }

    const url = `http://127.0.0.1:8000/posts/${postId}/`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const body = JSON.stringify({ title, content });

    const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: body
    });

    if (response.ok) {
        const updatedPost = await response.json();
        return updatedPost;
    } else {
        console.error('Failed to update post:', response.status);
        return null;
    }
}




document.addEventListener('DOMContentLoaded', fetchPosts);


