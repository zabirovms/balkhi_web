// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const audioPlayer = document.getElementById('audioPlayer');
const poemAudio = document.getElementById('poemAudio');
const playBtn = document.getElementById('playBtn');
const closePlayer = document.getElementById('closePlayer');
const nowPlaying = document.getElementById('nowPlaying');
const audioProgress = document.getElementById('audioProgress');

// Show loading overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Initialize the website
async function initWebsite() {
    showLoading();
    
    try {
        // Load poems data
        const response = await fetch('assets/data/poems.json');
        window.poemsData = await response.json();
        
        // Initialize sections
        initNavigation();
        initPoemSections();
        initAudioPlayer();
        initModal();
        
        // Show home section by default
        showSection('home');
        
        hideLoading();
    } catch (error) {
        console.error('Error initializing website:', error);
        hideLoading();
        alert('Хатоги дар боргирии маълумот рух дод. Лутфан аз нав кӯшиш кунед.');
    }
}

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => {
                navLink.parentElement.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

// Initialize poem sections
function initPoemSections() {
    // Display featured poems
    displayFeaturedPoems();
    
    // Display ghazals
    displayGhazals();
    
    // Display rubaiyat
    displayRubaiyat();
    
    // Display qasidas
    displayQasidas();
    
    // Display biography
    displayBiography();
    
    // Initialize shuffle button
    document.getElementById('shufflePoems').addEventListener('click', shuffleFeaturedPoems);
    
    // Initialize filters
    document.getElementById('ghazalFilter').addEventListener('change', displayGhazals);
    document.getElementById('rubaiFilter').addEventListener('change', displayRubaiyat);
    document.getElementById('qasidaFilter').addEventListener('change', displayQasidas);
}

// Display featured poems
function displayFeaturedPoems() {
    const featuredContainer = document.getElementById('featuredPoems');
    const featuredPoems = getFeaturedPoems();
    
    renderPoems(featuredContainer, featuredPoems);
}

// Shuffle featured poems
function shuffleFeaturedPoems() {
    const featuredContainer = document.getElementById('featuredPoems');
    const featuredPoems = getFeaturedPoems().sort(() => Math.random() - 0.5);
    
    renderPoems(featuredContainer, featuredPoems);
}

// Get featured poems
function getFeaturedPoems() {
    return [
        ...window.poemsData.poems.filter(p => p.recommended),
        ...window.poemsData.poems.filter(p => p.likes > 50)
    ].slice(0, 6);
}

// Display ghazals
function displayGhazals() {
    const ghazalsContainer = document.getElementById('ghazalsContainer');
    const filterValue = document.getElementById('ghazalFilter').value;
    
    let ghazals = window.poemsData.poems.filter(p => p.type === 'ghazal');
    
    if (filterValue === 'top') {
        ghazals = ghazals.sort((a, b) => b.likes - a.likes);
    } else if (filterValue === 'new') {
        ghazals = ghazals.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    renderPoems(ghazalsContainer, ghazals);
}

// Display rubaiyat
function displayRubaiyat() {
    const rubaiyatContainer = document.getElementById('rubaiyatContainer');
    const filterValue = document.getElementById('rubaiFilter').value;
    
    let rubaiyat = window.poemsData.poems.filter(p => p.type === 'rubai');
    
    if (filterValue === 'top') {
        rubaiyat = rubaiyat.sort((a, b) => b.likes - a.likes);
    } else if (filterValue === 'new') {
        rubaiyat = rubaiyat.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    renderPoems(rubaiyatContainer, rubaiyat);
}

// Display qasidas
function displayQasidas() {
    const qasidasContainer = document.getElementById('qasidasContainer');
    const filterValue = document.getElementById('qasidaFilter').value;
    
    let qasidas = window.poemsData.poems.filter(p => p.type === 'qasida');
    
    if (filterValue === 'top') {
        qasidas = qasidas.sort((a, b) => b.likes - a.likes);
    } else if (filterValue === 'new') {
        qasidas = qasidas.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    renderPoems(qasidasContainer, qasidas);
}

// Display biography
function displayBiography() {
    document.getElementById('biographyText').textContent = window.poemsData.biography;
}

// Render poems to container
function renderPoems(container, poems) {
    container.innerHTML = '';
    
    if (poems.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><p>Ҳеҷ шеър ёфт нашуд.</p></div>';
        return;
    }
    
    poems.forEach(poem => {
        const poemCard = document.createElement('div');
        poemCard.className = 'poem-card';
        poemCard.innerHTML = `
            <div class="poem-card-content">
                <h3 class="poem-card-title">${poem.title}</h3>
                <p class="poem-card-text poem-text">${poem.content.split('\n')[0]}</p>
                <div class="poem-card-meta">
                    <span class="poem-card-type">${getTypeName(poem.type)}</span>
                    <div class="poem-card-stats">
                        <span><i class="far fa-heart"></i> ${poem.likes}</span>
                        <span><i class="far fa-eye"></i> ${poem.views}</span>
                    </div>
                </div>
            </div>
        `;
        
        poemCard.addEventListener('click', () => showPoemModal(poem));
        container.appendChild(poemCard);
    });
}

// Get type name
function getTypeName(type) {
    const types = {
        'ghazal': 'Ғазал',
        'rubai': 'Рубоӣ',
        'qasida': 'Қасида',
        'other': 'Дигар'
    };
    
    return types[type] || type;
}

// Initialize audio player
function initAudioPlayer() {
    // Play/pause button
    playBtn.addEventListener('click', togglePlayback);
    
    // Close player
    closePlayer.addEventListener('click', hidePlayer);
    
    // Update progress bar
    poemAudio.addEventListener('timeupdate', updateProgress);
    
    // Seek on progress bar click
    audioProgress.addEventListener('click', seekAudio);
    
    // When audio ends
    poemAudio.addEventListener('ended', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
}

// Toggle audio playback
function togglePlayback() {
    if (poemAudio.paused) {
        poemAudio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        poemAudio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Update progress bar
function updateProgress() {
    const value = (poemAudio.currentTime / poemAudio.duration) * 100;
    audioProgress.value = value || 0;
}

// Seek audio
function seekAudio(e) {
    const percent = e.offsetX / this.offsetWidth;
    poemAudio.currentTime = percent * poemAudio.duration;
}

// Show audio player
function showPlayer(poem) {
    nowPlaying.textContent = poem.title;
    poemAudio.src = poem.audio || '';
    audioPlayer.classList.add('show');
    
    // Try to play automatically
    const playPromise = poemAudio.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('Autoplay prevented:', error);
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
    }
}

// Hide audio player
function hidePlayer() {
    poemAudio.pause();
    audioPlayer.classList.remove('show');
}

// Initialize modal
function initModal() {
    const modal = new bootstrap.Modal(document.getElementById('poemModal'));
    
    // Like button
    document.getElementById('likePoemBtn').addEventListener('click', function() {
        this.classList.toggle('liked');
        const likeCount = document.getElementById('likeCount');
        likeCount.textContent = this.classList.contains('liked') ? 
            parseInt(likeCount.textContent) + 1 : 
            parseInt(likeCount.textContent) - 1;
    });
    
    // Share button
    document.getElementById('sharePoemBtn').addEventListener('click', sharePoem);
    
    // Copy button
    document.getElementById('copyPoemBtn').addEventListener('click', copyPoem);
    
    // Listen button
    document.getElementById('listenPoemBtn').addEventListener('click', function() {
        const poemTitle = document.getElementById('poemModalTitle').textContent;
        const currentPoem = window.poemsData.poems.find(p => p.title === poemTitle);
        
        if (currentPoem) {
            showPlayer(currentPoem);
            modal.hide();
        }
    });
    
    // Comment submission
    document.getElementById('submitComment').addEventListener('click', addComment);
}

// Show poem modal
function showPoemModal(poem) {
    document.getElementById('poemModalTitle').textContent = poem.title;
    document.getElementById('poemModalType').textContent = getTypeName(poem.type);
    document.getElementById('poemModalDate').textContent = formatDate(poem.date);
    document.getElementById('poemModalContent').textContent = poem.content;
    document.getElementById('likeCount').textContent = poem.likes;
    document.getElementById('viewCount').textContent = poem.views + 1; // Increment view count
    document.getElementById('commentCount').textContent = poem.comments ? poem.comments.length : 0;
    
    // Clear comments
    document.getElementById('poemComments').innerHTML = '';
    
    // Add comments if available
    if (poem.comments) {
        poem.comments.forEach(comment => {
            addCommentToDOM(comment);
        });
    }
    
    const modal = new bootstrap.Modal(document.getElementById('poemModal'));
    modal.show();
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tg-TJ', options);
}

// Share poem
function sharePoem() {
    const poemTitle = document.getElementById('poemModalTitle').textContent;
    const poemContent = document.getElementById('poemModalContent').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: poemTitle,
            text: poemContent.substring(0, 100) + '...',
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
        });
    } else {
        // Fallback
        const textToCopy = `${poemTitle}\n\n${poemContent}\n\nҚайд аз сомонаи Балхӣ`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Матни шеър нусхабардорӣ шуд. Ҳоло шумо метавонед онро ба ҳар кадом платформае, ки мехоҳед, баҳм диҳед.');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
}

// Copy poem
function copyPoem() {
    const poemContent = document.getElementById('poemModalContent').textContent;
    
    navigator.clipboard.writeText(poemContent).then(() => {
        const copyBtn = document.getElementById('copyPoemBtn');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Нусха бардорӣ шуд';
        
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="far fa-copy"></i> Нусха бардорӣ';
        }, 2000);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// Add comment
function addComment() {
    const commentText = document.getElementById('commentText').value.trim();
    
    if (commentText) {
        const newComment = {
            author: 'Корбари номаълум',
            date: new Date().toISOString(),
            text: commentText
        };
        
        addCommentToDOM(newComment);
        document.getElementById('commentText').value = '';
        
        // Update comment count
        const commentCount = document.getElementById('commentCount');
        commentCount.textContent = parseInt(commentCount.textContent) + 1;
    }
}

// Add comment to DOM
function addCommentToDOM(comment) {
    const commentsContainer = document.getElementById('poemComments');
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    
    commentElement.innerHTML = `
        <div class="comment-author">${comment.author}</div>
        <div class="comment-date">${formatDate(comment.date)}</div>
        <div class="comment-text">${comment.text}</div>
    `;
    
    commentsContainer.appendChild(commentElement);
}

// Initialize contact form
function initContactForm() {
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Here you would normally send the form data to a server
        alert('Паёми шумо гирифта шуд! Ба зудӣ ба он ҷавоб дода мешавад.');
        this.reset();
    });
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', initWebsite);
