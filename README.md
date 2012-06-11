carousel-plugin
===============

A jQuery plugin with an unimaginative name.

I originally had only intended to make a single carousel, but as the project progressed I realized I was quite pleased with the results. Thus, I made it into a plugin for future use. Now I'm sharing it with humanity.


Usage example
------------

	$("#fade_carousel").carousel({
		"mode": "card",
		"duration": 2000,
		"easing": "linear",
		"loop_pages": false})

Or just look at the example page. I'm lazy.

Known issues
---

* IE will not treat the alpha channel correctly when dealing with images that have one in a fade carousel.
* Can't switch between modes at this point.
* The slide carousel mode does not have an "infinity" mode. Working on that.