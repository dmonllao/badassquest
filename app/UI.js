define(['bs'], function($) {


    return {

        getActionButtonStyle: function(index) {
            var styles = ['btn-success', 'btn-warning', 'btn-primary', 'btn-info', 'btn-danger'];
            if (typeof styles[index] !== "undefined") {
                return styles[index];
            }
            // Mod otherwise.
            return styles[index % styles.length];
        },

        renderActionButtons: function(buttons) {
            var html = '<div class="action-buttons">';
            for (var i in buttons) {
                html = html + '<button id="' + buttons[i].id + '" class="btn ' +
                    this.getActionButtonStyle(i) + '">' + buttons[i].text + '</button>';
            }
            html = html + '</div>';
            return html;
        }
    }
});
