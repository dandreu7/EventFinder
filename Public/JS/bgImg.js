class Slideshow {
    constructor(container) {
        this.slides = container.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.slides[0].classList.add('active');
        this.applyRandomPan(this.slides[0]);

        setInterval(() => this.nextSlide(), 5000);
    }

    applyRandomPan(slide) {
        const panAmount = 5; // Reduced pan amount to 5%
        const directions = [
            { x: -panAmount, y: -panAmount },
            { x: 0, y: -panAmount },
            { x: panAmount, y: 0 },
            { x: -panAmount, y: 0 },
            { x: 0, y: panAmount },
            { x: panAmount, y: panAmount }
        ];

        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        const randomScale = 1.1; // Slight zoom effect

        slide.style.transform = `scale(${randomScale}) translate(0, 0)`;

        // Force reflow
        slide.offsetHeight;

        slide.style.transform = `scale(${randomScale}) translate(${randomDirection.x}%, ${randomDirection.y}%)`;
    }

    nextSlide() {
        const current = this.slides[this.currentSlide];
        current.classList.remove('active');

        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        const next = this.slides[this.currentSlide];

        next.style.transform = 'scale(1.1) translate(0, 0)';
        next.classList.add('active');
        this.applyRandomPan(next);
    }
}

// Initialize slideshow
const container = document.querySelector('.slideshow-container');
new Slideshow(container);