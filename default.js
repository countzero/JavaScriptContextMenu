/*
Name:       RightClick
Version:    0.2.0 (March 03 2009)
Author:     Finn Rudolph

Licence:    RightClick is licensed under a Creative Commons 
            Attribution-Noncommercial 3.0 Unported License 
            (http://creativecommons.org/licenses/by-nc/3.0/).

            You are free:
                + to Share - to copy, distribute and transmit the work
                + to Remix - to adapt the work

            Under the following conditions:
                + Attribution. You must attribute the work in the manner specified by the author or licensor 
                  (but not in any way that suggests that they endorse you or your use of the work). 
                + Noncommercial. You may not use this work for commercial purposes. 

            + For any reuse or distribution, you must make clear to others the license terms of this work.
            + Any of the above conditions can be waived if you get permission from the copyright holder.
            + Nothing in this license impairs or restricts the author's moral rights.
*/


/* Constructor */
function EventRightClick ()
{
	/* Closure for this */
	var thisObject = this;

	/* Initiate */
	this.init = function ()
	{
		thisObject.MouseButton.init();
	};

	/* Mouse Menu */
	this.MouseMenu =
	{
		active: false,

		/* Init */
		init: function(e,button)
		{
			thisObject.MouseMenu.display(e,button);
		},
		
		/* Display menu at the current mouse position */
		display: function(e, button)
		{
			var posx = 0;
			var posy = 0;
			if(!e) var e = window.event;
			if (e.pageX || e.pageY)
			{
				posx = e.pageX;
				posy = e.pageY;
			}
			else if (e.clientX || e.clientY)
			{
				posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			var mouseMenu = document.getElementById('mouse_menu_right');
			if(button === "RIGHT")
			{
				thisObject.MouseMenu.active = true;
				mouseMenu.style.visibility = 'visible';
				mouseMenu.style.top = posy + 'px';
				mouseMenu.style.left = posx + 'px';

				var debugText = document.createTextNode(posx + ' x ' + posy + ' px');
				var mouseMenuDebug = document.getElementById('mouse_menu_debug');
				mouseMenuDebug.removeChild(mouseMenuDebug.firstChild);
				mouseMenuDebug.appendChild(debugText);
			}
			else
			{
				thisObject.MouseMenu.active = false;
				mouseMenu.style.visibility = 'hidden';
			}
		}
	};

	/* Mouse button detection */
	this.MouseButton =
	{
		targetContainer: document.getElementById('click_field'),
		menuContainer: document.getElementById('mouse_menu_right'),
		overTarget: false,

		/* Init mouse button event listener */
		init: function()
		{
			thisObject.addEvent(thisObject.MouseButton.targetContainer,'mouseover',thisObject.MouseButton.start);
			thisObject.addEvent(thisObject.MouseButton.targetContainer,'mouseout',thisObject.MouseButton.end);
		},
		
		/* Start */
		start: function(e)
		{
			//thisObject.MouseButton.targetContainer.style.backgroundColor = "yellow";
			thisObject.addEvent(document,'mousedown',thisObject.MouseButton.get);
			thisObject.addEvent(document,'mouseup',thisObject.MouseButton.suppressBrowserMenu);
			thisObject.addEvent(document,'click',thisObject.MouseButton.suppressBrowserMenu);
			thisObject.addEvent(document,'dblclick',thisObject.MouseButton.suppressBrowserMenu);
			thisObject.addEvent(document,'contextmenu',thisObject.MouseButton.suppressBrowserMenu);
		},

		/* End */
		end: function(e)
		{
			/* Prevent Event-Bubbling */
			var tg = (window.event) ? e.srcElement : e.target;
			if (tg.nodeName != 'DIV') return;
			var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
			while (reltg != tg && reltg.nodeName != 'BODY')
			{
				reltg = reltg.parentNode
			}
			if (reltg == tg) return;

			//thisObject.MouseButton.targetContainer.style.backgroundColor = "white";
			thisObject.removeEvent(document,'mousedown',thisObject.MouseButton.get);
			thisObject.removeEvent(document,'mouseup',thisObject.MouseButton.suppressBrowserMenu);
			thisObject.removeEvent(document,'click',thisObject.MouseButton.suppressBrowserMenu);
			thisObject.removeEvent(document,'dblclick',thisObject.MouseButton.suppressBrowserMenu);
			thisObject.removeEvent(document,'contextmenu',thisObject.MouseButton.suppressBrowserMenu);
		},

		/* Get the current mouse button */
		get: function(e)
		{
			var button;
			if (e.which == null)
			{
				button = (e.button < 2) ? "LEFT" : ((e.button == 4) ? "MIDDLE" : "RIGHT");
			}
			else
			{
				button = (e.which < 2) ? "LEFT" : ((e.which == 2) ? "MIDDLE" : "RIGHT");
			}
			
			thisObject.MouseMenu.init(e,button);
			thisObject.MouseButton.suppressBrowserMenu(e);
		},

		/* Suppress the default browser menu on right click */
		suppressBrowserMenu: function(e)
		{
			if (e.preventDefault)
			{
				e.preventDefault();
			}
			else
			{
				e.returnValue = false;
			}

			/* Hack to suppress Operas default context menu */
			if (navigator.userAgent.indexOf('Opera') != -1) 
			{
				window.blur();
				window.focus();
			}
			return false;
		}
	};

	/* Add events */
	this.addEvent = function( obj, type, fn )
	{
		if (obj.addEventListener)
		{
			obj.addEventListener( type, fn, false );
		}
		else if (obj.attachEvent)
		{
			obj["e"+type+fn] = fn;
			obj[type+fn] = function() { obj["e"+type+fn]( window.event ); };
			obj.attachEvent( "on"+type, obj[type+fn] );
		}
	};

	/* Remove events */
	this.removeEvent = function( obj, type, fn )
	{
		if (obj.removeEventListener)
			obj.removeEventListener( type, fn, false );
		else if (obj.detachEvent)
		{
			obj.detachEvent( "on"+type, obj[type+fn] );
			obj[type+fn] = null;
			obj["e"+type+fn] = null;
		}
	};
}


/* DOMContentLoaded event handler - by Tanny O'Haley */
var domReadyEvent =
{
	name: "domReadyEvent",
	/* Array of DOMContentLoaded event handlers.*/
	events: {},
	domReadyID: 1,
	bDone: false,
	DOMContentLoadedCustom: null,

	/* Function that adds DOMContentLoaded listeners to the array.*/
	add: function(handler)
	{
		/* Assign each event handler a unique ID. If the handler has an ID, it has already been added to the events object or been run.*/
		if (!handler.$$domReadyID)
		{
			handler.$$domReadyID = this.domReadyID++;

			/* If the DOMContentLoaded event has happened, run the function. */
			if(this.bDone)
			{
				handler();
			}

			/* store the event handler in the hash table */
			this.events[handler.$$domReadyID] = handler;
		}
	},

	remove: function(handler)
	{
		/* Delete the event handler from the hash table */
		if (handler.$$domReadyID)
		{
			delete this.events[handler.$$domReadyID];
		}
	},

	/* Function to process the DOMContentLoaded events array. */
	run: function()
	{
		/* quit if this function has already been called */
		if (this.bDone)
		{
			return;
		}

		/* Flag this function so we don't do the same thing twice */
		this.bDone = true;

		/* iterates through array of registered functions */
		for (var i in this.events)
		{
			this.events[i]();
		}
	},

	schedule: function()
	{
		/* Quit if the init function has already been called*/
		if (this.bDone)
		{
			return;
		}

		/* First, check for Safari or KHTML.*/
		if(/KHTML|WebKit/i.test(navigator.userAgent))
		{
			if(/loaded|complete/.test(document.readyState))
			{
				this.run();
			}
			else
			{
				/* Not ready yet, wait a little more.*/
				setTimeout(this.name + ".schedule()", 100);
			}
		}
		else if(document.getElementById("__ie_onload"))
		{
			/* Second, check for IE.*/
			return true;
		}

		/* Check for custom developer provided function.*/
		if(typeof this.DOMContentLoadedCustom === "function")
		{
			/* if DOM methods are supported, and the body element exists (using a double-check
			including document.body, for the benefit of older moz builds [eg ns7.1] in which
			getElementsByTagName('body')[0] is undefined, unless this script is in the body section) */
			if(typeof document.getElementsByTagName !== 'undefined' && (document.getElementsByTagName('body')[0] !== null || document.body !== null))
			{
				/* Call custom function. */
				if(this.DOMContentLoadedCustom())
				{
					this.run();
				}
				else
				{
					/* Not ready yet, wait a little more. */
					setTimeout(this.name + ".schedule()", 250);
				}
			}
		}
		return true;
	},

	init: function()
	{
		/* If addEventListener supports the DOMContentLoaded event.*/
		if(document.addEventListener)
		{
			document.addEventListener("DOMContentLoaded", function() { domReadyEvent.run(); }, false);
		}

		/* Schedule to run the init function.*/
		setTimeout("domReadyEvent.schedule()", 100);

		function run()
		{
			domReadyEvent.run();
		}

		/* Just in case window.onload happens first, add it to onload using an available method.*/
		if(typeof addEvent !== "undefined")
		{
			addEvent(window, "load", run);
		}
		else if(document.addEventListener)
		{
			document.addEventListener("load", run, false);
		}
		else if(typeof window.onload === "function")
		{
			var oldonload = window.onload;
			window.onload = function()
			{
				domReadyEvent.run();
				oldonload();
			};
		}
		else
		{
			window.onload = run;
		}

		/* for Internet Explorer */
		/*@cc_on
			@if (@_win32 || @_win64)
			document.write("<script id=__ie_onload defer src=\"//:\"><\/script>");
			var script = document.getElementById("__ie_onload");
			script.onreadystatechange = function()
			{
				if (this.readyState == "complete")
				{
					domReadyEvent.run(); // call the onload handler
				}
			};
			@end
		@*/
	}
};

var domReady = function(handler) { domReadyEvent.add(handler); };
domReadyEvent.init();


/* Create an instance when the DOM structure has been loaded */
domReady(function()
{
	var FirstTest = new EventRightClick();
	FirstTest.init();

});