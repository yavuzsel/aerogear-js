(function( aerogear, $, undefined ) {
    /**
     * aerogear.ajax( caller[, options] ) -> Object
     * - caller (Object): the AeroGear object (pipe, datamanager, etc.) that is calling aerogear.ajax
     * - options (Object): settings for jQuery.ajax
     *
     * Returns a promise similar to the promise returned by jQuery.ajax
     **/
    aerogear.ajax = function( caller, options ) {
        var deferred = $.Deferred( function() {
            var that = this,
                settings = $.extend( {}, {
                    contentType: "application/json",
                    dataType: "json"
                }, options );

            this.done( settings.success );
            this.fail( settings.error );
            this.always( settings.complete );

            var ajaxSettings = $.extend( {}, settings, {
                success: function( data, textStatus, jqXHR ) {
                    that.resolve( typeof data === "string" && ajaxSettings.dataType === "json" ? JSON.parse( data ) : data, textStatus, jqXHR );
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if ( ajaxSettings.dataType === "json" ) {
                        try {
                            jqXHR.responseJSON = JSON.parse( jqXHR.responseText );
                        } catch( error ) {}
                    }
                    that.reject( jqXHR, textStatus, errorThrown );
                },
                complete: function( jqXHR, textStatus ) {
                    that.resolve( jqXHR, textStatus );
                }
            });

            if ( ajaxSettings.contentType === "application/json" && ajaxSettings.data && ( ajaxSettings.type === "POST" || ajaxSettings.type === "PUT" ) ) {
                ajaxSettings.data = JSON.stringify( ajaxSettings.data );
            }

            if ( aerogear.auth && !caller.isAuthenticated() ) {
                this.reject( "auth", "Error: Authentication Required" );
            } else if ( caller.addAuthIdentifier ) {
                $.ajax( caller.addAuthIdentifier( ajaxSettings ) );
            } else {
                $.ajax( ajaxSettings );
            }
        });

        var promise = deferred.promise();

        promise.success = deferred.done;
        promise.error = deferred.fail;
        promise.complete = deferred.always;

        return promise;
    };
})( aerogear, jQuery );
