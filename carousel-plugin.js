// carousel-plugin.js
// version 1.3

(function($) {

	var methods = {
		go_to : function(page) {

			switch(this.data("carousel__mode")) {
				case "fade":
					// if this is a fade carousel
					// Everything other than the target page and the source page:
					$(".wrapper > ul > li:not([rel=" + page + "]):not(.active_page)", this)
						.css({"z-index": -2})
					// The source page:
					this.carousel("get_active_page").removeClass("active_page")
						.css({"z-index": 0})
						.stop()
						.animate(
							{opacity: 0},
							{duration: this.data("carousel__duration"),
							easing: this.data("carousel__easing"), queue: false});
					// The target page:
					this.carousel("get_page", page).addClass("active_page")
						.css({"z-index": -1})
						.stop()
						.animate(
							{opacity: 1},
							{duration: this.data("carousel__duration"),
							easing: this.data("carousel__easing"), queue: false});
					$(".wrapper > ul", this).change() // Trigger change.
					break
				case "slide":
					this.carousel("get_active_page").removeClass("active_page");
					this.carousel("get_page", page).addClass("active_page");
					$(".wrapper > ul", this)
						.stop()
						.animate(
							{"margin-left":
								-1 * (page-1)* this.data("carousel__slidewidth")},
							{duration: this.data("carousel__duration"),
							easing: this.data("carousel__easing"), queue: false}
					).change()
					break;
				case "vslide":
					this.carousel("get_active_page").removeClass("active_page");
					this.carousel("get_page", page).addClass("active_page");
					$(".wrapper > ul", this).stop().animate(
						{"margin-top":
							-1 * (page-1)* this.data("carousel__slideheight")},
						{duration: this.data("carousel__duration"),
						easing: this.data("carousel__easing"), queue: false}
					).change()
					break;

				case "card":
					// if this is a fade carousel

					// Everything other than the target page:
					var carousel = this
					$(".wrapper", this)
						.transition(
							{"perspective": carousel.data("carousel__perspective"), "rotateY" : "90deg"},
							this.data("carousel__duration"), // duration
							this.data("carousel__easing"), // easing
							function() { // callback
								// when we're done folding out of view.
								$(carousel).carousel("get_active_page")
									.removeClass("active_page")
									.css({"opacity": 0})
								$(carousel).carousel("get_page", page)
									.addClass("active_page")
									.css({"opacity": 1})
								// now we fold back out
								$(".wrapper", carousel)
									.css({"rotateY": "270deg"})
									.transition(
										{"perspective": carousel.data("carousel__perspective"), "rotateY" : "360deg"},
										carousel.data("carousel__duration"),
										carousel.data("carousel__easing"),
										function() {$(this).css({"rotateY": "0deg"})}
									)
								$(".wrapper > ul", carousel).change() // Trigger change.
							})
					break

			}

			return this;
		},

		next_page : function() {
			if ($(this).data("carousel__randomize")) {
				// Get a random page. If this is the current page, try again.
				var num_pages = $(this).data("carousel__pages")
				var rnd = num_pages
				while (rnd == $(this).carousel("current_page")) {
					rnd = Math.floor(Math.random()*num_pages)+1
				}
				$(this).carousel("go_to", rnd)
			} else {
				if ($(this).carousel("current_page") == $(this).data("carousel__pages")) {
					// if maxed out
					if ($(this).data("carousel__loop_pages")) {
						$(this).carousel("go_to", 1)
					}
				} else {
					// Go to the next page:
					$(this).carousel("go_to", $(this).carousel("current_page")+1)
				}
			}

			return this;
		},

		prev_page : function() {
			if ($(this).carousel("current_page") == 1) {
				// end of the line
				if ($(this).data("carousel__loop_pages")) {
					$(this).carousel("go_to", $(this).data("carousel__pages"))
				}
			} else {
				$(this).carousel("go_to", $(this).carousel("current_page")-1)
			}
			return this;
		},

		get_page : function(page) {
			return $(".wrapper > ul > li[rel=" + page + "]", this)
		},

		get_active_page : function() {
			return $(".wrapper > ul > li.active_page", this)
		},

		has_next : function() {
			if ($(this).carousel("current_page") == $(this).data("carousel__pages")) {
				// if maxed out
				if ($(this).data("carousel__loop_pages")) {
					return 1
				} else { return false }
			} else {
				// Go to the next page:
				return $(this).carousel("current_page")+1
			}
		},

		has_prev : function() {
			if ($(this).carousel("current_page") == 1) {
				// end of the line
				if ($(this).data("carousel__loop_pages")) {
					return $(this).data("carousel__pages")
				} else { return false }
			} else {
				return $(this).carousel("current_page")-1
			}
		},

		current_page : function() {
			return parseInt($(".wrapper > ul > li.active_page", this).attr("rel"))
		},

		stop_timer : function() {
			clearInterval($(this).data("carousel__timerobj"))
			return this;
		},

		start_timer : function() {
			var that = this
			this.data("carousel__timerobj",
				setInterval(function() {
					$(that).carousel("next_page")
				} , this.data("carousel__timer")))
			return this;
		},

		stop_timer : function() {
			clearInterval(this.data("carousel__timerobj"))
			return this;
		},

		stack : function() { // make <li>s stack on top of each other.
			var top_pos = $(".wrapper > ul > li:eq(0)", this).offset().top
			var left_pos = $(".wrapper > ul > li:eq(0)", this).offset().left
			$.each($(".wrapper > ul > li", this)
				.filter(":not(.active_page)"), function(idx, elm) {
				$(elm).offset({"top": top_pos, "left": left_pos }).css({"z-index": -1, "opacity": 0})
			})
			return this;
		},

		init : function(opts) {
			var settings = $.extend( {
				'duration'	: 2000,
				'easing'	: undefined,
				'mode'		: "slide", 	// options: slide, fade
				'bindlinks'	: true, 	// whether we want to bind links automatically
										// or not. This binds .prev and .next
				'timer'		: false, 	// set a timer if we want one
				'loop_pages': true, 	// whether to loop the pages
				'randomize' : false, 	// whether to randomize the next_page method
				'perspective': "500px", // perspective for card mode.
				'force_pages': false, 	// forces a certain number of pages.
										// Useful for partial scrolling
				'bind_hover': true		// Set to false if you do not want the timer
										// to halt when the user hovers over the
										// carousel. Ignored when timer is false.
			}, opts)
			this.data("carousel__duration", settings.duration)
			this.data("carousel__easing", settings.easing)
			this.data("carousel__loop_pages", settings.loop_pages)
			this.data("carousel__mode", settings.mode)
			this.data("carousel__randomize", settings.randomize)
			this.data("carousel__perspective", settings.perspective)

			$.each($(".wrapper > ul > li", this), function(idx, elm) {
				$(elm).attr("rel", idx+1);
			})

			if(settings.force_pages) {
				this.data("carousel__pages", settings.force_pages)
			} else {
				this.data("carousel__pages", $(".wrapper > ul > li", this ).length)
			}

			switch(settings.mode) {
				case "fade":
					// fix positioning in fade mode
					this.carousel("stack")
					break;
				case "slide":
					this.data("carousel__slidewidth",
						parseInt($(".wrapper > ul > li:eq(0)", this).css("width")))
					break;
				case "vslide":
					this.data("carousel__slideheight",
						parseInt($(".wrapper > ul > li:eq(0)", this).css("height")))
					$(".wrapper > ul > li", this).css({"float": "none"})
					break;
				case "card":
					if ($.fn.transit) {
						// If we have transit loaded.
						$("li:not(.active_page)", this).css({"opacity":0})
						this.carousel("stack")
					} else {
						console.log("Cannot spawn carousel in card mode: requires jquery-transit to be loaded. Falling back to fade.")
						this.data("carousel__mode", "fade")
						this.carousel("stack")
					}
					break
				default:
					$.error("Unknown slide mode: \'" + settings.mode + "\'. Defaulting to slide." )
					settings.mode = "slide"
					this.data("carousel__slidewidth",
						parseInt($(".wrapper > ul > li:eq(0)", this).css("width")))
			}


			if (settings.timer) {
				this.data("carousel__timer", settings.timer)
				this.carousel("start_timer")
				if (settings.bind_hover) {
					this.hover(function() {
						// Hover in
						$(this).carousel("stop_timer")
					}, function() {
						// Hover out
						$(this).carousel("start_timer")
					})
				}
			}

			if ($(".active_page", this).length == 0) {
				$(".wrapper > ul > li:eq(0)", this).addClass("active_page")
			}

			if (settings.bindlinks) {
				// bind .prev/next links if any
				if ($("> .prev", this).length > 0) {
					$("> .prev", this).click(
						function(event) {
							event.preventDefault()
							$(this).parent("div").carousel("prev_page")
					})
				} else { console.log("Cannot bind next (not found)") }
				if ($("> .next", this).length > 0) {
					$("> .next", this).click(
						function(event) {
							event.preventDefault()
							$(this).parent("div").carousel("next_page")
					})
				} else { console.log("Cannot bind next (not found)") }
			}
			return this; // for chaining.
		}
	}

	$.fn.carousel = function(method) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist in jQuery.carousel');
		}

	// end plugin
	}
})(jQuery);
