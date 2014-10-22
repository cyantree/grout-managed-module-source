(function($){
    $.ctBaseURL = $('head base').attr('href');
    $.fn.CT_HoverItem = function(){
        var isImage = this.is('img');
        var $t = this;

        this.mouseover(function(){
            if(isImage) $t.attr('src', $t.attr('src').replace(/-normal\./, "-over."));
        });

        this.mouseout(function(){
            if(isImage) $t.attr('src', $t.attr('src').replace(/-over\./, "-normal."));
        });
    };

    $.fn.CT_LayerLink = function(){
        var $t = this;
        this.click(function(e){
            e.preventDefault();

            var url = $t.attr('href');
            var layerID = $t.data('ct-layer-id');
            if(layerID == "this"){
                var $parent = $t.parents(".CT_Layer").first();
                if($parent.length){
                    layerID = $parent.data('CT_Layer').id;
                }
            }
//            if(!layerID) layerID = "default";

            if (url.indexOf('://') === -1 && url.substr(0, 1) !== "/") url = $.ctBaseURL + url;

            var $layers = $(document).data('CT_Layers');
            var $layer = $layers.getByID(layerID);
            $layer.loadURL(url);

            return false;
        });
    };

    $.fn.CT_Layers = function(opt){
        if($(document).data('CT_Layers')) return;

//        var $blocker = $('<div style="width: 100%; height: 100%; position: fixed; background: rgba(0, 0, 0, .8); overflow: hidden; top: 0; left: 0"></div>');

        var $t = this;

        var layers = {};

        var layerCount = 0;

        this.options = $.extend({container: null}, opt);

        this.data('CT_Layers', this);
        $(document).data('CT_Layers', this);

        this.getByID = function(id){
            if(id && layers.hasOwnProperty(id)) return layers[id];

            layerCount++;

            if(!id) id = "CT_Layer_" + layerCount;

            var $layer = $('<div class="CT_Layer" />').CT_Layer({id: id});
            layers[id] = $layer;

            $t.triggerHandler('CT_Layers_LayerCreated', [$layer]);

            return $layer;
        };
    };

    $.fn.CT_Layer = function(options){
        options = $.extend({id: null}, options);

        this.data('CT_Layer', this);
        this.id = options.id;

        var $t = this;
        this.$layers = $(document).data('CT_Layers');
        var visible = false;

        var firstUpdate = true;

        var _contentChanged = function(){
            if(firstUpdate){
                firstUpdate = false;

                $t.triggerHandler('CT_Layer_Created', [$t]);
                $(document).triggerHandler('CT_Layer_Created', [$t]);
            }

            $t.triggerHandler('CT_Layer_ContentChanged', [$t]);
            $(document).triggerHandler('CT_Layer_ContentChanged', [$t]);
        };

        this.setContent = function(content){
            $t.show();

            $t.html(content);

            _contentChanged();
        };

        this.loadURL = function(url, data){
            $t.show();

            $t.load(url, data, function(){
                _contentChanged();
            });
        };

        this.show = function(){
            if(visible) return;

            $t.appendTo($t.$layers);

            $t.triggerHandler('CT_Layer_Show', [$t]);

            visible = true;
        };

        this.hide = function(){
            if(!visible) return;

            $t.triggerHandler('CT_Layer_Hide', [$t]);

            $t.detach();

            visible = false;
        };

        this.close = function(){
            if(!visible) return;

            $t.hide();

            $t.triggerHandler('CT_Layer_Close', [$t]);

            $t.empty();
            visible = false;
        };

        return this;
    };

    $.fn.CT_LayerForm = function(opt){
        var $t = this;
        this.options = $.extend({layer: null}, opt);

        this.ajaxForm({beforeSerialize: function(){
            $t.triggerHandler('CT_LayerForm_Submit', [$t]);
        },success: function(res){
            $t.options.layer.setContent(res);
        }
        });
    };

    $.ctInitFacebook = function(options, facebookInitOptions, callback){
        options = $.extend({language: "en_US"}, options);

        if(!$('div#fb-root').length){
            $('<div id="fb-root" />').appendTo($('body'));

            window.fbAsyncInit = function () {
                window.FB.init(facebookInitOptions);

                if(callback) callback();
            };

            (function (d) {
                var js, id = 'facebook-jssdk';
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement('script');
                js.id = id;
                js.async = true;
                js.src = "//connect.facebook.net/" + options.language + "/all.js";
                d.getElementsByTagName('head')[0].appendChild(js);
            }(document));
        }else{
            if(callback) callback();
        }
    };

    $.ctShuffleArray = function(a){
        var newA = [];
        var count = a.length;
        while(count--){
            newA.push(a.splice(Math.floor(Math.random() * count), 1));
        }

        return newA;
    };

    $.ctIncludeScript = function(url, asynchronous){
        var e = document.createElement('script');
        e.type = 'text/javascript';
        if(asynchronous) e.async = true;
        e.src = url;

        var t = document.getElementsByTagName('script')[0];
        t.parentNode.insertBefore(e, t);
    };

    $.extend({
        ct:{
            escapeHTML: function(text){
                return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            },
            callService: function(url, command, data, callback, id){
                var opt = {
                    type: "POST",
                    url: url,
                    data: {
                        command: JSON.stringify({
                            id: id,
                            command: command,
                            data: data
                        })
                    },
                    cache: false,
                    dataType: "json"
                };
                if(callback){
                    opt.success = function(res){
                        if(callback) callback(res);
                    };
                    opt.error = function(res){
                        if(callback) callback({id: id, success: false, data: [{code: "error", message: null}]});
                    };
                }

                $.ajax(opt);
            },
            getServiceCommandString: function(command, data, id){
                return JSON.stringify({id: id, command: command, data: data});
            },
            redirect: function(url, delay){
                if(delay > 0){
                    setTimeout(function(){
                        window.location.href = url;
                    }, delay * 1000);
                }else window.location.href = url;
            }
        }
    });
})(jQuery);