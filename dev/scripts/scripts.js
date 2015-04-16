document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elHTML            = document.documentElement,
		elBody            = document.body,
		animationEvent    = whichAnimationEvent(),
		transitionEvent   = whichTransitionEvent();

	// scroll and window variables
	var numScrollPos       = window.pageYOffset,
		numWindowWidth     = window.innerWidth,
		numWindowHeight    = window.innerHeight,
		numScrollBottomPos = numScrollPos + numWindowHeight,
		numDocumentHeight  = elBody.clientHeight,
		numIntroScrollPos  = 0,
		boolScrolled       = false;

	// section data
	var arrSectionData = [
			{ title:'header',    numHeight:0, numStart:0 },
			{ title:'intro',     numHeight:0, numStart:0 },
			{ title:'share',     numHeight:0, numStart:0 },
			{ title:'sync',      numHeight:0, numStart:0 },
			{ title:'shop',      numHeight:0, numStart:0 },
			{ title:'create',    numHeight:0, numStart:0 },
			{ title:'available', numHeight:0, numStart:0 },
			{ title:'footer',    numHeight:0, numStart:0 }
		],
		numSections = arrSectionData.length;

	// intro elements
	var elIntroBackground = document.getElementById('intro_background'),
		elIntroAndroid    = document.getElementById('img_intro-android'),
		elIntroIOS        = document.getElementById('img_intro-ios');


	// Helper: Check when a CSS transition or animation has ended
	// ----------------------------------------------------------------------------
	function whichAnimationEvent() {

		var anim,
			element    = document.createElement('fakeelement'),
			animations = {
				'animation'       : 'animationend',
				'OAnimation'      : 'oAnimationEnd',
				'MozAnimation'    : 'animationend',
				'WebkitAnimation' : 'webkitAnimationEnd'
			}

		for (anim in animations) {
			if (element.style[anim] !== undefined) {
				return animations[anim];
			}
		}

	}

	function whichTransitionEvent() {

		var trans,
			element     = document.createElement('fakeelement'),
			transitions = {
				'transition'       : 'transitionend',
				'OTransition'      : 'oTransitionEnd',
				'MozTransition'    : 'transitionend',
				'WebkitTransition' : 'webkitTransitionEnd'
			}

		for (trans in transitions) {
			if (element.style[trans] !== undefined) {
				return transitions[trans];
			}
		}

	}


	// Helper: Fire Window Resize Event Upon Finish
	// ----------------------------------------------------------------------------
	var waitForFinalEvent = (function() {

		var timers = {};

		return function(callback, ms, uniqueId) {

			if (!uniqueId) {
				uniqueId = 'beefchimi'; // Don't call this twice without a uniqueId
			}

			if (timers[uniqueId]) {
				clearTimeout(timers[uniqueId]);
			}

			timers[uniqueId] = setTimeout(callback, ms);

		};

	})();


	// injectSVG: Inject SVG data once document is ready
	// ----------------------------------------------------------------------------
	function injectSVG() {

		var ajax = new XMLHttpRequest();

		ajax.open('GET', 'assets/img/svg.svg?v=1', true);
		ajax.send();
		ajax.onload = function(e) {

			var div = document.createElement('div');
			div.id = 'svgInject';
			div.innerHTML = ajax.responseText;
			document.body.insertBefore(div, document.body.childNodes[0]);

		}

	}


	// waitForImages: Wait until images are loaded
	// ----------------------------------------------------------------------------
	function waitForImages() {

		// the rest of the code does not apply to IE9, so exit
		if ( classie.has(elHTML, 'ie9') ) {
			return;
		}

		var 	elLoader       = document.getElementById('loader_overlay'),
			elPreloadImage = document.getElementById('preload_background');

		// listen for the end of <header> fadeIn animation
		elLoader.addEventListener(transitionEvent, removeLoader);

		function removeLoader() {

			// remove the event listener from the loader
			elLoader.removeEventListener(transitionEvent, removeLoader);

			// remove any unneeded elements
			elBody.removeChild(elLoader);
			elPreloadImage.parentNode.removeChild(elPreloadImage);

			// page is now fully ready to go
			elHTML.setAttribute('data-page', 'ready');

		}

		// layout Packery after all images have loaded
		imagesLoaded(elBody, function(instance) {
			elHTML.setAttribute('data-images', 'loaded');
		});

	}


	// pageLoaded: Execute once the page has loaded and the FOUT animation has ended
	// ----------------------------------------------------------------------------
	function pageLoaded() {

		// load page at top of document...
		// chrome remembers your scroll position on reload, so this is the only reliable solution
		if (history.pushState) {
			history.pushState(null, null, '');
			window.scroll(0, 0);
		}

		// inject SVG data
		injectSVG();

		// calculate values for all sections
		measureSectionHeight();

		// only if Chrome iOS
		// touchScrolling();

	}


	// measureSectionHeight: Iterate through each section to calculate height and starting position
	// ----------------------------------------------------------------------------
	function measureSectionHeight() {

		// used for adding together starting position values
		var numAddedStart = 0;

		for (var i = 0; i < numSections; i++) {

			var thisSection = arrSectionData[i];

			thisSection.numHeight = document.getElementById(thisSection.title).offsetHeight;
			thisSection.numStart  = numAddedStart + 10; // add an additional 10px buffer space

			// calculate next sections starting position based on the accululated heights of previous sections
			numAddedStart = numAddedStart + thisSection.numHeight;

		}

		// start tracking sections once we have them all measured
		trackSection();

	}


	// trackSection: Track which sections have been scrolled to
	// ----------------------------------------------------------------------------
	function trackSection() {

		// exit function if we have scrolled the entire document
		if (boolScrolled) {
			return;
		}

		for (var i = 0; i < numSections; i++) {

			var thisSection = arrSectionData[i];

			if (numScrollBottomPos > thisSection.numStart) {
				classie.add(elBody, 'active_' + thisSection.title);
			}

		}

	}


	// introScroll: Subtle parralax for intro section
	// ----------------------------------------------------------------------------
	function introScroll() {

		// if the current scroll position is less than the starting position of section.share
		// and our window width is greater than 960px
		if (numScrollPos < arrSectionData[2].numStart && numWindowWidth >= 960) {

			numIntroScrollPos = numScrollPos / numDocumentHeight * 100;
			elIntroBackground.style.top = (numIntroScrollPos * 4) + 'px';

			elIntroAndroid.style.left = -(numIntroScrollPos / 3) + 'px';
			elIntroIOS.style.right = -(numIntroScrollPos / 3) + 'px';

		}

	}


	// whileScrolling: All funcitons to be executed while scrolling / touching
	// ----------------------------------------------------------------------------
	function whileScrolling() {

		// update scroll values as we scroll
		numScrollPos = window.pageYOffset;
		numScrollBottomPos = numScrollPos + numWindowHeight;

		// once we have scrolled the entire document, set boolScrolled to true
		if (numScrollBottomPos === numDocumentHeight) {
			boolScrolled = true;
		}

		trackSection();
		introScroll();

	}


/*
	// Window Events: On Touch - Start, Move, and End
	// ----------------------------------------------------------------------------
	function touchScrolling() {

		// exit function if this is not Chrome iOS
		if (!navigator.userAgent.match('CriOS')) {
			return;
		}

		// touch variables
		var boolTouching = false,
			dataTouchS,
			dataTouchM,
			dataTouchE,
			dataTouchAll,
			dataTouchID;

		document.body.addEventListener('touchstart', function(e) {

			// code adapted from:
			// http://dropshado.ws/post/45694832906/touch-identifier-0

			// dismiss after-touches
			if (boolTouching) {
				return;
			}

			// only care about the first touch
			dataTouchS  = e.changedTouches[0];
			dataTouchID = dataTouchS.identifier;

			window.addEventListener('touchmove', onTouchMove, false);
			window.addEventListener('touchend', onTouchEnd, false);

			boolTouching = true;

		}, false);

		// iterate through touch points and stick with the initial touch contact
		function getTouch(e) {

			// cycle through every changed touch and get one that matches
			for (var i = 0, len = e.changedTouches.length; i < len; i++) {

				dataTouchAll = e.changedTouches[i];

				if (dataTouchAll.identifier === dataTouchID) {
					return dataTouchAll;
				}

			}

		}

		// assign touchstart to touchmove, updateColor as we move
		function onTouchMove(e) {

			dataTouchM = getTouch(e);

			if (!dataTouchM) {
				return;
			}

			whileScrolling();

		}

		// assign touchstart to touchend, remove touch listeners, set boolTouching back to false
		function onTouchEnd(e) {

			dataTouchE = getTouch(e);

			if (!dataTouchE) {
				return;
			}

			window.removeEventListener('touchmove', onTouchMove, false);
			window.removeEventListener('touchend', onTouchEnd, false);

			boolTouching = false;

		}

	}
*/


	// Window Events: On - Scroll, Resize
	// ----------------------------------------------------------------------------
	window.addEventListener('scroll', function(e) {

		whileScrolling();

	}, false);

	window.addEventListener('resize', function(e) {

		// do not fire resize event for every pixel... wait until finished
		waitForFinalEvent(function() {

			// recalculate window width & height on resize
			numWindowWidth  = window.innerWidth;
			numWindowHeight = window.innerHeight;

			// re-establish which sections are active
			measureSectionHeight();

		}, 500, 'unique string');

	}, false);


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	waitForImages();
	pageLoaded();


});