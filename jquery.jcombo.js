;(function ( $, window, document, undefined ) {
    var pluginName = "jCombo",
		version = "3.0",
        defaults = {   
            url: null,         
            parent: null,
            first_optval : "__jc__",
            input_param: null,
            data: null,
            selected_value : null,
			onLoad: null,
			onChange: null,
            initial_text: "-- Please Select --",            
            method: "GET",
            dataType: "jsonp"
        };        
    function Plugin( element, options ) {
        this.options = $.extend( {}, defaults, options) ;        
        this.element = element;
        this.init();                        
    };    
    Plugin.prototype = {                      
        _addParameter: function(param,value) {
            var xdata = "";
            if(param==null || value == null) return false;
            this.options.data = param + "=" + value;            
			return true;
        },
        _getJson: function(url,cback) {
            var self = this;           
            var mydata = (this.options.orig_data == null) ? "" : this.options.orig_data + "&";
			$.ajax({
				url: url,
				data: mydata + self.options.data,
				type: self.options.dataType,                
				dataType: "jsonp",
				method: self.options.method,
				success: cback
			});   
        },
		_onLoadCall: function() {
			if(this.options.onLoad != null) {
				var f = this.options.onLoad;
				this.options.onLoad = null;
				f();
			}					
		},
        _getData: function(url,cback) {
            var self = this;   
            window.__jcombo_data_cache = (typeof window.__jcombo_data_cache === "undefined") ? {} : window.__jcombo_data_cache;
            var cK = JSON.stringify(url + self.options.orig_data + self.options.data);  
            if (!window.__jcombo_data_cache[cK] ) {
                self._getJson(url,function(data) {
                    window.__jcombo_data_cache[cK] = data;   
                    cback(data);					
					self._onLoadCall();
                });                
            } else setTimeout(function() { 			
				cback(window.__jcombo_data_cache[cK]); 
				self._onLoadCall();
			},0);
        },
        _renderOption: function(v,t,s) {
            var sel = "";
            if(s==true) sel = ' selected="selected"';
            return '<option value="' + v + '"' + sel + '>' + t + '</option>';
        },
        _firstOption: function() {
            if(this.initial_text == "") return "";
            return this._renderOption(this.options.first_optval,this.options.initial_text,false);
        },
        _renderSelect: function(data, selected_value) {
            var response = [];
            if(typeof selected_value == "undefined") selected_value = this.options.first_optval;
            response.push(this._firstOption());
            for(var index in data) {
                var option = data[index];
                response.push(this._renderOption(option.id,option.value,option.id == selected_value));                
            }
            return response.join("");
        },                
        init: function() {                      
            var self = this;            
            this.options.orig_data = (this.options.data == null) ? "" : this.options.data;
            var parent_selected = null;            
            if(this.options.url!=null) {     
                var turl = this.options.url;
                if(this.options.parent!=null) {
                    if(this.options.input_param==null) turl+=parent_selected;                          
                    else this._addParameter(this.options.input_param,parent_selected);
                } 
                this._getData(turl ,function(data) {                                                         
                    $(self.element).html(self._renderSelect(data,self.options.selected_value));
                });                                    
            }           
            if(this.options.parent!=null) {
                var parents = this.options.parent;
                $(parents).each(function(index,elem) {                                              
                     $(elem).bind("change",function() {
                          var value = $(elem).val();
						  if(value == self.options.first_optval) {
                                $(self.element).html(self._firstOption());
                                $(self.element).attr("disabled","disabled");
                          } else { 
						  	 	$(self.element).removeAttr("disabled");								
								if(self.options.input_param!=null) {
									self._addParameter(self.options.input_param,value);
									value = '';									
							    }
						  		self._getData(self.options.url + value, function(data) {                                
								   $(self.element).html(self._renderSelect(data));
								   $(self.element).trigger("change");
								   if(self.options.onChange != null) {
									   self.options.onChange($(elem).val());
								   }
 							   });
						  }
						  
                     });

                });
            };           
        }        
    };
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new Plugin( this, options ));
            }
        });
    };
})( jQuery, window, document );
