import barba from '@barba/core';
import barbaCss from '@barba/css';
import barbaPrefetch from '@barba/prefetch';
import { gsap } from 'gsap';
import imagesLoaded from 'imagesloaded';

const bodyTag = document.querySelector('body');

const runScripts = () => {
	const headers = document.querySelectorAll('h2, h3');
	const imageHolders = document.querySelectorAll('div.image');

	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.intersectionRatio >= 0.1)
					entry.target.classList.add('in-view');
				else entry.target.classList.remove('in-view');
			});
		},
		{
			threshold: [0, 0.1, 1],
		}
	);

	headers.forEach(header => {
		observer.observe(header);
	});
	imageHolders.forEach(holder => {
		observer.observe(holder);
	});
};
runScripts();

// barba.use(barbaCss);
barba.use(barbaPrefetch);

barba.init({
	transitions: [
		{
			// sync: true,
			name: 'switch',
			once({ current, next, trigger }) {
				return new Promise(resolve => {
					const images = document.querySelectorAll('img');

					gsap.set(next.container, { opacity: 0 });

					imagesLoaded(images, () => {
						const timeline = gsap.timeline({
							onComplete() {
								resolve(); //* barba is all finished
							},
						});

						timeline.to(next.container, { opacity: 1, delay: 1 });
					});
				});
			},
			leave({ current, next, trigger }) {
				return new Promise(resolve => {
					const timeline = gsap.timeline({
						onComplete() {
							current.container.remove();
							resolve();
						},
					});

					timeline
						.to('header', { y: '-100%' }, 0)
						.to('footer', { y: '100%' }, 0)
						.to(current.container, { opacity: 0 });
				});
			},
			enter({ current, next, trigger }) {
				window.scrollTo({
					top: 0,
					behavior: 'smooth',
				});

				return new Promise(resolve => {
					// setTimeout(resolve, 2000);
					const timeline = gsap.timeline({
						onComplete() {
							runScripts();
							resolve();
						},
					});

					console.log(next);

					timeline
						.set(next.container, { opacity: 0 })
						.to('header', { y: '0%' }, 0)
						.to('footer', { y: '0%' }, 0)
						.to(next.container, { opacity: 1 });

					resolve();
				});
			},
		},
	],
	views: [
		{
			namespace: 'product',
			beforeEnter() {
				bodyTag.classList.add('product');
			},
			afterLeave() {
				bodyTag.classList.remove('product');
			},
		},
	],
	debug: true,
});
