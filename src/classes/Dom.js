const modalBtn = document.querySelector('.modal__button');
const modal = document.querySelector('.modal');
const canvas = document.querySelector('.canvas');
import audioUrl from '../assets/rise.wav';

export default class Dom {
	audioPlaying = false;
	scrollVal = 0;
	audio = new Audio(audioUrl);
	animationEnded = false;

	constructor() {
		this.audio.volume = 0.3;
		document.addEventListener('wheel', this.#handleWheel.bind(this));
		modalBtn.addEventListener('click', this.#handleModalBtnClick.bind(this));
	}
	#handleWheel(e) {
		this.#increaseScroll(e);
		if (!this.audioPlaying) {
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
	#increaseScroll(e) {
		if (this.scrollVal >= 62.5) {
			setTimeout(() => {
				!this.animationEnded && (this.animationEnded = true);
			}, 3000);
			return;
		}
		this.scrollVal += e.deltaY * 0.005;
	}
}
