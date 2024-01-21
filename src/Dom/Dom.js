const modalBtn = document.querySelector('.modal__button');
const modal = document.querySelector('.modal');
const canvas = document.querySelector('.canvas');

export default class Dom {
	audioPlaying = false;
	scrollVal = 0;
	audio = new Audio('rise.wav');

	constructor() {
		this.audio.volume = 0.3;
		document.addEventListener('wheel', this.#handleWheel.bind(this));
		modalBtn.addEventListener('click', this.#handleModalClick.bind(this));
	}
	#handleWheel(e) {
		this.scrollVal += e.deltaY * 0.005;
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
	#handleModalClick() {
		canvas.classList.remove('blurred');
		modal.style.transform = 'scale(0)';
	}
}
