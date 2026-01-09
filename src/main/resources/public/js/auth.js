/**
 * Auth Module - Common authentication handling for all pages
 */
$(document).ready(function() {
    // Update navbar based on login status
    updateNavbar();
    
    // Update cart count
    Auth.updateCartCount();
    
    // Logout button handler
    $(document).on('click', '#logoutBtn', function(e) {
        e.preventDefault();
        Auth.logout();
        Utils.showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    });
    
    // Search form handler
    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const keyword = $('#searchInput').val().trim();
        if (keyword) {
            window.location.href = `/products.html?keyword=${encodeURIComponent(keyword)}`;
        }
    });
});

// Update navbar display based on login status
function updateNavbar() {
    if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        $('#userNav').hide();
        $('#userLoggedIn').show();
        $('#usernameDisplay').text(user?.username || 'User');
    } else {
        $('#userNav').show();
        $('#userLoggedIn').hide();
    }
}
