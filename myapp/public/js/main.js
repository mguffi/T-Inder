// Allgemeine JavaScript-Funktionen für die gesamte App

// Seiten die Authentifizierung erfordern
const protectedRoutes = ['/people', '/profile', '/matches', '/filters'];

// Prüfen, ob die aktuelle Seite geschützt ist
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const isProtected = protectedRoutes.some(route => currentPath.startsWith(route));
    
    if (isProtected && !localStorage.getItem('token')) {
        window.location.href = '/login';
        return;
    }

    // Erfolgsmeldungen automatisch ausblenden
    const successMessages = document.querySelectorAll('.alert-success:not(.d-none)');
    successMessages.forEach(message => {
        setTimeout(() => {
            message.classList.add('d-none');
        }, 3000);
    });
    
    // Logout-Links abfangen
    const logoutLinks = document.querySelectorAll('a[href="/logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof logout === 'function') {
                logout();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        });
    });
});

// Hilfsfunktion zum Formatieren von Datum/Alter
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function calculateAge(birthday) {
    const birthdayDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthdayDate.getFullYear();
    const m = today.getMonth() - birthdayDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthdayDate.getDate())) {
        age--;
    }
    
    return age;
}

// Hilfsfunktion um Form-Daten zu JSON zu konvertieren
function formToJSON(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}