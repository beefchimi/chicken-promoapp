document.addEventListener('DOMContentLoaded', function() {


	// Global Variables
	// ----------------------------------------------------------------------------
	var elHTML            = document.documentElement,
		elBody            = document.body,
		transitionEvent   = whichTransitionEvent(),
		animationEvent    = whichAnimationEvent();

	var elIntroBackground = document.getElementById('intro_background');

	var arrSectionData = [
		{ title:'header',    numHeight:0, numStart:0 },
		{ title:'intro',     numHeight:0, numStart:0 },
		{ title:'share',     numHeight:0, numStart:0 },
		{ title:'sync',      numHeight:0, numStart:0 },
		{ title:'shop',      numHeight:0, numStart:0 },
		{ title:'create',    numHeight:0, numStart:0 },
		{ title:'available', numHeight:0, numStart:0 },
		{ title:'footer',    numHeight:0, numStart:0 }
	];

	var numSections = arrSectionData.length;

	// scroll, touch, and height variables
	var numScrollPos       = window.pageYOffset,
		numWindowHeight    = window.innerHeight,
		numScrollBottomPos = numScrollPos + numWindowHeight,
		numDocumentHeight  = elBody.clientHeight;

	var fullyScrolled = false; // used to determine if we will run trackSection()


	// Helper: Check when a CSS transition or animation has ended
	// ----------------------------------------------------------------------------
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

		ajax.open('GET', 'assets/img/svg.svg', true);
		ajax.send();
		ajax.onload = function(e) {

			var div = document.createElement('div');
			div.id = 'svgInject';
			div.innerHTML = ajax.responseText;
			document.body.insertBefore(div, document.body.childNodes[0]);

		}

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

		// the rest of the code does not apply to IE9, so exit
		if ( classie.has(elHTML, 'ie9') ) {
			return;
		}

		var 	elHeader = document.getElementsByTagName('header')[0];

		// listen for the end of <header> fadeIn animation
		elHeader.addEventListener(animationEvent, removeFOUT);

		function removeFOUT() {

			elHTML.setAttribute('data-load', 'ready');
			elHeader.removeEventListener(animationEvent, removeFOUT);

		}

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

		trackSection();

	}


	// trackSection: Track which sections have been scrolled to
	// ----------------------------------------------------------------------------
	function trackSection() {

		if (fullyScrolled) {
			return;
		}

		for (var i = 0; i < numSections; i++) {

			var thisSection = arrSectionData[i];

			if (numScrollBottomPos > thisSection.numStart) {
				classie.add(elBody, 'active_' + thisSection.title);
			}

/*
			else {
				classie.remove(elBody, 'active_' + thisSection.title);
			}
*/

		}

	}



/*
	function testScroll() {

		if (numScrollPos < numPosHeader) {

			// console.log();

			elIntroBackground.style.width = 100 + numCurrentScrollPercent + '%';

			// elIntroBackground.style.top = -(numCurrentScrollPercent * 2) + 'px';

		}

	}
*/


	// Window Events: On - Scroll, Resize
	// ----------------------------------------------------------------------------
	window.addEventListener('scroll', function(e) {

		// update scroll values as we scroll
		numScrollPos = window.pageYOffset;
		numScrollBottomPos = numScrollPos + numWindowHeight;

		if (numScrollBottomPos === numDocumentHeight) {
			fullyScrolled = true;
		}

		trackSection();

	}, false);

	window.addEventListener('resize', function(e) {

		// do not fire resize event for every pixel... wait until finished
		waitForFinalEvent(function() {

			// recalculate window height on resize
			numWindowHeight = window.innerHeight;

			// re-establish which sections are active
			measureSectionHeight();

		}, 500, 'unique string');

	}, false);


	// Initialize Primary Functions
	// ----------------------------------------------------------------------------
	pageLoaded();


});