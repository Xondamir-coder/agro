const modalBtn = document.querySelector('.modal__button');
const modal = document.querySelector('.modal');
const canvas = document.querySelector('.canvas');
import audioUrl from '../assets/rise.wav';

export default class Dom {
	audioPlaying = false;
	animationEnded = false;
	scrollVal = 0;
	audio = new Audio(audioUrl);
	cursor = { x: 0, y: 0 };
	parallaxElements = document.querySelectorAll('[data-parallax=""]');

	constructor() {
		this.audio.volume = 0.3;
		document.addEventListener('wheel', this.#handleWheel.bind(this));
		modalBtn.addEventListener('click', this.#handleModalBtnClick.bind(this));
		window.addEventListener('mousemove', this.#handleMouseMove.bind(this));
	}
	#handleWheel(e) {
		this.#increaseScroll(e);
		if (!this.audioPlaying && !this.animationEnded) {
			this.audio
				.play()
				.then(() => {
					this.audioPlaying = true;
				})
				.finally(() => {
					this.audioPlaying = false;
				});
		}
	}
	#handleModalBtnClick() {
		canvas.classList.remove('blurred');
		modal.style.transform = 'scale(0)';
	}
	#handleMouseMove(e) {
		this.cursor.x = (e.clientX / window.innerWidth) * 40 - 20;
		this.cursor.y = (e.clientY / window.innerHeight) * 40 - 20;
		this.parallaxElements.forEach(element => {
			const st = +element.getAttribute('data-parallax-strength');
			element.style.transform = `translate(${-this.cursor.x * st}px, ${
				-this.cursor.y * st
			}px)`;
		});
	}
	#increaseScroll(e) {
		if (this.scrollVal >= 62.5 || this.scrollVal <= -63) {
			setTimeout(() => {
				!this.animationEnded && (this.animationEnded = true);
			}, 4000);
			return;
		}
		this.scrollVal += e.deltaY * 0.005;
		console.log(this.scrollVal);
	}
}
