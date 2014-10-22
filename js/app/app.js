var initCallbacks = [];

(function($){
    initCallbacks.push(function() {
        $('body').on("click", "._submit", function(e) {
            var $t = $(this),
                name = $t.data('submit-name'),
                value = $t.data('submit-value');

            if ($t.is('input')) {
                if (!name) {
                    name = $t.attr('name');
                }

                if (!value) {
                    value = $t.val();
                }
            } else {
                if (!value) {
                    value = $t.text();
                }
            }

            var $form = $(this).parents('form').first();

            var $hidden = $form.find('input[name=' + name + '][type=hidden]');

            if (!$hidden.length) {
                $hidden = $('<input type="hidden" name="' + name + '" />').appendTo($form);
            }

            $hidden.val(value);

            $form.submit();

            e.preventDefault();
        });
    });
    
    
    $(document).ready(function(){
        for(var i in initCallbacks){ initCallbacks[i](); }
    });

    $.extend({
        app: {
            urlPrefix: null
        },

        service: {
            url: null,
            call: function(command, data, callback){
                $.ct.callService($.service.url, command, data, callback);
            }
        },

        initContainer: function($container){
            $container.find('.CT_LayerLink').each(function(i, e){ $(e).CT_LayerLink(); });
            $container.find('form.CT_LayerForm').each(function(i, e){
                    $(e).CT_LayerForm({layer: $container.data('CT_Layer') });
            });
        }
    });
})(jQuery);