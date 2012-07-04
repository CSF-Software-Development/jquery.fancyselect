// ==ClosureCompiler==
// @output_file_name jquery.fancyselect.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// @externs_url http://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.js
// ==/ClosureCompiler==
(function($)
{
  $.fn.fancyselect = function(userSettings) {
    this.each(function() {
      createDropdown(userSettings, $(this));
    });
  }
  
  function createDropdown(userSettings, element)
  {
    var
      defaultSettings = {
        classes: {
          container:    "fancyselect",
          dropdown:     "dropdown",
          open:         "open",
          group:        "optiongroup",
          option:       "option",
          selected:     "selected",
          label:        "label",
          highlight:    "highlight"
        },
        label: {
          isStatic:     false,
          staticText:   null,
          emptyText:    "Select",
          multipleText: "Multiple selection"
        },
        speed: 100
      },
      $this = element,
      eventNamespace = ".fancyselect",
      settings = $.extend(true, {}, defaultSettings, userSettings),
      data = {
        toggleSelection: toggleSelection,
        setSelection: setSelection,
        createListOfValues: createListOfValues,
        updateLabel: updateLabel,
        handleOptionClick: handleOptionClick,
        handleLabelClick: handleLabelClick,
        multiselect: ($this.attr("multiple") === "multiple"),
        getSelectedValues: getSelectedValues,
        refreshDropdown: refreshDropdown,
        openDropdown: openDropdown,
        closeDropdown: closeDropdown,
        toggleDropdown: toggleDropdown,
        opened: false,
        root: buildFancySelect()
      },
      root = data.root;
    
    $this.data("fancyselect", data);
    
    $("." + settings.classes.dropdown + " ." + settings.classes.option, root)
      .bind("click" + eventNamespace, handleOptionClick);
    
    $this.hide().after(root);
    $("." + settings.classes.label, root)
      .bind("click" + eventNamespace, handleLabelClick)
      .bind("keydown" + eventNamespace, function(event) {
        if(event.which == 40)
        {
          selectNext();
          event.preventDefault();
        }
        else if(event.which == 38)
        {
          selectPrevious();
          event.preventDefault();
        }
        else if(event.which == 32)
        {
          event.preventDefault();
          if(data.opened)
          {
            var highlightedOption = $("." + settings.classes.option + "." + settings.classes.highlight, root);
            if(highlightedOption.length == 1)
            {
              data.handleOptionClick(null, highlightedOption);
            }
            else
            {
              data.closeDropdown();
            }
          }
          else
          {
            data.openDropdown();
          }
        }
        else if(event.which == 27 && data.opened)
        {
          data.closeDropdown();
          event.preventDefault();
        }
        else if(event.which == 9 && data.opened)
        {
          data.closeDropdown();
        }
      });
    $("." + settings.classes.dropdown, root).hide();
    data.updateLabel(data.getSelectedValues());
    $(document).bind("click" + eventNamespace, function(event) {
      data.closeDropdown();
    });
    
    function buildFancySelect()
    {
      var output = $('<div class="' + settings.classes.container + '" />');
      
      output.append('<a href="#" class="' + settings.classes.label + '">' + settings.label.emptyText + '</a>' +
                    '<div class="' + settings.classes.dropdown + '" />');
      
      var dropdown = $("." + settings.classes.dropdown, output);
      
      $this.children().each(function() {
        var element = $(this);
        if(element.is("optgroup"))
        {
          var group = $('<fieldset class="' + settings.classes.group + '">' +
                        '<legend>' + element.attr("label") + '</legend>' +
                        '</fieldset>');
          
          element.children().each(function() {
            var optionElement = $(this);
            if(!optionElement.is("option"))
            {
              throw {
                message: "Unrecognised element within an HTML 'optgroup' element",
                element: optionElement
              };
            }
            
            group.append(buildOption(optionElement));
          });
          
          dropdown.append(group);
        }
        else if(element.is("option"))
        {
          dropdown.append(buildOption(element))
        }
        else
        {
          throw {
            message: "Unrecognised element within an HTML 'select' element",
            element: element
          };
        }
      });
      
      function buildOption(element)
      {
        var anchor = $('<div class="' + settings.classes.option + '">' + element.text() + '</div>')
                      .data("fancyselect", new option(element.attr("value"), element.text()));
        if(element.attr("selected") === "selected")
        {
          anchor.addClass(settings.classes.selected);
        }
        element.data("fancyselect", { anchor: anchor });
        anchor.bind("mouseover" + eventNamespace, function() {
          $("." + settings.classes.option, root).removeClass(settings.classes.highlight);
          $(this).addClass(settings.classes.highlight);
        });
        return anchor;
      }
      
      return output;
    }
    
    function option(value, label)
    {
      this.value = value;
      this.label = label;
    }
    
    function handleOptionClick(event, option)
    {
      if(event)
      {
        event.preventDefault();
        event.stopPropagation();
      }
      if(!option)
      {
        option = $(this);
      }
      
      if(data.multiselect)
      {
        data.toggleSelection(option.data("fancyselect"));
      }
      else
      {
        data.setSelection([ option.data("fancyselect") ]);
        data.closeDropdown();
      }
      
      data.updateLabel(data.getSelectedValues());
      data.refreshDropdown();
      $("." + settings.classes.label, root).focus();
    }
    
    function handleLabelClick(event)
    {
      event.preventDefault();
      event.stopPropagation();
      data.toggleDropdown();
    }
    
    function openDropdown()
    {
      $("." + settings.classes.dropdown, root).slideDown(settings.speed);
      root.addClass(settings.classes.open);
      data.opened = true;
    }
    
    function closeDropdown()
    {
      $("." + settings.classes.dropdown, root)
        .slideUp(settings.speed)
        .find("." + settings.classes.option)
          .removeClass(settings.classes.highlight);
      root.removeClass(settings.classes.open);
      data.opened = false;
    }
    
    function toggleDropdown()
    {
      if(data.opened)
      {
        data.closeDropdown();
      }
      else
      {
        data.openDropdown();
      }
    }
    
    function toggleSelection(value)
    {
      var option = $('option[value="' + value.value + '"]', $this);
      
      if(option.attr("selected") === "selected")
      {
        option.removeAttr("selected");
      }
      else
      {
        option.attr("selected", "selected");
      }
    }
    
    function setSelection(values)
    {
      if(!$.isArray(values))
      {
        $.error("values is not an array.");
      }
      
      $("option", $this).removeAttr("selected");
      
      for(var i = 0; i < values.length; i++)
      {
        $('option[value="' + values[i].value + '"]', $this).attr("selected", "selected");
      }
    }
    
    function refreshDropdown()
    {
      $("." + settings.classes.dropdown + " ." + settings.classes.option, root).removeClass("selected");
      $("option:selected", $this)
        .each(function() {
          $(this).data("fancyselect").anchor.addClass("selected");
        });
    }
    
    function getSelectedValues()
    {
      var output = [];
      
      $("option:selected", $this).each(function() {
        output.push(new option($(this).attr("value"), $(this).text()));
      });
      
      return output;
    }
    
    function updateLabel(selectedValues, labelSettingsOverride)
    {
      var
        labelSettings = $.extend({}, settings.label, labelSettingsOverride),
        labelText = null;
      
      if(!$.isArray(selectedValues))
      {
        $.error("selectedValues is not an array.");
      }
      
      switch(selectedValues.length)
      {
      // Empty selection
      case 0:
        labelText = labelSettings.isStatic? labelSettings.staticText : labelSettings.emptyText;
        break;
        
      // Exactly 1 item selected
      case 1:
        labelText = labelSettings.isStatic? labelSettings.staticText : data.createListOfValues(selectedValues);
        break;
        
      // Multiple selection
      default:
        if(labelSettings.isStatic)
        {
          labelText = labelSettings.staticText;
        }
        else if(labelSettings.multipleText)
        {
          labelText = labelSettings.multipleText;
        }
        else
        {
          labelText = data.createListOfValues(selectedValues);
        }
        break;
      }
      
      root.children("." + settings.classes.label).text(labelText);
    }
    
    function createListOfValues(selectedValues)
    {
      var output = "";
      
      if(!$.isArray(selectedValues))
      {
        $.error("selectedValues is not an array.");
      }
      
      for(var i = 0; i < selectedValues.length; i++)
      {
        output += (selectedValues[i].label + ((i != (selectedValues.length - 1))? ", " : ""));
      }
      
      return output;
    }
    
    function selectNext()
    {
      moveSelection(true);
    }
    
    function selectPrevious()
    {
      moveSelection(false);
    }
    
    function moveSelection(next)
    {
      if(data.opened)
      {
        var
          current = $("." + settings.classes.option + "." + settings.classes.highlight, root),
          newElement = null,
          allOptions = root.find("." + settings.classes.option);
        
        current.removeClass(settings.classes.highlight);
        
        for(var i = 0; i < allOptions.length; i++)
        {
          if(current.length == 0)
          {
            newElement = (next? $(allOptions[0]) : $(allOptions[allOptions.length - 1]));
            break;
          }
          else if(allOptions[i] === current[0])
          {
            if(next)
            {
              newElement = (i == (allOptions.length - 1))? current : $(allOptions[i + 1]);
            }
            else
            {
              newElement = (i == 0)? current : $(allOptions[i - 1]);
            }
            break;
          }
        }
        
        newElement.addClass(settings.classes.highlight);
      }
      else
      {
        if(data.multiselect)
        {
          openDropdown();
        }
        else
        {
          var
            current = $("." + settings.classes.option + "." + settings.classes.selected, root),
            newElement = null,
            allOptions = root.find("." + settings.classes.option);
          
          for(var i = 0; i < allOptions.length; i++)
          {
            if(current.length == 0)
            {
              newElement = (next? $(allOptions[0]) : $(allOptions[allOptions.length - 1]));
              break;
            }
            else if(allOptions[i] === current[0])
            {
              if(next)
              {
                newElement = (i == (allOptions.length - 1))? current : $(allOptions[i + 1]);
              }
              else
              {
                newElement = (i == 0)? current : $(allOptions[i - 1]);
              }
              break;
            }
          }
          
          data.handleOptionClick(null, newElement);
        }
      }
    }
  }
          
  return this;
})(jQuery);