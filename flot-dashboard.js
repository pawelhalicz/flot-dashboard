(function($) {

    function PlotDashboard(placeholder, configUrl, pageOptions) {
        this.placeholder = placeholder;
        this.configUrl = jQuery.trim(configUrl);
        this.pageOptions = pageOptions;
        this.config = null;

        placeholder.text("Loading configuration from: " + configUrl);
        $.ajax({
            dataType: "json",
            url: configUrl,
            success: $.proxy(this.onConfigReceive, this),
            error: $.proxy(this.onConfigError, this)
        });
    }

    PlotDashboard.prototype.onConfigReceive = function(config){
        this.config = config;
        var ok = false;
        try{
            this.rebuildContent();
            this.setupReload();
            ok = true;
        }finally{//don't catch - easier to debug
            if( !ok ){
                this.placeholder.html("<pre>Error while processing configuration: \n\n " + JSON.stringify(config, null, 2) + "</pre>");
            }
        }
    };

    PlotDashboard.prototype.onConfigError = function(){
        this.placeholder.text("Failed to load configuration from: " + this.configUrl)
    };

    PlotDashboard.prototype.rebuildContent = function(){
        this.placeholder.empty();
        this.config.charts.forEach($.proxy(function(chart){
            var chBox = $($("#chart-panel-template").html());

            //set label
            chBox.find('.fd-label').text(chart.label);

            //set height
            var chHolder = chBox.find('.fd-chart');
            chHolder.css("height", chart.height);

            this.placeholder.append(chBox);//apend before initialing chart (dimensions are required)

            //options have default on different levels
            var options = $.extend({}, this.pageOptions, this.config.options, chart.options);

            $.plot(chHolder, chart.data, options);
        }, this));
    };

    PlotDashboard.prototype.setupReload = function(){
        if( this.config.refreshInterval ){
            var left = this.config.refreshInterval;
            $(".fd-refresh-value").text(left);
            $(".fd-refresh").show();
            setInterval(function(){
                left--;
                $(".fd-refresh-value").text(left);
                if( left < 1 ){
                    location.reload();
                }
            }, 1000);
        }
    };

    $.plotDashboard = function(placeholder, configUrl, defaultOptions){
        return new PlotDashboard($(placeholder), configUrl, defaultOptions);
    }
})(jQuery);

