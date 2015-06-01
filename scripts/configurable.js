
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/* ==========================================================================
Worker Class
========================================================================== */
function PrimaryWorker(id)
{
	this.id = id;
	this.descriptor;
	this.href;
	this.primaryWorkEmail;
	this.businessTitle;
}

function PrimarySupervisoryOrganization(id) 
{
	this.id = id;
}

/* ==========================================================================
ConfigurableBlock Class
========================================================================== */
function ConfigurableBlock(id)
{
	this.id = id;
}

/* ==========================================================================
ConfigurableSectionBlock Class
========================================================================== */
ConfigurableSectionBlock.prototype = new ConfigurableBlock();

ConfigurableSectionBlock.prototype.constructor = ConfigurableSectionBlock;
// Section Block Constructor
function ConfigurableSectionBlock(id, direction) {
  	// Call the parent constructor, making sure (using Function#call)
  	// that "this" is set correctly during the call
  	ConfigurableBlock.call(this, id);

  	// Initialize our Section-specific properties
  	this.direction = direction;
	this.title = 'Title';
};

ConfigurableSectionBlock.prototype.updateInspectorPanel = function() {
	///// Update Layout-Position Panel
	
	var layoutPositionPanel = $('.inspector.layout-position');
	layoutPositionPanel.show();
	
	// Initialize Position
	var label = $('.layout-position .direction > label');
	label.removeClass('active'); // Reset selection
	if (this.direction == 'y')
	{
		$('.layout-position .direction > label.vertical').addClass('active');
	} else {
		$('.layout-position .direction > label.horizontal').addClass('active');
	}
	label.off('click').on('click', {"configurableSectionBlock": this}, this.updatePageView);
}

ConfigurableSectionBlock.prototype.hideInspectorPanel = function() {
	$('.inspector').hide(); // reset inspector view
}

ConfigurableSectionBlock.prototype.updatePageView = function(event) {
	var configurableSectionBlock = event.data.configurableSectionBlock;
	var $this = $(this);
	
	if ($this.hasClass('vertical'))
	{
		$('#' + configurableSectionBlock.id).addClass('verticalflex');
		$('#' + configurableSectionBlock.id).removeClass('mozart-columns').addClass('mozart-section');
		configurableSectionBlock.direction = 'y';
	} else {
		$('#' + configurableSectionBlock.id).removeClass('verticalflex');
		$('#' + configurableSectionBlock.id).removeClass('mozart-section').addClass('mozart-columns');
		configurableSectionBlock.direction = 'x';
	}
}

/* ==========================================================================
ConfigurableCoreItem Class
========================================================================== */

// Core Text Constructor
function ConfigurableCoreElement(id) {
	// Call the parent constructor, making sure (using Function#call)
  	// that "this" is set correctly during the call
  	ConfigurableBlock.call(this, id);
	
	this.headingType = 'h1';
	this.title = '';
	this.justify_content = 'center';
	this.inspectorElem = {};
}

ConfigurableCoreElement.prototype.updateDomElem = function(domElem, domElemAttr, newvalue, oldvalue, propertyName) {
	switch (domElemAttr)
	{
		case 'html':
			$(domElem).html(newvalue);
		break;
		
		case 'value':
			$(domElem).val(newvalue); // Initialize the value of inspector DOM element
		break;
		
		case 'class':
			if (typeof oldvalue !== 'undefined' && oldvalue != '')
			{
				$(domElem).removeClass(oldvalue);
			}
			$(domElem).addClass(newvalue);
		break;
		
		case 'style':			
			$(domElem).css(propertyName.replace('_', '-'), newvalue);
		break;
	}
}

ConfigurableCoreElement.prototype.bindInspector = function() {
	var propertyName;
	for (propertyName in this.inspectorElem) {
	    var tuple = this.inspectorElem[propertyName];
		var domElem = tuple[0];
		var domElemAttr = tuple[1];
		
		switch (domElemAttr)
		{
			case 'html':
			break;
			
			case 'value':
				domElem.val(this[propertyName]);
			break;
			
			case 'class':
			break;
			
			case 'style':
				
			break;
		}
	}
}

ConfigurableCoreElement.prototype.bindObjPropToDomElem = function(propertyName, domElem, domElemContainer, domElemAttr) {
	//defining a 'watcher' for an attribute
	switch (domElemContainer)
	{
		case 'builder':
			watch(this, propertyName, function(prop, action, newvalue, oldvalue) {
				this.updateDomElem(domElem, domElemAttr, newvalue, oldvalue, propertyName);
			});
		break;
		
		case 'inspector':
			this.inspectorElem[propertyName] = [domElem, domElemAttr];  // Register inspector DOM element to property
			watch(this, propertyName, this.bindInspector); // update insepctor DOM element when property changes
		break;
	}
	
	// Initialization
	this.updateDomElem(domElem, domElemAttr, this[propertyName], '', propertyName);
}

ConfigurableCoreElement.prototype.unbindObjPropToDomElem = function(propertyName, domElem, domElemContainer) {
	switch (domElemContainer)
	{
		case 'builder':
			unwatch(this, propertyName);
		break;
		
		case 'inspector':
			unwatch(this, propertyName, this.bindInspector);
		break;
	}
}

ConfigurableCoreElement.prototype.bindDomElemToObjProp = function(propertyName, domElem) {	
	var obj = this;
	
	if ($(domElem).prop('tagName') == "INPUT")
	{
		$(domElem).on('change', function() {		
			obj[propertyName] = $(domElem).val();
		});
	} else {
		$(domElem).on('blur', function() {  // What if you cut and paste?
			obj[propertyName] = $(domElem).text();
		});
	}
}

ConfigurableCoreElement.prototype.unbindDomElemToObjProp = function(propertyName, domElem) {
	var obj = this;
	
	if ($(domElem).prop('tagName') == "INPUT")
	{
		$(domElem).off('change');
	} else {
		$(domElem).off('blur');
	}
}

ConfigurableCoreElement.prototype.updateInspectorPanel = function() {
	///// Update Core-TextEdit Panel
	var coreTextblockPanel = $('.inspector.core-textblock');
	coreTextblockPanel.show();
	
	var showSelector = '.heading-type, .core-textblock-title';
	// Show Core Element Form
	var coreTextblockRelatedInspector = coreTextblockPanel.find(showSelector);
	coreTextblockRelatedInspector.show();
	// Hide Unrelated Core Element Form
	var coreTextblockNonrelatedInspector = coreTextblockPanel.children().not(showSelector);
	coreTextblockNonrelatedInspector.hide();
	
	// Initialize Position
	var headingTypeSelection = $('.core-textblock .heading-type .btn-group > label');
	headingTypeSelection.removeClass('active'); // Reset selection
	if (typeof this.headingType !== 'undefined' && this.headingType != '')
	{
		$('.core-textblock .heading-type .btn-group > label.' + this.headingType).addClass('active');
	}
	headingTypeSelection.off('click').on('click', {"configurableCoreElement": this}, this.updatePageView);
	
	// Bind textblock-label from textinput form to the JS object label property
	this.bindDomElemToObjProp('title', $('.core-textblock-title > input'), "inspector");
	this.bindObjPropToDomElem('title', $('.core-textblock-title > input'), "inspector", "value");
}

ConfigurableCoreElement.prototype.bindJustifyContentToObjProp = function() {
	// Initialize Position
	var justifyContentSelection = $('.core-textblock .justify-content .btn-group > label');
	justifyContentSelection.removeClass('active'); // Reset selection
	if (typeof this.justify_content !== 'undefined' && this.justify_content != '')
	{		
		$('.core-textblock .justify-content .btn-group > label.' + this.justify_content).addClass('active');
	}
	justifyContentSelection.off('click').on('click', {"configurableCoreElement": this}, this.updateJustifyContent);
}

ConfigurableCoreElement.prototype.hideInspectorPanel = function() {
	$('.inspector').hide(); // reset inspector view
	//this.unbindObjPropToDomElem('title', $('.core-textblock-title'), 'inspector'); // Optional. B/c the function call signature is the same as before 
	
	// Unbinding inspector input from the JS object label property
	this.unbindDomElemToObjProp('title', $('.core-textblock-title > input')); // Stop previously set event listener for the same DOM element
}

ConfigurableCoreElement.prototype.updatePageView = function(event) {
	var configurableCoreElement = event.data.configurableCoreElement;
	var $this = $(this);
	configurableCoreElement.headingType = (!$this.hasClass('none')) ? $this.attr('data-type') : ''; // store the new class setting
}

ConfigurableCoreElement.prototype.updateJustifyContent = function(event) {
	console.log("update justify content");
	
	var configurableCoreElement = event.data.configurableCoreElement;
	var $this = $(this);
	configurableCoreElement.justify_content = $this.attr('data-type');
}

/* ==========================================================================
ConfigurableCoreText Class
========================================================================== */
ConfigurableCoreText.prototype = new ConfigurableCoreElement();
ConfigurableCoreText.prototype.constructor = ConfigurableCoreText;
function ConfigurableCoreText(id)
{
	// Call the parent constructor, making sure (using Function#call)
  	// that "this" is set correctly during the call
  	ConfigurableCoreElement.call(this, id);
}

ConfigurableCoreText.prototype.updateInspectorPanel = function() {
	///// Update Core-TextEdit Panel
	var coreTextblockPanel = $('.inspector.core-textblock');
	coreTextblockPanel.show();
	
	var showSelector = '.core-textblock-url, .core-textblock-title, .justify-content';
	// Show Core Element Form
	var coreTextblockRelatedInspector = coreTextblockPanel.find(showSelector);
	coreTextblockRelatedInspector.show();
	// Hide Unrelated Core Element Form
	var coreTextblockNonrelatedInspector = coreTextblockPanel.children().not(showSelector);
	coreTextblockNonrelatedInspector.hide();
	
	this.bindJustifyContentToObjProp();
	
	// Initialize Position
	var headingTypeSelection = $('.core-textblock .heading-type .btn-group > label');
	headingTypeSelection.removeClass('active'); // Reset selection
	if (typeof this.headingType !== 'undefined' && this.headingType != '')
	{
		$('.core-textblock .heading-type .btn-group > label.' + this.headingType).addClass('active');
	}
	headingTypeSelection.off('click').on('click', {"configurableCoreElement": this}, this.updatePageView);
	
	// Bind textblock-label from textinput form to the JS object label property
	this.bindDomElemToObjProp('title', $('.core-textblock-title > input'), "inspector");
	this.bindObjPropToDomElem('title', $('.core-textblock-title > input'), "inspector", "value");
}


/* ==========================================================================
ConfigurableCoreTextlink Class
========================================================================== */
ConfigurableCoreTextlink.prototype = new ConfigurableCoreText();
ConfigurableCoreTextlink.prototype.constructor = ConfigurableCoreTextlink;
function ConfigurableCoreTextlink(id)
{
	// Call the parent constructor, making sure (using Function#call)
  	// that "this" is set correctly during the call
  	ConfigurableCoreText.call(this, id);
	this.url = '';
} 

ConfigurableCoreTextlink.prototype.updateInspectorPanel = function() {
	///// Update Core-TextEdit Panel
	var coreTextblockPanel = $('.inspector.core-textblock');
	coreTextblockPanel.show();
	
	var showSelector = '.core-textblock-url, .core-textblock-title, .justify-content';
	// Show Core Element Form
	var coreTextblockRelatedInspector = coreTextblockPanel.find(showSelector);
	coreTextblockRelatedInspector.show();
	// Hide Unrelated Core Element Form
	var coreTextblockNonrelatedInspector = coreTextblockPanel.children().not(showSelector);
	coreTextblockNonrelatedInspector.hide();
	
	this.bindJustifyContentToObjProp();
	
	// Bind textblock-label from textinput form to the JS object label property
	this.bindDomElemToObjProp('title', $('.core-textblock-title > input'), "inspector");
	this.bindObjPropToDomElem('title', $('.core-textblock-title > input'), "inspector", "value");
	
	this.bindDomElemToObjProp('url', $('.core-textblock-url > input'), "inspector");
	this.bindObjPropToDomElem('url', $('.core-textblock-url > input'), "inspector", "value");
}

ConfigurableCoreTextlink.prototype.hideInspectorPanel = function() {
	$('.inspector').hide(); // reset inspector view
	//this.unbindObjPropToDomElem('title', $('.core-textblock-title'), 'inspector'); // Optional. B/c the function call signature is the same as before 
	
	// Unbinding inspector input from the JS object label property
	this.unbindDomElemToObjProp('title', $('.core-textblock-title > input')); // Stop previously set event listener for the same DOM element
	this.unbindDomElemToObjProp('url', $('.core-textblock-url > input')); // Stop previously set event listener for the same DOM element
}

/* ==========================================================================
ConfigurableCoreButton Class
========================================================================== */
ConfigurableCoreButton.prototype = new ConfigurableCoreElement();
ConfigurableCoreButton.prototype.constructor = ConfigurableCoreButton;
function ConfigurableCoreButton(id)
{
	// Call the parent constructor, making sure (using Function#call)
  	// that "this" is set correctly during the call
  	ConfigurableCoreElement.call(this, id);
	this.action = '';
	this.actionURI = '';
}

ConfigurableCoreButton.prototype.updateInspectorPanel = function() {
	///// Update Core-TextEdit Panel
	var coreTextblockPanel = $('.inspector.core-textblock');
	coreTextblockPanel.show();
	
	var showSelector = '.core-textblock-title, .core-textblock-dropdown, .justify-content';
	// Show Core Element Form
	var coreTextblockRelatedInspector = coreTextblockPanel.find(showSelector);
	coreTextblockRelatedInspector.show();
	// Hide Unrelated Core Element Form
	var coreTextblockNonrelatedInspector = coreTextblockPanel.children().not(showSelector);
	coreTextblockNonrelatedInspector.hide();
	
	// Initialize Position
	var dropDownMenuSelection = $('.core-textblock-dropdown .btn-group .dropdown-menu a');
	if (typeof this.action !== 'undefined' && this.action != '')
	{
		$('.core-textblock-dropdown .btn-group .btn-label').text(this.action.slice(4).capitalize());
	}
	dropDownMenuSelection.off('click').on('click', {"configurableCoreElement": this}, this.updateButtonAction);
	
	this.bindJustifyContentToObjProp();
	
	// Bind textblock-label from textinput form to the JS object label property
	this.bindDomElemToObjProp('title', $('.core-textblock-title > input'), "inspector");
	this.bindObjPropToDomElem('title', $('.core-textblock-title > input'), "inspector", "value");
}

ConfigurableCoreButton.prototype.hideInspectorPanel = function() {
	$('.inspector').hide(); // reset inspector view
	//this.unbindObjPropToDomElem('title', $('.core-textblock-title'), 'inspector'); // Optional. B/c the function call signature is the same as before 
	
	// Unbinding inspector input from the JS object label property
	this.unbindDomElemToObjProp('title', $('.core-textblock-title > input')); // Stop previously set event listener for the same DOM element
}

ConfigurableCoreButton.prototype.updateButtonAction = function(event) {
	var configurableCoreElement = event.data.configurableCoreElement;
	var $this = $(this);
	configurableCoreElement.action = "btn-" + $this.attr('data-type').toLowerCase(); // store the new action type
	$('.core-textblock-dropdown .btn-group .btn-label').text($this.attr('data-type').capitalize());
}

