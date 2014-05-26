/*
jQuery Hashlight v1.0.0
 
Copyright (c) 2014 Gilang Charismadiptya Prashasta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

(function ($) {
	//Main plugin exposed
	$.fn.hashlight = function (opt) {
		var oldtag = [];
		var options = {
			tag : '#',
			pattern: function (tag){
				return new RegExp("(^"+tag+"[A-Za-z0-9-_]+| "+tag+"[A-Za-z0-9-_]+)" ,"g");
				
			},
			dataProvider: null,
			markerElement: function (id) {
				return '<div class="hashlight-marker" id="' + id + '" ></div>';
			},
			tagElement: function (tag) {
				urltag = tag.replace(options.tag,"");
				return "<a class='hashlight-tag' href='"+urltag+"'><span  style='color: white;border-radius: 3px;background-color : #3498db;'>" + tag + "</span></a>";
			},
			autoCompleteElement: function (autocompletearray) {
				var autocomplete = "<ul class='hashlight-autocomplete'>";
				for (i in autocompletearray) {
					if (i == 0) {
						autocomplete += "<li data-value='" + autocompletearray[i] + "' class='hashlight-autocomplete-active'>" + autocompletearray[i] + "</li>";
					} else {
						autocomplete += "<li data-value='" + autocompletearray[i] + "'>" + autocompletearray[i] + "</li>";
					}
				}

				autocomplete += "</ul>";
				return autocomplete;

			}
		}

		//replace user defined options
		for (option in opt) {
			options[option] = opt[option];
		}

		//Append highlighter layer
		var objId = this.attr('id');
		$("body").append(options.markerElement(objId + "-marker"));

		//Asign cache selector variable
		var marker = $("#" + objId + "-marker");
		var sel = this;

		//add required css to text area
		sel.css("word-break", "break-all");

		//Add textarea css to highlighter
		//Height-width

		//padding
		marker.css("padding-top", sel.css("padding-top"));
		marker.css("padding-right", sel.css("padding-right"));
		marker.css("padding-left", sel.css("padding-left"));
		marker.css("padding-bottom", sel.css("padding-bottom"));

		//font family
		marker.css("font-family", sel.css("font-family"));

		//fontsize
		marker.css("font-size", sel.css("font-size"));


		//listen to resize / position change event
		var lx = 0;
		var ly = 0;
		var lw = 0;
		var lh = 0;
		var x = sel.offset().top;
		var y = sel.offset().left;
		var w = sel.width();
		var h = sel.height();
		var showAutoComplete = false;
		var diff;
		marker.width(w);
		marker.height(h);
		marker.offset({
			top: x,
			left: y
		});
		function handleResize() {
			x = sel.offset().top;
			y = sel.offset().left;
			w = sel.width();
			h = sel.height();
			if (lx != x || ly != y || lw != w || lh != h) {
				marker.width(w);
				marker.height(h);
				marker.offset({
					top: x,
					left: y
				});

				$(".hashlight-autocomplete").offset({
					top: x + h + 5,
					left: y
				});
				$(".hashlight-autocomplete").width(w + 4);

				lx = x;
				ly = y;
				lw = w;
				lh = h;
			}
			requestAnimationFrame(handleResize);
		}

		requestAnimationFrame(handleResize);

		//add scroll logic  
		this.on('scroll', function () {
			marker.scrollTop(sel.scrollTop());
		});

		//Add textarea position changed logic

		//What to do when user input something
		this.bind('input propertychange', function (e) {
			var text = sel.val().replace(/\n/g, '<br/>');
			var reg = text.slice(0);

			text = text.split(" ").join("&nbsp;<wbr>")

			//Get Tag array
			var tag = reg.match(options.pattern(options.tag));

			
			//Replace every tag founded with numbered data element
			//We need to replace the tag with an id first, because there is a change that tag is contained
			//within another tag ex : #another <=> #a .

			if (tag != null) {
				tag.sort(function (a, b) {
					a.length - b.length;
				});
			}

			for (i in tag) {
				tag[i] = tag[i].replace(" ", "");
				text = text.replace(new RegExp("\\" + tag[i] + "\\b", 'g'), "#" + i + "#");
			}

			for (i in tag) {
				text = text.replace(new RegExp("#" + i + "#", 'g'), options.tagElement(tag[i]));
			}

			//Replace the object highlighter
			marker.empty().html(text);

			//Open autocomplete if exist



			if (options.dataProvider != null) {

				$(".hashlight-autocomplete").remove();
				showAutoComplete = false;

				//add new tag on t
				diff = $(tag).not(oldtag).get();
				if (diff.length > 0) {
					var autocompletearray = options.dataProvider(diff);
					var autocomplete = options.autoCompleteElement(autocompletearray);



					$("body").append(autocomplete);
					$(".hashlight-autocomplete").offset({
						top: x + h + 5,
						left: y
					});
					$(".hashlight-autocomplete").width(w + 4);
					showAutoComplete = true;
				}
				oldtag = tag;
			}
		});

		this.on("keydown", function (e) {
			switch (e.keyCode) {
			case 38:
				if (showAutoComplete) {
					var prev = $(".hashlight-autocomplete").find(".hashlight-autocomplete-active").prev();
					if (prev.length > 0) {
						$(".hashlight-autocomplete-active").removeClass("hashlight-autocomplete-active");
						prev.addClass("hashlight-autocomplete-active")
					}

					e.preventDefault();
				}
				break;

			case 40:
				if (showAutoComplete) {
					var next = $(".hashlight-autocomplete").find(".hashlight-autocomplete-active").next();
					if (next.length > 0) {

						$(".hashlight-autocomplete-active").removeClass("hashlight-autocomplete-active");
						next.addClass("hashlight-autocomplete-active")
					}
					e.preventDefault();
				}
				break;
			case 13:
				if (showAutoComplete) {
					var selection = $(".hashlight-autocomplete-active").data("value");
					//Replace tag w/ selection

					var inputValue = sel.val();

					inputValue = inputValue.replace(new RegExp("\\" + diff[0] + "\\b"), selection + " ");

					sel.val(inputValue);

					sel.trigger("propertychange");

					$(".hashlight-autocomplete").remove();
					e.preventDefault();
				}
				break;
			}
		});

		//Auto complete Mouse over handler
		$(document).on("mouseover", ".hashlight-autocomplete li", function () {
			$(".hashlight-autocomplete-active").removeClass("hashlight-autocomplete-active");
			$(this).addClass("hashlight-autocomplete-active");
		});

		//Auto complick on click handler
		$(document).on("click", ".hashlight-autocomplete li", function (e) {
			if (showAutoComplete) {
				var selection = $(".hashlight-autocomplete-active").data("value");
				//Replace tag w/ selection
				var inputValue = sel.val();
				inputValue = inputValue.replace(new RegExp("\\" + diff[0] + "\\b"), selection + " ");
				sel.focus();
				sel.val(inputValue);
				sel.trigger("propertychange");
				$(".hashlight-autocomplete").remove();
				e.preventDefault();
			}
		});

		$.fn.hashlight.getTagArray = function () {
			var text = sel.val();
			return text.match(options.pattern(options.tag));
		}
		$.fn.hashlight.getOptions = function () {
			
			return options;
		}


	}
}(jQuery));