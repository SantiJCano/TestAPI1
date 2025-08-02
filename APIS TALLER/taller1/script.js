// Variables globales
let currentPhotos = [];
let albumsData = {};

// Función principal para cargar fotos usando async/await
async function loadPhotos(limit = 10) {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const galleryElement = document.getElementById('gallery');
    
    // Mostrar loading y ocultar errores
    showLoading(true);
    hideError();
    
    try {
        // Usar Promise.all para hacer múltiples peticiones en paralelo
        const [photosData, albumsDataResponse] = await Promise.all([
            fetchPhotos(limit),
            fetchAlbums()
        ]);
        
        // Procesar datos de álbumes
        albumsData = processAlbumsData(albumsDataResponse);
        
        // Renderizar la galería
        renderGallery(photosData);
        updateStats(photosData);
        
        // Animar las tarjetas
        animateCards();
        
    } catch (error) {
        console.error('Error al cargar las fotos:', error);
        showError(`Error al cargar las fotos: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Función para obtener fotos locales
async function fetchPhotos(limit) {
    // Creamos un array de objetos de fotos locales
    const localPhotos = [];
    const totalImages = 10; // Tenemos 10 imágenes en total
    
    // Usar el mínimo entre el límite solicitado y el total de imágenes disponibles
    const actualLimit = Math.min(limit, totalImages);
    
    for (let i = 1; i <= actualLimit; i++) {
        localPhotos.push({
            id: i,
            title: `Goku ${i}`,
            url: `src/${i}${i === 3 || i === 4 ? '.jpeg' : '.jpg'}`,
            thumbnailUrl: `src/${i}${i === 3 || i === 4 ? '.jpeg' : '.jpg'}`,
            albumId: Math.ceil(i / 2), // Agrupar en álbumes de 2 imágenes cada uno
            description: `Lorem ipsum dolor sit amet, Goku transformación número ${i}. Puedes editar este texto en la función fetchPhotos.`
        });
    }
    
    currentPhotos = localPhotos;
    return localPhotos;
}

// Función para hacer fetch de álbumes
async function fetchAlbums() {
    const response = await fetch('https://jsonplaceholder.typicode.com/albums');
    
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
}

// Función para procesar datos de álbumes y crear un mapa
function processAlbumsData(albums) {
    return albums.reduce((acc, album) => {
        acc[album.id] = album.title;
        return acc;
    }, {});
}

// Función para renderizar la galería
function renderGallery(photos) {
    const galleryElement = document.getElementById('gallery');
    
    // Limpiar galería existente
    galleryElement.innerHTML = '';
    
    // Crear elementos de foto
    photos.forEach((photo, index) => {
        const photoCard = createPhotoCard(photo, index);
        galleryElement.appendChild(photoCard);
    });
}

// Función para crear una tarjeta de foto
function createPhotoCard(photo, index) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Usar la URL local de la imagen
    const imageUrl = photo.url || `src/${photo.id}${photo.id === 3 || photo.id === 4 ? '.jpeg' : '.jpg'}`;
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${photo.title}" loading="lazy">
        <div class="photo-info">
            <h3>${photo.title}</h3>
            <p>ID: ${photo.id} | Álbum: ${photo.albumId || 'Local'}</p>
            <button class="btn btn-view" onclick="showFullImage(${JSON.stringify({
                ...photo,
                url: imageUrl,
                thumbnailUrl: imageUrl
            }).replace(/"/g, '&quot;')})">
                Ver más grande
            </button>
        </div>
    `;
    
    return card;
}

// Función para mostrar imagen completa
function showFullImage(photo) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Asegurarse de que usamos la URL local correcta
    const imageUrl = photo.url || `src/${photo.id}${photo.id === 3 || photo.id === 4 ? '.jpeg' : '.jpg'}`;
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img src="${imageUrl}" alt="${photo.title}">
            <div class="photo-details">
                <h3>${photo.title}</h3>
                <p>ID: ${photo.id}</p>
                <p>${photo.albumId ? 'Álbum: ' + photo.albumId : 'Galería Local'}</p>
                <p class="photo-description">${photo.description || ''}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic en la X
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.remove();
    
    // Cerrar modal al hacer clic fuera de la imagen
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    // Cerrar con la tecla ESC
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

// Función para animar las tarjetas
function animateCards() {
    const cards = document.querySelectorAll('.photo-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Función para actualizar estadísticas
function updateStats(photos) {
    const statsElement = document.getElementById('stats');
    const totalPhotosElement = document.getElementById('totalPhotos');
    const totalAlbumsElement = document.getElementById('totalAlbums');
    
    // Contar álbumes únicos
    const uniqueAlbums = new Set(photos.map(photo => photo.albumId));
    
    totalPhotosElement.textContent = photos.length;
    totalAlbumsElement.textContent = uniqueAlbums.size;
    
    statsElement.style.display = 'flex';
}

// Función para limpiar la galería
function clearGallery() {
    const galleryElement = document.getElementById('gallery');
    const statsElement = document.getElementById('stats');
    
    // Animar salida de las tarjetas
    const cards = document.querySelectorAll('.photo-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
        }, index * 50);
    });
    
    // Limpiar después de la animación
    setTimeout(() => {
        galleryElement.innerHTML = '';
        statsElement.style.display = 'none';
        currentPhotos = [];
    }, cards.length * 50 + 300);
}

// Funciones de utilidad
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    const errorElement = document.getElementById('error');
    errorElement.style.display = 'none';
}

// Función adicional usando Promesas tradicionales (para demostrar el concepto)
function loadPhotosWithPromises(limit = 10) {
    showLoading(true);
    hideError();
    
    // Ejemplo usando .then() y .catch()
    fetch(`https://jsonplaceholder.typicode.com/photos?_limit=${limit}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
        })
        .then(photosData => {
            return fetch('https://jsonplaceholder.typicode.com/albums')
                .then(response => response.json())
                .then(albumsDataResponse => {
                    albumsData = processAlbumsData(albumsDataResponse);
                    return photosData;
                });
        })
        .then(photosData => {
            renderGallery(photosData);
            updateStats(photosData);
            animateCards();
        })
        .catch(error => {
            console.error('Error:', error);
            showError(`Error al cargar las fotos: ${error.message}`);
        })
        .finally(() => {
            showLoading(false);
        });
}

// Función para filtrar fotos por álbum
function filterByAlbum(albumId) {
    const filteredPhotos = currentPhotos.filter(photo => photo.albumId === albumId);
    renderGallery(filteredPhotos);
    updateStats(filteredPhotos);
    animateCards();
}

// Función para buscar fotos por título
function searchPhotos(searchTerm) {
    const filteredPhotos = currentPhotos.filter(photo => 
        photo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderGallery(filteredPhotos);
    updateStats(filteredPhotos);
    animateCards();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar 10 fotos al iniciar la página
    loadPhotos(10);
    
    // Añadir funcionalidad de búsqueda (opcional)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            if (searchTerm.length > 2) {
                searchPhotos(searchTerm);
            } else if (searchTerm.length === 0) {
                renderGallery(currentPhotos);
                updateStats(currentPhotos);
                animateCards();
            }
        });
    }
});

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    showError('Ha ocurrido un error inesperado');
});

// Manejo de promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no capturada:', event.reason);
    showError('Error en la carga de datos');
    event.preventDefault();
});