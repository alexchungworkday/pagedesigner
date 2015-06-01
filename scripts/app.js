/* ==========================================================================
Mozart Namespace
========================================================================== */

/* ==========================================================================
Constant Definitions
========================================================================== */
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var draggableSources = ['layout_grid', 'core_grid', 'logic_grid'];
var mozartElementId = 1;
var selectedElementId;
// Store all the dropped elememnts in the droppable area. No nesting, each individual element with the elementID as key
var blockArray = {}; // JS objects representing the layout components 

var blockpropertyTemplate;

/* ==========================================================================
Page Class
========================================================================== */
function Page()
{
	this.activeBlockId;
}

/* ==========================================================================
PageBlock Class
========================================================================== */
var page = new Page();
PageBlock.prototype = page;
page.activeBlockId = 0;

PageBlock.prototype.constructor = PageBlock;
// Block Constructor
function PageBlock(id, title) {
  	// Call the parent constructor, making sure (using Function#call)
  	// that "this" is set correctly during the call
  	Page.call(this);

  	// Initialize our Section-specific properties
  	this.id = id;
	this.title = title;
	this.isNotActiveBlock = false;
};

/* ==========================================================================
Common Utility Functions
========================================================================== */
function isEmptyObject( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
}

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

var stringConstructor = "test".constructor;
var arrayConstructor = [].constructor;
var objectConstructor = {}.constructor;

function whatIsIt(object) {
    if (object === null) {
        return "null";
    }
    else if (object === undefined) {
        return "undefined";
    }
    else if (object.constructor === stringConstructor) {
        return "String";
    }
    else if (object.constructor === arrayConstructor) {
        return "Array";
    }
    else if (object.constructor === objectConstructor) {
        return "Object";
    }
    else {
        return "unknown";
    }
}

var byId = function (id) { return document.getElementById(id); },

loadScripts = function (desc, callback) {
	var deps = [], key, idx = 0;

	for (key in desc) {
		deps.push(key);
	}

	(function _next() {
		var pid,
			name = deps[idx],
			script = document.createElement('script');

		script.type = 'text/javascript';
		script.src = desc[deps[idx]];

		pid = setInterval(function () {
			if (window[name]) {
				clearTimeout(pid);

				deps[idx++] = window[name];

				if (deps[idx]) {
					_next();
				} else {
					callback.apply(null, deps);
				}
			}
		}, 30);

		document.getElementsByTagName('head')[0].appendChild(script);
	})()
},

console = window.console;
/* ==========================================================================
Init
========================================================================== */

;(function(window) {
	
	/* ==========================================================================
	Remove & Edit Grid Element Button
	========================================================================== */
	var removeGridItem = function() {	
		var li_array = $(this).parents('li');
		if (li_array.length > 0)
		{
			var li = $(li_array[0]); // first immediate parent
			var parentId = li.attr('id');

			$('#parentContainerProperty-' + blockArray[parentId].id).remove();
			li.remove();  // remove container in drop area
			delete blockArray[parentId]; // remove JS obj
		}
	}

	var editGridItem = function() {
		var li_array = $(this).parents('li');
		if (li_array.length > 0)
		{
			var li = $(li_array[0]); // first immediate parent
			var parentId = li.attr('id');
			var blockItem = blockArray[parentId];

			// Update the id of page block infocus
			page.activeBlockId = blockItem.id;
			togglePropertyWindow();
		}	
	}
	
	var api_base = 'https://i-e235ba14.workdaysuv.com/ccx/api/';	
	var tenant = 'gms';
	var access_token;
	var verify = false;
	var loginWindow;
	var pageBodyContainerId = 1;
	
	$.fn.replaceTagName = function(replaceWith) {
        var tags = [],
            i    = this.length;
        while (i--) {
            var newElement = document.createElement(replaceWith),
                thisi      = this[i],
                thisia     = thisi.attributes;
            for (var a = thisia.length - 1; a >= 0; a--) {
                var attrib = thisia[a];
                newElement.setAttribute(attrib.name, attrib.value);
            };
            newElement.innerHTML = thisi.innerHTML;
            $(thisi).after(newElement).remove();
            tags[i] = newElement;
        }
        return $(tags);
    };

	var clearAdjustedWidth = function(targetId) {
		
	}

	var makeWidthAdjustable = function(targetId) {
		// Adjust div's width by dragging its right border
		var $drag = $("#" + targetId + " .drag-width-bar");

        $drag.on( 'mousedown', function( ev ) {
			console.log("drag bar mouse down");

            var $this = $( this );
            var $parent = $this.parent();
            var poffs = $parent.position();
            var pwidth = $parent.width();

            var x = ev.pageX;
            var y = ev.pageY;

			var lastLegalWidth = 0;

            $( document ).on( 'mousemove.dragging', function( ev ) {
                var mx = ev.pageX;
                var my = ev.pageY;

                var rx = mx - x;
                var ry = my - y;

				var illegalWidth = false;

				if ( (pwidth + rx) < 100) 
					illegalWidth = true;
				$parent.siblings().each(function() {
					$this = $(this);
					if ($this.width() < 100) {
						illegalWidth = true;
					}
				});

				if (!illegalWidth)
				{
					lastLegalWidth = (pwidth + rx);

					$parent.css( {
	                    'width'      : (pwidth + rx) + 'px',
						'flex-grow'	 : 0 	
	                } );
				} else {
					console.log("illegal Width");
					$parent.css( {
	                    'width'      : lastLegalWidth + 'px',
						'flex-grow'	 : 0 	
	                } );
				}

            } ).on( 'mouseup.dragging mouseleave.draggign', function( ev) {
                $( document ).off( '.dragging' );
            } );
        } );
	}

	var makeSortable = function(targetId)
	{
		//console.log("targetId " + targetId);
		Sortable.create(byId(targetId), {
			sort: true,
			group: {
				name: 'advanced',
				pull: true,
				put: true
			},
			handle: ".block__title", // Restricts sort start click/touch to the specified element
			animation: 150,
			onAdd: function(evt) {
				var itemEl = evt.item; //dragged HTML Element
				var fromList = evt.from;
				var $itemEl = $(itemEl);
				var li_uid = 'parentContainer-' + (pageBodyContainerId);
				var ul_uid = 'sortableContainer-' + (pageBodyContainerId);
				
				if ($itemEl.children('.grid_wrapper').length == 0) 
				{
					// List <li> block ID
					$itemEl.attr('id', li_uid);
					// Create a corresponding JS object
					blockArray[li_uid] = new PageBlock(pageBodyContainerId, 'Title');
					
					$itemEl.append(
						$("<h3>{ block_li.title }</h3>")
					);
					rivets.bind($('#' + li_uid), {block_li: blockArray[li_uid]});  // Bind dropped container DOM to JS Object
					
					// Add Property Panel
					var property_uid = 'parentContainerProperty-' + (pageBodyContainerId);
					
					// Add section from HTML template
					var context = {id: property_uid};  
					$('#page-property').append(
						blockpropertyTemplate(context)
					);	
					// Bind property section to JS Object
					rivets.bind($('#' + property_uid), {activeBlock: blockArray[li_uid]}); 
					// Update the id of page block infocus
					page.activeBlockId = pageBodyContainerId; 
					
					var wrapper = $('<div>').addClass('grid_wrapper');			
					if ($itemEl.hasClass('layout-container'))
					{
						// Layout Container
						var listContainer = $('<ul>').addClass('container_grid').attr('id', ul_uid);
						if ($itemEl.hasClass('block__section'))
						{
							// Section
						} else if ($itemEl.hasClass('block__columns'))
						{
							// Columns
							listContainer.addClass('flex-container');
						} else if ($itemEl.hasClass('block__grid'))
						{
							// Grid
							listContainer.addClass('flex-container flex-wrap');
						}
						wrapper.append(listContainer);
					} else if ($itemEl.hasClass('core-component'))
					{
						// Core Components
						var coretype = $itemEl.attr('data-coretype');
						var coreComponentContainer;
						switch (coretype)
						{
							case "block__text":
								coreComponentContainer = $('<input>').attr('type', 'text').attr('placeholder', 'Enter Text Here');								
							break;
							
							case 'block__heading':
								coreComponentContainer = $('<h1>').text('Heading');
							break;
							
							case 'block__label':
								coreComponentContainer = $('<label>').text('Label');
							break;
							
							case 'block__button':
								coreComponentContainer = $('<button>').attr('type', 'button').text('Click Me!');
							break;
						}
						wrapper.append(coreComponentContainer);
					}
					
					$itemEl.append(wrapper); 
					if ($itemEl.hasClass('layout-container'))
					{
						makeSortable(ul_uid);
					}
					
					// Add Edit button
					var actionButtonsWrapper = $("<div>").attr("class", 'action-buttons');
					var editButton = $('<div>').attr('class', "edit_grid__item fa fa-cog").html("&nbsp;");
					editButton.on('click', editGridItem);
					actionButtonsWrapper.append(editButton);
					// Add Close button
					var removeButton = $('<div>').attr('class', "remove_grid__item fa fa-trash-o").html("&nbsp;");
					removeButton.on('click', removeGridItem);
					actionButtonsWrapper.append(removeButton);
					$itemEl.append(actionButtonsWrapper);
				
					if ($itemEl.children('.drag-width-bar').length == 0) 
					{
						/* Determine the parent container type - Section or Columns */
						var parentContainerArray = $itemEl.parents('.layout-container');
						var parentIsColumnsContainer;
						if (parentContainerArray.length > 0)
						{
							var parentContainer = $(parentContainerArray[0]); // first immediate parent with class grid__item
							parentIsColumnsContainer = parentContainer.hasClass('block__columns');
						}

						if (parentIsColumnsContainer)
						{				
							var dragWidthBar = $('<div>').attr('class', 'drag-width-bar');			
							$itemEl.append(
								dragWidthBar
							);
							makeWidthAdjustable('parentContainer-' + (pageBodyContainerId));
						}
					}
					
					pageBodyContainerId++;
				}
				
				// Clear the width adjustments from all siblings
				$itemEl.siblings().each(function() {
					$this = $(this);
					$this.removeAttr('style');
				});
			},
			onRemove: function(evt) {
				var itemEl = evt.item; //dragged HTML Element
				var fromList = evt.from;
								
				var $itemEl = $(itemEl);
				if ($itemEl.children('.drag-width-bar').length > 0) 
				{
					$itemEl.chidren('.drag-width-bar').each(function() {
						$this = $(this);
						$this.remove();
					});
				}
			}
		});
	}
	
	var togglePropertyWindow = function() {
		if ($('#page-property').hasClass('expand') )
		{
			// Toggle to close
			$('#page-property').removeClass('expand');
			$('#propertyToggleButton > span').removeClass('fa-times-circle-o').addClass('fa-arrow-circle-o-left');
		} else {
			// Toggle to open
			$('#page-property').addClass('expand');
			$('#propertyToggleButton > span').addClass('fa-times-circle-o').removeClass('fa-arrow-circle-o-left');
		}
	}
	
	var init = function() {
		// Advanced groups
		[
		{
			name: 'advanced',
			pull: 'clone',
			put: false
		},
		{
			name: 'advanced',
			pull: 'clone',
			put: false
		},
		{
			name: 'advanced',
			pull: 'clone',
			put: false
		}].forEach(function (groupOpts, i) {
			console.log('advanced-' + (i + 1));
			
			Sortable.create(byId('advanced-' + (i + 1)), {
				sort: false,
				group: groupOpts,
				animation: 150
			});
		});
		
		makeSortable('page-body-container');  // Initialize the drop area to receive page-blocks
		
		// Property Window toggle button
		$('.property-toggle').on('click', function() {
			togglePropertyWindow();
		});
		
		// Detect changes in focused container and display its corresponding property panel 
		watch(page, 'activeBlockId', function(prop, action, newvalue, oldvalue) {			
			$.each(blockArray, function() {
				var block = this;				
				if (block.id != newvalue)
				{
					block.isNotActiveBlock = true;
				} else {
					block.isNotActiveBlock = false;
				}
			});
		});
		
		// Preload the templates
		$.get('templates/blockproperty-template.hbs', function (data) {
		    blockpropertyTemplate=Handlebars.compile(data);
		}, 'html');
		
		// Bring up the bottom area
		$('#menu').on('click', function() {
			$('#drop-area').addClass('show');
			$('#main-content').addClass('away');
		});
		// Scale down the main-content div
		$('.drop-overlay').on('click', function() {
			$('#drop-area').removeClass('show');
			$('#main-content').removeClass('away');
		});
	}
	init();

	
})(window);