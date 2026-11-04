/**
 * =========================================================================
 * MOTOR DE APRESENTAÇÃO DE MARCAS & MANUAL DE IDENTIDADE VISUAL
 * Duas Mãos • Agência de Branding
 * 
 * Funcionalidades:
 * - Controle de Slides 16:9 com transições cinematográficas suaves
 * - Suporte a Teclado (Setas, Espaço, PageUp/Down, Home, End)
 * - Suporte a Touch Swipe (Mobile/Tablet) e Scroll Wheel (Mouse)
 * - Sumário Interativo com pulo dinâmico para slides
 * - Lightbox Fullscreen para visualização de logos em alta resolução
 * - Simulador de Perfil do Instagram com Modal de Stories Interativo
 * - Simulador de Carrossel de Posts do Instagram (troca de cards + legenda)
 * - Galeria de Mockups / Pranchas com paginação
 * - Troca automática de tema de fundo por slide (off-white, sand-paper, dark-petrol)
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elementos Centrais
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlideIndex = 0;

  const navCurrent = document.getElementById('nav-current');
  const navTotal = document.getElementById('nav-total');
  const navProgressBar = document.getElementById('nav-progress-bar');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const presentationContainer = document.querySelector('.presentation-container');

  // Atualiza totais no HUD inicial
  if (navTotal) {
    navTotal.textContent = String(totalSlides).padStart(2, '0');
  }

  // 2. Transição e Atualização de Slides
  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;

    slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'past', 'future');
      if (idx === index) {
        slide.classList.add('active');
      } else if (idx < index) {
        slide.classList.add('past');
      } else {
        slide.classList.add('future');
      }
    });

    const activeSlide = slides[index];
    if (activeSlide) {
      const theme = activeSlide.getAttribute('data-theme') || 'off-white';
      
      // Ajusta o tema cromático da página e do HUD
      if (theme === 'dark-petrol' || theme === 'dark') {
        document.body.style.backgroundColor = '#1C262B';
        if (presentationContainer) presentationContainer.style.backgroundColor = '#1C262B';
        document.body.classList.add('hud-dark');
      } else if (theme === 'sand-paper') {
        document.body.style.backgroundColor = '#F4F0EA';
        if (presentationContainer) presentationContainer.style.backgroundColor = '#F4F0EA';
        document.body.classList.remove('hud-dark');
      } else if (theme === 'neutral-grey') {
        document.body.style.backgroundColor = '#ECE9E3';
        if (presentationContainer) presentationContainer.style.backgroundColor = '#ECE9E3';
        document.body.classList.remove('hud-dark');
      } else {
        document.body.style.backgroundColor = '#FAF9F6';
        if (presentationContainer) presentationContainer.style.backgroundColor = '#FAF9F6';
        document.body.classList.remove('hud-dark');
      }
    }

    currentSlideIndex = index;

    // Atualiza contador no HUD
    if (navCurrent) {
      navCurrent.textContent = String(index + 1).padStart(2, '0');
    }

    // Atualiza barra de progresso linear
    if (navProgressBar) {
      const progressPercent = ((index + 1) / totalSlides) * 100;
      navProgressBar.style.width = `${progressPercent}%`;
    }

    // Gerencia estado dos botões
    if (btnPrev) {
      if (index === 0) {
        btnPrev.setAttribute('disabled', 'true');
      } else {
        btnPrev.removeAttribute('disabled');
      }
    }

    if (btnNext) {
      if (index === totalSlides - 1) {
        btnNext.setAttribute('disabled', 'true');
      } else {
        btnNext.removeAttribute('disabled');
      }
    }

    // Gerenciamento de vídeo da galeria de mockups
    if (activeSlide && activeSlide.id === 'slide-1015-gallery') {
      const activeVid = activeSlide.querySelector('.gallery-1015-item.active video');
      if (activeVid) {
        activeVid.currentTime = 0;
        const p = activeVid.play();
        if (p && p.catch) p.catch(() => {});
      }
    } else {
      document.querySelectorAll('#slide-1015-gallery video').forEach(v => v.pause());
    }
  }

  function nextSlide() {
    // Se o slide ativo for a galeria e ainda tiver pranchas pendentes
    const activeSlide = slides[currentSlideIndex];
    if (activeSlide && activeSlide.id === 'slide-1015-gallery') {
      const galleryItems = activeSlide.querySelectorAll('.gallery-1015-item');
      if (galleryItems.length > 0 && currentGalleryIndex < galleryItems.length - 1) {
        currentGalleryIndex++;
        updateGallery(currentGalleryIndex);
        return;
      }
    }

    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    const activeSlide = slides[currentSlideIndex];
    if (activeSlide && activeSlide.id === 'slide-1015-gallery' && currentGalleryIndex > 0) {
      currentGalleryIndex--;
      updateGallery(currentGalleryIndex);
      return;
    }

    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Botões do HUD
  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });
  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });

  // 3. Atalhos de Teclado
  window.addEventListener('keydown', (e) => {
    // Ignora se estiver digitando em campos de texto
    if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'Space':
      case ' ':
      case 'Enter':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'Backspace':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
    }
  });

  // 4. Navegação por Roda do Mouse (Wheel com Throttle)
  let lastWheelTime = 0;
  window.addEventListener('wheel', (e) => {
    const now = Date.now();
    if (now - lastWheelTime < 800) return; // Limita disparo a cada 800ms
    if (Math.abs(e.deltaY) > 35) {
      if (e.deltaY > 0) {
        nextSlide();
        lastWheelTime = now;
      } else {
        prevSlide();
        lastWheelTime = now;
      }
    }
  }, { passive: true });

  // 5. Navegação Touch (Swipe em Telas Sensíveis ao Toque)
  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Detecta arrasto horizontal consistente
    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 100) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });

  // 6. Sumário Interativo (Pulo direto de slide)
  document.querySelectorAll('.index-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetSlide = item.getAttribute('data-target');
      if (targetSlide !== null) {
        const targetIndex = parseInt(targetSlide, 10);
        if (!isNaN(targetIndex)) {
          goToSlide(targetIndex);
        }
      }
    });
  });

  // 7. Galeria de Mockups / Pranchas
  let currentGalleryIndex = 0;
  function updateGallery(index) {
    const gallerySlide = document.getElementById('slide-1015-gallery');
    if (!gallerySlide) return;

    const items = gallerySlide.querySelectorAll('.gallery-1015-item');
    items.forEach((item, idx) => {
      const vid = item.querySelector('video');
      if (idx === index) {
        item.classList.add('active');
        if (vid) {
          vid.currentTime = 0;
          const p = vid.play();
          if (p && p.catch) p.catch(() => {});
        }
      } else {
        item.classList.remove('active');
        if (vid) {
          vid.pause();
        }
      }
    });

    const currentNumEl = gallerySlide.querySelector('#gallery-current-num');
    const totalNumEl = gallerySlide.querySelector('#gallery-total-num');
    if (currentNumEl) currentNumEl.textContent = String(index + 1).padStart(2, '0');
    if (totalNumEl) totalNumEl.textContent = String(items.length).padStart(2, '0');
  }

  // 8. Carrossel de Posts do Instagram
  document.querySelectorAll('[data-post-carousel]').forEach(carousel => {
    const carouselId = carousel.getAttribute('data-post-carousel');
    const btnPrevCard = carousel.querySelector('.prev-card-btn, .ig-carousel-prev');
    const btnNextCard = carousel.querySelector('.next-card-btn, .ig-carousel-next');
    const images = carousel.querySelectorAll('.carousel-img');
    const dots = carousel.querySelectorAll('.card-dot');
    const activePreviewImg = document.getElementById(`post-img-${carouselId}`);
    
    let activeCardIndex = 0;
    const totalCards = images.length;

    function renderCarousel() {
      images.forEach((img, idx) => {
        if (idx === activeCardIndex) {
          img.classList.add('active');
          if (activePreviewImg && img instanceof HTMLImageElement) {
            activePreviewImg.src = img.src;
          }
        } else {
          img.classList.remove('active');
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === activeCardIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      if (btnPrevCard) {
        if (activeCardIndex === 0) {
          btnPrevCard.style.opacity = '0.35';
          btnPrevCard.style.pointerEvents = 'none';
        } else {
          btnPrevCard.style.opacity = '1';
          btnPrevCard.style.pointerEvents = 'auto';
        }
      }

      if (btnNextCard) {
        if (activeCardIndex === totalCards - 1) {
          btnNextCard.style.opacity = '0.35';
          btnNextCard.style.pointerEvents = 'none';
        } else {
          btnNextCard.style.opacity = '1';
          btnNextCard.style.pointerEvents = 'auto';
        }
      }
    }

    if (btnPrevCard) {
      btnPrevCard.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeCardIndex > 0) {
          activeCardIndex--;
          renderCarousel();
        }
      });
    }

    if (btnNextCard) {
      btnNextCard.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeCardIndex < totalCards - 1) {
          activeCardIndex++;
          renderCarousel();
        }
      });
    }
  });

  // 9. Lightbox para Logos em Alta Resolução
  const logoBoxes = document.querySelectorAll('.logo-clean-box, .lightbox-trigger');
  const lightboxModal = document.getElementById('logo-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCloseBtn = document.querySelector('.lightbox-close-btn');

  if (lightboxModal && lightboxImg) {
    logoBoxes.forEach(box => {
      box.addEventListener('click', (e) => {
        e.stopPropagation();
        const img = box.querySelector('img');
        if (img) {
          const src = img.getAttribute('src');
          if (src) {
            lightboxImg.src = src;
            lightboxModal.classList.add('active');
          }
        }
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      setTimeout(() => { lightboxImg.src = ''; }, 300);
    };

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
    lightboxModal.addEventListener('click', (e) => { if (e.target === lightboxModal) closeLightbox(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightboxModal.classList.contains('active')) closeLightbox(); });
  }

  // 10. Simulador de Stories do Instagram
  const storiesModal = document.getElementById('instagram-stories-modal');
  const storiesCloseBtn = document.getElementById('btn-close-stories');
  const storyProgRow = document.getElementById('story-progress-row');
  const storyContent = document.getElementById('story-slide-content');
  const storyTapLeft = document.getElementById('story-tap-left');
  const storyTapRight = document.getElementById('story-tap-right');

  // Mapa de stories por destaque
  const storiesData = {
    '1': [
      './assets/img/05_redes_sociais/destaque_1.svg',
      './assets/img/05_redes_sociais/post_1_1.svg',
      './assets/img/05_redes_sociais/post_1_2.svg'
    ],
    '2': [
      './assets/img/05_redes_sociais/destaque_2.svg',
      './assets/img/05_redes_sociais/post_4_1.svg'
    ],
    '3': [
      './assets/img/05_redes_sociais/destaque_3.svg',
      './assets/img/05_redes_sociais/post_2_1.svg'
    ],
    '4': [
      './assets/img/05_redes_sociais/destaque_4.svg',
      './assets/img/05_redes_sociais/post_6_1.svg'
    ]
  };

  let currentStoryGroup = '1';
  let currentStoryIndex = 0;

  function renderStory(group, index) {
    const list = storiesData[group];
    if (!list || !list[index]) return;

    if (storyProgRow) {
      storyProgRow.innerHTML = list.map((_, i) => `
        <div class="story-prog-bar">
          <div class="story-prog-fill" style="width: ${i <= index ? '100%' : '0%'};"></div>
        </div>
      `).join('');
    }

    if (storyContent) {
      storyContent.innerHTML = `<img src="${list[index]}" alt="Story" style="width:100%; height:100%; object-fit:contain; border-radius:12px;">`;
    }
  }

  function openStories(group) {
    currentStoryGroup = group;
    currentStoryIndex = 0;
    if (storiesModal) {
      storiesModal.classList.add('active');
      renderStory(currentStoryGroup, currentStoryIndex);
    }
  }

  function closeStories() {
    if (storiesModal) {
      storiesModal.classList.remove('active');
    }
  }

  document.querySelectorAll('[data-story]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const storyId = trigger.getAttribute('data-story');
      if (storyId) openStories(storyId);
    });
  });

  if (storiesCloseBtn) storiesCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); closeStories(); });

  if (storyTapLeft) {
    storyTapLeft.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentStoryIndex > 0) {
        currentStoryIndex--;
        renderStory(currentStoryGroup, currentStoryIndex);
      }
    });
  }

  if (storyTapRight) {
    storyTapRight.addEventListener('click', (e) => {
      e.stopPropagation();
      const list = storiesData[currentStoryGroup];
      if (list && currentStoryIndex < list.length - 1) {
        currentStoryIndex++;
        renderStory(currentStoryGroup, currentStoryIndex);
      } else {
        closeStories();
      }
    });
  }

  // Inicialização: abre no primeiro slide
  goToSlide(0);
});
